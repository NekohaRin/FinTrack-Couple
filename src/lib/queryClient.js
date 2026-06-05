import { QueryClient } from '@tanstack/react-query'

// QueryClient mengurus cache semua data yang difetch dari Supabase
// Dibuat sekali di sini, dipakai di seluruh app lewat QueryProvider
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data dianggap segar selama 1 menit — tidak refetch otomatis sebelum ini
      staleTime: 1000 * 60,
      // Kalau fetch gagal, coba ulang maksimal 1x (default 3x terlalu banyak)
      retry: 1,
    },
  },
})
