// FILE INI HANYA UNTUK TEST — hapus setelah koneksi terkonfirmasi
//
// Cara pakai:
// 1. Import di main.jsx: import './lib/testConnection'
// 2. Jalankan: npm run dev
// 3. Buka browser → lihat Console (F12)
// 4. Kalau muncul "Koneksi Supabase berhasil!" → setup sukses
// 5. Hapus import ini dari main.jsx setelah selesai

import { supabase } from './supabase'

async function testConnection() {
  console.log('Mengecek koneksi Supabase...')

  // Test 1: cek apakah bisa terhubung ke Supabase
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Koneksi GAGAL:', error.message)
    console.error('Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di .env.local sudah benar')
    return
  }

  console.log('Koneksi Supabase berhasil!')
  console.log('Session saat ini:', data.session ? 'Ada (sudah login)' : 'Kosong (belum login)')
}

testConnection()
