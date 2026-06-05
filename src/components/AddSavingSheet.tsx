import { useState } from "react";
import { X, Pencil, Calendar } from "lucide-react";
import { useAddSaving } from "../hooks/useSavings";

export function AddSavingSheet({
  open,
  onClose,
  wishlistItemId,
}: {
  open: boolean;
  onClose: () => void;
  wishlistItemId?: string;
}) {
  const [type, setType] = useState<"add" | "withdraw">("add");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");

  const addSaving = useAddSaving();

  async function handleSave() {
    if (!amount || parseInt(amount) === 0) {
      setError("Masukkan jumlah tabungan");
      return;
    }
    setError("");
    try {
      const finalAmount =
        type === "withdraw" ? -parseInt(amount) : parseInt(amount);
      await addSaving.mutateAsync({ 
        amount: finalAmount, 
        note, 
        date,
        wishlist_item_id: wishlistItemId || null,
      });
      setAmount("");
      setNote("");
      setDate(new Date().toISOString().slice(0, 10));
      onClose();
    } catch (e: any) {
      setError(e.message || "Gagal menyimpan tabungan");
    }
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
        <h3 className="font-script text-3xl text-center">Tambah Tabungan 💰</h3>

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
            onClick={() => setType("add")}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${type === "add" ? "bg-emerald-300 text-white" : "text-muted-foreground"}`}
          >
            Tambah 💚
          </button>
          <button
            onClick={() => setType("withdraw")}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${type === "withdraw" ? "bg-gradient-pink text-white shadow-pink" : "text-muted-foreground"}`}
          >
            Tarik 🌸
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
            <Pencil size={14} className="text-primary" />
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Catatan..."
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
          disabled={addSaving.isPending}
          className="mt-6 w-full py-3.5 rounded-full bg-gradient-pink text-white font-semibold shadow-pink disabled:opacity-50"
        >
          {addSaving.isPending ? "Menyimpan..." : "Simpan 💕"}
        </button>
      </div>
    </div>
  );
}
