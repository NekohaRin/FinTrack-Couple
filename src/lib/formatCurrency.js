// Dipakai di seluruh app untuk tampilkan angka sebagai Rupiah
// Contoh: formatCurrency(50000) → "Rp 50.000"
export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Alias untuk backward compatibility
export const fmtIDR = formatCurrency
