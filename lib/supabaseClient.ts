import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://avibyiwrelvnxzctfdfw.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_nUDXhUyIl-Hz66nfmpTsxQ_T6Y6Pm1C";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
