import { useState } from "react";
import { X, Link2, MapPin } from "lucide-react";
import { useAddWishlistItem } from "../hooks/useWishlist";

const CATEGORIES = [
  { key: "electronics", label: "Elektronik", emoji: "📱" },
  { key: "travel", label: "Liburan", emoji: "✈️" },
  { key: "home", label: "Rumah", emoji: "🏠" },
  { key: "fashion", label: "Fashion", emoji: "👗" },
];

const EMOJIS = [
  "🌴",
  "🏠",
  "💍",
  "📷",
  "✈️",
  "🚗",
  "👗",
  "📱",
  "🎮",
  "🏖️",
  "💎",
  "🎁",
];

export function AddWishlistSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [emoji, setEmoji] = useState("🌴");
  const [cat, setCat] = useState("travel");
  const [title, setTitle] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [note, setNote] = useState("");
  const [productLink, setProductLink] = useState("");
  const [mapsLink, setMapsLink] = useState("");
  const [error, setError] = useState("");

  const addWishlist = useAddWishlistItem();

  async function handleSave() {
    if (!title.trim()) {
      setError("Nama impian wajib diisi");
      return;
    }
    if (!targetPrice || parseInt(targetPrice) === 0) {
      setError("Target harga wajib diisi");
      return;
    }
    setError("");
    try {
      await addWishlist.mutateAsync({
        title: title.trim(),
        emoji,
        category: cat,
        target_price: parseInt(targetPrice),
        note: note.trim() || null,
        product_link: productLink.trim() || null,
        maps_link: mapsLink.trim() || null,
      });
      setTitle("");
      setTargetPrice("");
      setNote("");
      setProductLink("");
      setMapsLink("");
      setEmoji("🌴");
      setCat("travel");
      onClose();
    } catch (e: any) {
      setError(e.message || "Gagal menyimpan impian");
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[430px] rounded-t-[2rem] bg-gradient-blush shadow-pink p-6 pb-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center mb-3">
          <div className="h-1.5 w-12 rounded-full bg-primary/30" />
        </div>
        <button
          onClick={onClose}
          className="absolute right-5 top-5 h-8 w-8 rounded-full glass flex items-center justify-center"
        >
          <X size={16} />
        </button>
        <h3 className="font-script text-3xl text-center">Tambah Impian ✨</h3>

        <div className="mt-5">
          <p className="text-xs text-muted-foreground mb-2">Pilih emoji</p>
          <div className="grid grid-cols-6 gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`h-10 w-10 rounded-2xl text-xl flex items-center justify-center transition ${emoji === e ? "bg-gradient-pink shadow-pink scale-110" : "glass"}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nama impian..."
            className="w-full glass rounded-2xl px-4 py-3 outline-none text-sm focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
          />

          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${cat === c.key ? "bg-gradient-pink text-white shadow-pink" : "glass text-muted-foreground"}`}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>

          <div className="glass rounded-2xl px-4 py-3 flex items-baseline gap-1">
            <span className="font-script text-lg text-primary">Rp</span>
            <input
              inputMode="numeric"
              value={targetPrice}
              onChange={(e) =>
                setTargetPrice(e.target.value.replace(/\D/g, ""))
              }
              placeholder="Target harga"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Catatan / deskripsi..."
            rows={2}
            className="w-full glass rounded-2xl px-4 py-3 outline-none text-sm resize-none placeholder:text-muted-foreground"
          />

          <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
            <Link2 size={14} className="text-primary shrink-0" />
            <input
              value={productLink}
              onChange={(e) => setProductLink(e.target.value)}
              placeholder="Link produk (opsional)"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </div>

          <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
            <MapPin size={14} className="text-primary shrink-0" />
            <input
              value={mapsLink}
              onChange={(e) => setMapsLink(e.target.value)}
              placeholder="Link Google Maps (opsional)"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400 text-center mt-2">{error}</p>
        )}

        <button
          onClick={handleSave}
          disabled={addWishlist.isPending}
          className="mt-6 w-full py-3.5 rounded-full bg-gradient-pink text-white font-semibold shadow-pink disabled:opacity-50"
        >
          {addWishlist.isPending ? "Menyimpan..." : "Simpan Impian 💫"}
        </button>
      </div>
    </div>
  );
}
