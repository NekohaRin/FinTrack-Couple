const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Minta izin notifikasi & daftarkan service worker
export async function subscribePushNotification() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notification tidak didukung browser ini')
    return null
  }

  // Minta permission
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    console.warn('Izin notifikasi ditolak')
    return null
  }

  // Ambil service worker registration
  const registration = await navigator.serviceWorker.ready

  // Subscribe ke push
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  })

  return subscription
}

// Unsubscribe dari push
export async function unsubscribePushNotification() {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (subscription) {
    await subscription.unsubscribe()
  }
}

// Cek apakah sudah subscribe
export async function getPushSubscription() {
  if (!('serviceWorker' in navigator)) return null
  const registration = await navigator.serviceWorker.ready
  return registration.pushManager.getSubscription()
}