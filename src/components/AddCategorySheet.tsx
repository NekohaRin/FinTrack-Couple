import { useState } from "react";
import { X } from "lucide-react";

const EMOJIS = [
  "📱",
  "✈️",
  "🏠",
  "👗",
  "🍰",
  "💎",
  "🎮",
  "🚗",
  "🎁",
  "💄",
  "🏋️",
  "📚",
];

export function AddCategorySheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [emoji, setEmoji] = useState("✨");

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
        <h3 className="font-script text-3xl text-center">Kategori Baru ✦</h3>

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

        <div className="mt-4">
          <input
            placeholder="Nama kategori..."
            className="w-full glass rounded-2xl px-4 py-3 outline-none text-sm focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
          />
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3.5 rounded-full bg-gradient-pink text-white font-semibold shadow-pink"
        >
          Simpan ✨
        </button>
      </div>
    </div>
  );
}
