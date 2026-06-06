import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { usePushNotification } from "../hooks/usePushNotification";

const items = [
  {
    key: "tx",
    label: "Transaksi pasangan",
    desc: "Notif saat pasangan menambahkan transaksi",
  },
  {
    key: "saving",
    label: "Tabungan baru",
    desc: "Notif saat ada yang menabung",
  },
  { key: "wish", label: "Wishlist update", desc: "Notif perubahan wishlist" },
  { key: "monthly", label: "Pengingat bulanan", desc: "Rekap akhir bulan" },
];

export default function SettingsNotifications() {
  const { isSubscribed, loading, subscribe, unsubscribe } = usePushNotification()
  const navigate = useNavigate();
  const [state, setState] = useState<Record<string, boolean>>({
    tx: true,
    saving: true,
    wish: false,
    monthly: true,
  });

  return (
    <div className="min-h-screen px-4 pt-6 pb-10" style={{ background: "#FFF5F9" }}>
      <header className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="h-11 w-11 rounded-full glass flex items-center justify-center"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-script text-3xl">Notifikasi 🔔</h1>
      </header>

      <div className="space-y-2.5">

        {/* Push Notification Toggle */}
        <div className="glass-pink gold-border rounded-2xl p-4 flex items-center gap-3 shadow-soft">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">Push Notification</div>
            <div className="text-[11px] text-muted-foreground">
              Terima notif meski app ditutup 📲
            </div>
          </div>
          <button
            onClick={isSubscribed ? unsubscribe : subscribe}
            disabled={loading}
            className={`relative h-6 w-11 rounded-full transition shrink-0 disabled:opacity-50 ${
              isSubscribed ? 'bg-gradient-pink' : 'bg-foreground/20'
            }`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
              isSubscribed ? 'left-[22px]' : 'left-0.5'
            }`} />
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground px-1 pb-1">
          Pengaturan notifikasi dalam app
        </p>

        {/* In-app notification toggles */}
        {items.map((it) => (
          <div
            key={it.key}
            className="glass rounded-2xl p-4 flex items-center gap-3 shadow-soft"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">{it.label}</div>
              <div className="text-[11px] text-muted-foreground">{it.desc}</div>
            </div>
            <button
              onClick={() => setState((s) => ({ ...s, [it.key]: !s[it.key] }))}
              className={`relative h-6 w-11 rounded-full transition shrink-0 ${
                state[it.key] ? "bg-gradient-pink" : "bg-foreground/20"
              }`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                state[it.key] ? "left-[22px]" : "left-0.5"
              }`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}