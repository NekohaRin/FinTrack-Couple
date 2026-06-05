import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useCouple } from "../hooks/useCouple";
import { supabase } from "../lib/supabase";
import { queryClient } from "../lib/queryClient";
import { signOut } from "../hooks/useAuth";

export default function SettingsPrivacy() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: couple } = useCouple();
  const [share, setShare] = useState(true);
  const [toast, setToast] = useState("");
  const [disconnecting, setDisconnecting] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }

  async function handleDisconnect() {
    const confirmed = window.confirm(
      "Yakin ingin memutuskan koneksi dengan pasangan? Semua data bersama (tabungan, wishlist) akan tetap ada tapi kalian tidak lagi terhubung.",
    );
    if (!confirmed) return;

    setDisconnecting(true);
    try {
      // Update status couple jadi 'disconnected'
      const { error } = await supabase
        .from("couples")
        .update({ status: "disconnected" })
        .eq("id", couple?.id);

      if (error) throw error;

      // Invalidate semua query
      queryClient.clear();

      // Logout dan redirect ke onboarding
      await signOut();
      navigate("/login");
    } catch (err: any) {
      showToast("Gagal memutuskan koneksi");
      console.error(err);
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div
      className="min-h-screen px-4 pt-6 pb-10"
      style={{ background: "#FFF5F9" }}
    >
      <header className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="h-11 w-11 rounded-full glass flex items-center justify-center"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-script text-3xl">Privasi & Keamanan 🔒</h1>
      </header>

      <section className="mt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Akun
        </h2>
        <div className="space-y-2">
          <div className="glass rounded-2xl p-4 flex items-center gap-3 shadow-soft min-h-11">
            <span className="flex-1 text-sm font-semibold">Ubah password</span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
          <div className="glass rounded-2xl p-4 flex items-center gap-3 shadow-soft min-h-11">
            <span className="flex-1 text-sm font-semibold">
              Email terdaftar
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[160px]">
              {user?.email}
            </span>
          </div>
        </div>
      </section>

      <section className="mt-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Data
        </h2>
        <div className="space-y-2">
          <div className="glass rounded-2xl p-4 flex items-center gap-3 shadow-soft min-h-11">
            <span className="flex-1 text-sm font-semibold">
              Tampilkan transaksi ke pasangan
            </span>
            <button
              onClick={() => setShare((v) => !v)}
              className={`relative h-6 w-11 rounded-full transition shrink-0 ${share ? "bg-gradient-pink" : "bg-foreground/20"}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${share ? "left-[22px]" : "left-0.5"}`}
              />
            </button>
          </div>
          <button
            onClick={() => showToast("Segera hadir 💕")}
            className="w-full glass rounded-2xl p-4 flex items-center gap-3 shadow-soft min-h-11"
          >
            <span className="flex-1 text-left text-sm font-semibold">
              Export data keuangan
            </span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        </div>
      </section>

      <section className="mt-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Bahaya
        </h2>
        <p className="text-[11px] text-muted-foreground mb-2 px-1">
          Tindakan ini akan menghapus koneksi dengan pasangan. Kamu perlu invite
          ulang untuk terhubung kembali.
        </p>
        <button
          onClick={handleDisconnect}
          disabled={disconnecting || !couple}
          className="w-full min-h-11 py-3 rounded-full border-2 border-rose-300 text-rose-500 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {disconnecting ? "Memutuskan..." : "Putuskan koneksi pasangan"}
        </button>
      </section>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 glass-pink rounded-full px-4 py-2 text-sm shadow-pink">
          {toast}
        </div>
      )}
    </div>
  );
}
