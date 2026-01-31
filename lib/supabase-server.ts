// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

// This is for client-side use (React components marked with "use client")
export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);