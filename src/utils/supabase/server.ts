import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies as getCookies } from 'next/headers';

export async function createServerClient() {
  const cookieStore = await getCookies();

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: { path?: string; maxAge?: number }) {
          getCookies().then(store => store.set(name, value, options));
        },
        remove(name: string, options: { path?: string }) {
          getCookies().then(store => store.delete({ name, ...options }));
        }
        
      },
    }
  );
}
