import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Bagaimana cara menghubungkan pasangan?",
    a: "Buka menu Onboarding dan bagikan kode undangan kamu, atau masukkan kode dari pasangan untuk terhubung.",
  },
  {
    q: "Apakah pasangan bisa mengubah transaksi saya?",
    a: "Tidak. Pasangan hanya bisa melihat transaksi kamu — hanya kamu yang bisa menambah, mengubah, atau menghapus.",
  },
  {
    q: "Bagaimana cara menghapus akun?",
    a: "Buka Privasi & Keamanan → bagian Bahaya untuk menghapus koneksi atau hubungi kami untuk menghapus akun sepenuhnya.",
  },
  {
    q: "Data saya aman?",
    a: "Semua data dienkripsi dan hanya bisa diakses oleh kamu dan pasangan yang terhubung 💕",
  },
  {
    q: "Bagaimana cara ganti tema warna?",
    a: "Buka halaman Profil, lalu pilih warna favoritmu di bagian Tampilan 🎨.",
  },
];

export default function SettingsHelp() {
  const navigate = useNavigate();
  const [open, setOpen] = useState<number | null>(0);

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
        <h1 className="font-script text-3xl">Bantuan 💬</h1>
      </header>

      <div className="space-y-2.5">
        {faqs.map((f, i) => {
          const active = open === i;
          return (
            <button
              key={f.q}
              onClick={() => setOpen(active ? null : i)}
              className="w-full glass rounded-2xl p-4 text-left shadow-soft"
            >
              <div className="flex items-center gap-3">
                <span className="flex-1 text-sm font-bold">{f.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-muted-foreground transition shrink-0 ${active ? "rotate-180" : ""}`}
                />
              </div>
              {active && (
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {f.a}
                </p>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">Butuh bantuan lebih?</p>
        <button className="mt-3 w-full min-h-11 py-3 rounded-full bg-gradient-pink text-white font-semibold shadow-pink">
          Hubungi Kami 💌
        </button>
      </div>
    </div>
  );
}
