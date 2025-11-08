"use client";

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Show helpful error in development
  if (process.env.NODE_ENV === "development") {
    console.error(`
╔════════════════════════════════════════════════════════════╗
║  ⚠️  Missing Supabase Environment Variables                 ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Please create a .env.local file with:                    ║
║                                                            ║
║  NEXT_PUBLIC_SUPABASE_URL=your_url_here                   ║
║  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here              ║
║                                                            ║
║  See .env.example for detailed instructions.              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
  }

  throw new Error(
    "Missing Supabase environment variables. " +
      "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local"
  );
}

let cachedClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!cachedClient) {
    cachedClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return cachedClient;
}
