// Format tanggal transaksi
// Kurang dari 1 hari → "Hari ini"
// 1 hari → "Kemarin"
// 2-3 hari → "2 hari lalu" / "3 hari lalu"
// Lebih dari 3 hari → "Senin, 2 Jun 2026"

export function formatTxDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hari ini'
  if (diffDays === 1) return 'Kemarin'
  if (diffDays <= 3) return `${diffDays} hari lalu`

  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatDate(dateStr) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function formatDateShort(dateStr) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(dateStr))
}