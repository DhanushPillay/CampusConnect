import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// For client components / public facing
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server API routes where RLS needs to be bypassed or admin operations are needed
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
