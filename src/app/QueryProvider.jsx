import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../lib/queryClient'

// Bungkus seluruh app dengan ini agar semua komponen bisa pakai
// useQuery, useMutation, dll dari React Query
export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
