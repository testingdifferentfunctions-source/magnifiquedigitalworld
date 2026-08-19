import { lazy, Suspense, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import NotFound from '@/pages/NotFound';

// The login form is only downloaded once the backend confirms that the
// current URL matches the secret admin path stored server-side.
const Auth = lazy(() => import('@/pages/Auth'));

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
  </div>
);

/**
 * Wildcard route handler.
 *
 * The secret admin path is never present in the frontend bundle. This gate
 * simply asks the backend whether the path the visitor typed is the admin
 * login path. Any other unmatched route renders the normal 404 page, so the
 * secret path is indistinguishable from a random URL until the backend says so.
 */
const SecretGate = () => {
  const location = useLocation();
  const [state, setState] = useState<'checking' | 'granted' | 'denied'>('checking');

  useEffect(() => {
    let active = true;
    setState('checking');

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('verify-admin-path', {
          body: { path: location.pathname },
        });
        if (!active) return;
        setState(!error && data?.valid === true ? 'granted' : 'denied');
      } catch {
        if (active) setState('denied');
      }
    })();

    return () => {
      active = false;
    };
  }, [location.pathname]);

  if (state === 'checking') return <Spinner />;
  if (state === 'denied') return <NotFound />;

  return (
    <Suspense fallback={<Spinner />}>
      <Auth />
    </Suspense>
  );
};

export default SecretGate;
