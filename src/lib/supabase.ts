import { createClient } from '@supabase/supabase-js'

// createClient is called lazily at runtime so build-time prerender
// with placeholder env vars does not throw.
export function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton for client-side usage - initialized on first import in the browser
let _supabase: ReturnType<typeof createSupabaseClient> | null = null;

export function getSupabase() {
  if (!_supabase) {
    _supabase = createSupabaseClient();
  }
  return _supabase;
}

// Named export used throughout the codebase
export const supabase = {
  from: (...args: Parameters<ReturnType<typeof createSupabaseClient>['from']>) =>
    getSupabase().from(...args),
  channel: (...args: Parameters<ReturnType<typeof createSupabaseClient>['channel']>) =>
    getSupabase().channel(...args),
  removeChannel: (...args: Parameters<ReturnType<typeof createSupabaseClient>['removeChannel']>) =>
    getSupabase().removeChannel(...args),
};
