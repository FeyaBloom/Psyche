import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://yqfznmgydquogvhepdnc.supabase.co'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_q45aaarqfPC8FhrCNDzxbQ_JmSpNpaV'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)