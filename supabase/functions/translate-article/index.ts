import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const allowedLanguages = ["en"];
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Simple in-memory rate limiter (per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 20; // max 20 requests/minute/IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require an authenticated admin user to trigger paid AI translation generation.
    // Anonymous visitors read cached translations directly from the DB via public SELECT policies.
    const authHeader = req.headers.get("Authorization") ?? req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseUrlEnv = Deno.env.get("SUPABASE_URL")!;
    const authClient = createClient(supabaseUrlEnv, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const jwt = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(jwt);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    // Verify admin role via has_role RPC
    const { data: isAdmin, error: roleError } = await authClient.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (roleError || !isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Per-IP rate limiting as additional safety net
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
      || req.headers.get("cf-connecting-ip")
      || "unknown";
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { language, type } = body;

    if (!language) {
      return new Response(JSON.stringify({ error: "Missing language" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!allowedLanguages.includes(language)) {
      return new Response(JSON.stringify({ error: "Unsupported language" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle category translation
    if (type === "categories") {
      const { categoryIds } = body;
      if (!Array.isArray(categoryIds) || categoryIds.length === 0 || categoryIds.length > 50) {
        return new Response(JSON.stringify({ error: "Invalid categoryIds" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      for (const id of categoryIds) {
        if (!uuidRegex.test(id)) {
          return new Response(JSON.stringify({ error: "Invalid category ID" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // Check cache
      const { data: cached } = await supabase
        .from("category_translations")
        .select("category_id, name")
        .eq("language", language)
        .in("category_id", categoryIds);

      const cachedMap: Record<string, string> = {};
      cached?.forEach((t: { category_id: string; name: string }) => {
        cachedMap[t.category_id] = t.name;
      });

      const missingIds = categoryIds.filter((id: string) => !cachedMap[id]);

      if (missingIds.length > 0) {
        // Fetch category names
        const { data: categories } = await supabase
          .from("categories")
          .select("id, name")
          .in("id", missingIds);

        if (categories && categories.length > 0) {
          const namesToTranslate = categories.map((c: { id: string; name: string }) => ({
            id: c.id,
            name: c.name,
          }));

          const langName = language === "en" ? "English" : language;
          const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-lite",
              messages: [
                {
                  role: "system",
                  content: `Translate the following Ukrainian category names to ${langName}. Return ONLY a valid JSON array of objects with "id" and "name" keys. No explanation, no markdown.`,
                },
                {
                  role: "user",
                  content: JSON.stringify(namesToTranslate),
                },
              ],
            }),
          });

          if (response.ok) {
            const aiData = await response.json();
            const rawContent = aiData.choices?.[0]?.message?.content || "";
            try {
              const cleanJson = rawContent.replace(/^```json?\s*\n?/, "").replace(/\n?```\s*$/, "").trim();
              const translated = JSON.parse(cleanJson);
              if (Array.isArray(translated)) {
                for (const item of translated) {
                  if (item.id && item.name) {
                    cachedMap[item.id] = item.name;
                    await supabase.from("category_translations").upsert({
                      category_id: item.id,
                      language,
                      name: item.name,
                    }, { onConflict: "category_id,language" });
                  }
                }
              }
            } catch (e) {
              console.error("Failed to parse category translation:", rawContent, e);
            }
          } else {
            console.error("AI gateway error for categories:", response.status);
          }
        }
      }

      return new Response(JSON.stringify(cachedMap), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle article translation (default)
    const { articleId } = body;

    if (!articleId) {
      return new Response(JSON.stringify({ error: "Missing articleId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!uuidRegex.test(articleId)) {
      return new Response(JSON.stringify({ error: "Invalid article ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check cache
    const { data: cached } = await supabase
      .from("article_translations")
      .select("title, description, content")
      .eq("article_id", articleId)
      .eq("language", language)
      .maybeSingle();

    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch article (only published)
    const { data: article, error: articleError } = await supabase
      .from("articles")
      .select("title, description, content")
      .eq("id", articleId)
      .eq("published", true)
      .single();

    if (articleError || !article) {
      return new Response(JSON.stringify({ error: "Article not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const langName = language === "en" ? "English" : language;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the given Ukrainian text to ${langName}. 
Return ONLY a valid JSON object with keys: "title", "description", "content".
Preserve all HTML tags in the content field exactly as they are.
Do not add any explanation or markdown formatting — just the raw JSON.`,
          },
          {
            role: "user",
            content: JSON.stringify({
              title: article.title,
              description: article.description,
              content: article.content,
            }),
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, try again later" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Translation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";
    
    let translated;
    try {
      const cleanJson = rawContent.replace(/^```json?\s*\n?/, "").replace(/\n?```\s*$/, "").trim();
      translated = JSON.parse(cleanJson);
    } catch {
      console.error("Failed to parse translation:", rawContent);
      return new Response(JSON.stringify({ error: "Failed to parse translation" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = {
      title: translated.title || article.title,
      description: translated.description || article.description,
      content: translated.content || article.content,
    };

    // Cache the translation
    await supabase.from("article_translations").upsert({
      article_id: articleId,
      language,
      ...result,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("translate-article error:", e);
    return new Response(
      JSON.stringify({ error: "An internal error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
