import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!url || url === 'YOUR_SUPABASE_URL' || !key || key === 'YOUR_SUPABASE_ANON_KEY' || key === 'YOUR_SUPABASE_PUBLISHABLE_DEFAULT_KEY') {
    // Return a dummy client during build or when keys are missing
    return {} as any;
  }

  return createBrowserClient(url, key)
}
