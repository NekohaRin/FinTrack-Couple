import { createClient } from '@supabase/supabase-js'

// import.meta.env membaca dari file .env.local
// Kalau undefined, artinya .env.local belum diisi atau nama variabel salah
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL atau Anon Key belum diisi di .env.local')
}

// createClient membuat satu instance koneksi ke Supabase
// File ini diimport ke semua feature yang butuh akses database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Session disimpan di localStorage agar tidak logout saat refresh
    persistSession: true,
    // Auto refresh token sebelum expired — user tidak perlu login ulang
    autoRefreshToken: true,
  },
})
