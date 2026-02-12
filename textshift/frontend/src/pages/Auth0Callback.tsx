import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { createAuth0Client } from '@auth0/auth0-spa-js';
import { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_REDIRECT_URI } from '@/lib/auth0';

export default function Auth0Callback() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const client = await createAuth0Client({
          domain: AUTH0_DOMAIN,
          clientId: AUTH0_CLIENT_ID,
          authorizationParams: {
            redirect_uri: AUTH0_REDIRECT_URI,
          },
        });

        const result = await client.handleRedirectCallback();
        const accessToken = await client.getTokenSilently();

        const response = await authApi.auth0Callback(accessToken);
        setAuth(response.access_token, response.user);

        const returnTo = result.appState?.returnTo || '/dashboard';
        navigate(returnTo, { replace: true });
      } catch (err: unknown) {
        console.error('Auth0 callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    })();
  }, [navigate, setAuth]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4">
        {error ? (
          <>
            <p className="text-rose-400">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-sm text-gray-400">Completing sign in...</p>
          </>
        )}
      </div>
    </div>
  );
}
