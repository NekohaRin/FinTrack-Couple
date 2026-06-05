import { QueryProvider } from './QueryProvider'
import { Router } from './Router'

// App adalah titik paling atas — urutannya penting:
// QueryProvider harus membungkus Router agar semua halaman
// bisa menggunakan React Query (useQuery, useMutation, dll)
function App() {
  return (
    <QueryProvider>
      <Router />
    </QueryProvider>
  )
}

export default App
