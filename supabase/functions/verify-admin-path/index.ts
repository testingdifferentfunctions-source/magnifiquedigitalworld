import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// The secret admin login path lives ONLY here, as a backend environment
// variable. It is never sent to the client — the client can only ask
// "is the path I'm currently on the admin path?" and receives a boolean.
const ADMIN_LOGIN_PATH = Deno.env.get('ADMIN_LOGIN_PATH') ?? '';

// Constant-time comparison to avoid leaking the secret through timing.
const timingSafeEqual = (a: string, b: string): boolean => {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  const len = Math.max(ab.length, bb.length);
  let diff = ab.length ^ bb.length;
  for (let i = 0; i < len; i++) {
    diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  }
  return diff === 0;
};

const normalize = (p: string): string => {
  const trimmed = p.trim();
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withSlash.length > 1 && withSlash.endsWith('/')
    ? withSlash.slice(0, -1)
    : withSlash;
};

// Very small in-memory rate limit per instance to slow down brute forcing.
const hits = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 60_000;
const MAX_HITS = 30;

const rateLimited = (ip: string): boolean => {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_HITS;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  if (req.method !== 'POST') {
    return json({ valid: false }, 405);
  }

  // No key requirement here: the endpoint only ever answers a boolean and is
  // rate limited below, so it reveals nothing an attacker could not guess.

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (rateLimited(ip)) {
    return json({ valid: false }, 429);
  }

  let path = '';
  try {
    const body = await req.json();
    if (typeof body?.path === 'string' && body.path.length <= 512) {
      path = body.path;
    }
  } catch {
    return json({ valid: false }, 400);
  }

  if (!path || !ADMIN_LOGIN_PATH) {
    return json({ valid: false });
  }

  const valid = timingSafeEqual(normalize(path), normalize(ADMIN_LOGIN_PATH));
  return json({ valid });
});
