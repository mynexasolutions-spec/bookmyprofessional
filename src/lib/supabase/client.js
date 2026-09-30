import { createBrowserClient } from "@supabase/ssr";

// ponytail: getUser() is a network call and 20+ call sites fire per page load. Cache it for 15s
// (busted on auth change) and keep one client instance. Pass a jwt explicitly to bypass.
let patched = false;

export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!patched && typeof window !== "undefined") {
    patched = true;
    const getUser = client.auth.getUser.bind(client.auth);
    let cache = null;
    client.auth.getUser = (jwt) => {
      if (jwt) return getUser(jwt);
      const now = Date.now();
      if (!cache || now - cache.at > 15000) cache = { at: now, promise: getUser() };
      return cache.promise;
    };
    client.auth.onAuthStateChange(() => {
      cache = null;
    });
  }

  return client;
}
