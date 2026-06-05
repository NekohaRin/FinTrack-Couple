import { openDB } from 'idb'
import { supabase } from './supabase'
import { queryClient } from './queryClient'

const DB_NAME = 'fintrack-offline'
const STORE = 'pending-transactions'

// Buka/buat IndexedDB
async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'localId' })
      }
    },
  })
}

// Simpan transaksi ke antrian offline
export async function queueTransaction(tx) {
  const db = await getDB()
  const localId = `local_${Date.now()}_${Math.random().toString(36).slice(2)}`
  await db.put(STORE, { ...tx, localId, synced: false, createdAt: new Date().toISOString() })
  console.log('📥 Transaksi disimpan offline:', localId)
  return localId
}

// Ambil semua transaksi yang belum sync
export async function getPendingTransactions() {
  const db = await getDB()
  return db.getAll(STORE)
}

// Hapus transaksi dari antrian setelah sync
export async function removePendingTransaction(localId) {
  const db = await getDB()
  await db.delete(STORE, localId)
}

// Sync semua transaksi pending ke Supabase
export async function syncPendingTransactions(userId) {
  const pending = await getPendingTransactions()
  if (pending.length === 0) return

  console.log(`🔄 Sync ${pending.length} transaksi offline...`)

  for (const tx of pending) {
    try {
      const { localId, synced, createdAt, ...txData } = tx
      const { error } = await supabase
        .from('transactions')
        .insert({ ...txData, user_id: userId })

      if (!error) {
        await removePendingTransaction(localId)
        console.log('✅ Synced:', localId)
      } else {
        console.error('❌ Sync gagal:', error)
      }
    } catch (err) {
      console.error('❌ Error sync:', err)
    }
  }

  // Refresh dashboard setelah sync
  queryClient.invalidateQueries({ queryKey: ['transactions'] })
  queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
}

// Cek jumlah transaksi pending
export async function getPendingCount() {
  const pending = await getPendingTransactions()
  return pending.length
}