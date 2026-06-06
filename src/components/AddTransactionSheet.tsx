import { useState } from "react";
import { X, Pencil, Calendar, WifiOff } from "lucide-react";
import { useAddTransaction } from "../hooks/useTransactions";
import { useAuth } from "../hooks/useAuth";
import { useCategories } from "../hooks/useCategories";
import { queueTransaction } from "../lib/offlineQueue";

export function AddTransactionSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [cat, setCat] = useState("");
  const [error, setError] = useState("");
  const [savedOffline, setSavedOffline] = useState(false);

  const addTransaction = useAddTransaction();
  const { user } = useAuth();
  // Ambil semua kategori (personal & shared) tanpa filter scope
  const { data: dbCategories = [], isLoading: catLoading } = useCategories(null);

  async function handleSave() {
    if (!amount || parseInt(amount) === 0) {
      setError("Masukkan jumlah");
      return;
    }
    setError("");

    const finalAmount =
      type === "expense" ? -parseInt(amount) : parseInt(amount);

    // Cari category_id dari kategori DB berdasarkan pilihan user
    const selectedCategory = dbCategories.find((c: any) => c.id === cat) || null;

    const txData = {
      amount: finalAmount,
      note: note.trim() || null,
      date,
      category_id: selectedCategory?.id ?? null,
      type,
    };

    if (!navigator.onLine) {
      // Simpan ke IndexedDB kalau offline
      await queueTransaction({ ...txData, user_id: user?.id });
      setSavedOffline(true);
      setTimeout(() => {
        setSavedOffline(false);
        resetForm();
        onClose();
      }, 1500);
      return;
    }

    // Online — simpan langsung ke Supabase
    try {
      await addTransaction.mutateAsync(txData);
      resetForm();
      onClose();
    } catch (e: any) {
      setError(e.message || "Gagal menyimpan");
    }
  }

  function resetForm() {
    setAmount("");
    setNote("");
    setDate(new Date().toISOString().slice(0, 10));
    setCat("");
    setType("expense");
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[430px] rounded-t-[2rem] bg-gradient-blush shadow-pink p-6 pb-8">
        <div className="flex justify-center mb-3">
          <div className="h-1.5 w-12 rounded-full bg-primary/30" />
        </div>
        <button
          onClick={onClose}
          className="absolute right-5 top-5 h-8 w-8 rounded-full glass flex items-center justify-center"
        >
          <X size={16} />
        </button>

        {/* Offline indicator */}
        {!navigator.onLine && (
          <div className="mb-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-3 py-2">
            <WifiOff size={14} className="text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700 font-medium">
              Offline — data akan disync saat online
            </p>
          </div>
        )}

        <h3 className="font-script text-3xl text-center">
          {savedOffline ? "Tersimpan Offline 📥" : "Transaksi Baru ✦"}
        </h3>

        {!savedOffline && (
          <>
            <div className="mt-5 text-center">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Jumlah
              </div>
              <div className="inline-flex items-baseline gap-1 border-b-2 border-primary px-2 pb-1">
                <span className="font-script text-xl text-primary">Rp</span>
                <input
                  autoFocus
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                  placeholder="0"
                  className="font-script text-5xl bg-transparent outline-none w-44 text-center placeholder:text-primary/30"
                />
              </div>
            </div>

            <div className="mt-5 glass rounded-full p-1 flex">
              <button
                onClick={() => setType("expense")}
                className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${type === "expense" ? "bg-gradient-pink text-white shadow-pink" : "text-muted-foreground"}`}
              >
                Pengeluaran 🌸
              </button>
              <button
                onClick={() => setType("income")}
                className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${type === "income" ? "bg-emerald-300 text-white" : "text-muted-foreground"}`}
              >
                Pemasukan 💚
              </button>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold mb-2 text-muted-foreground">
                Kategori
              </div>
              {catLoading ? (
                <p className="text-xs text-muted-foreground text-center py-2">Memuat kategori...</p>
              ) : dbCategories.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">Belum ada kategori. Tambah di pengaturan.</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {dbCategories.map((c: any) => (
                    <button
                      key={c.id}
                      onClick={() => setCat(c.id)}
                      className={`rounded-2xl py-2.5 flex flex-col items-center gap-0.5 text-[11px] font-medium transition ${
                        cat === c.id ? "bg-gradient-pink text-white shadow-pink" : "glass text-muted-foreground"
                      }`}
                    >
                      <span className="text-lg">{c.icon}</span>
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
                <Pencil size={14} className="text-primary" />
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Catatan manis…"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                />
              </div>
              <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
                <Calendar size={14} className="text-primary" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 text-center mt-2">{error}</p>
            )}

            <button
              onClick={handleSave}
              disabled={addTransaction.isPending}
              className="mt-6 w-full py-3.5 rounded-full bg-gradient-pink text-white font-semibold shadow-pink disabled:opacity-50"
            >
              {addTransaction.isPending ? "Menyimpan..." : "Simpan ✨"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
