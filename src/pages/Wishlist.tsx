import { useState } from "react";
import { Plus, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { BottomNav } from "../components/BottomNav";
import { AddWishlistSheet } from "../components/AddWishlistSheet";
import { AddCategorySheet } from "../components/AddCategorySheet";
import { useWishlist } from "../hooks/useWishlist";
import { fmtIDR } from "../lib/formatCurrency";

const DEFAULT_CATEGORIES = [
  { key: "electronics", label: "Elektronik", emoji: "📱" },
  { key: "travel", label: "Liburan", emoji: "✈️" },
  { key: "home", label: "Rumah", emoji: "🏠" },
  { key: "fashion", label: "Fashion", emoji: "👗" },
];

export default function Wishlist() {
  const [tab, setTab] = useState("all");
  const [openAdd, setOpenAdd] = useState(false);
  const [openCat, setOpenCat] = useState(false);

  const { data: wishes, isLoading } = useWishlist();

  const filtered =
    tab === "all"
      ? wishes || []
      : (wishes || []).filter((w) => w.category === tab);
  const catLabel = (key: string) =>
    DEFAULT_CATEGORIES.find((c) => c.key === key)?.label ?? key;
  const catEmoji = (key: string) =>
    DEFAULT_CATEGORIES.find((c) => c.key === key)?.emoji ?? "✨";

  return (
    <>
      <div className="min-h-screen pb-28 px-4 pt-6 relative overflow-hidden">
        <header className="mb-3">
          <h1 className="font-script text-4xl">Impian Kita ⭐</h1>
          <p className="text-sm text-muted-foreground">
            Tabung bersama untuk hal-hal yang kalian sayang
          </p>
        </header>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 mb-4">
          <button
            onClick={() => setTab("all")}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition ${tab === "all" ? "bg-gradient-pink text-white shadow-pink" : "glass text-muted-foreground"}`}
          >
            Semua
          </button>
          {DEFAULT_CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setTab(c.key)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1 transition ${tab === c.key ? "bg-gradient-pink text-white shadow-pink" : "glass text-muted-foreground"}`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
          <button
            onClick={() => setOpenCat(true)}
            className="shrink-0 h-9 w-9 rounded-full glass gold-border flex items-center justify-center text-primary"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl h-20 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <div className="mt-10 text-center py-12 glass rounded-3xl">
            <p className="text-4xl mb-3">💝</p>
            <p className="font-script text-2xl text-center">
              Belum ada impian, yuk tambahkan! 💕
            </p>
          </div>
        )}

        {/* List */}
        {!isLoading && (
          <div className="space-y-2.5">
            {filtered.map((w) => {
              const saved = parseFloat(String(w.saved_amount || 0));
              const target = parseFloat(String(w.target_price || 1));
              const pct = Math.min(100, Math.round((saved / target) * 100));
              return (
                <Link
                  key={w.id}
                  to={`/wishlist/${w.id}`}
                  className="block glass rounded-2xl p-3 shadow-soft active:scale-[0.99] transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 shrink-0 rounded-full bg-pink-50 gold-border flex items-center justify-center text-2xl">
                      {w.emoji || "✨"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {w.title}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-primary font-semibold">
                        {catEmoji(w.category)} {catLabel(w.category)}
                      </span>
                      {w.note && (
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {w.note}
                        </p>
                      )}
                      <div className="mt-1.5 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-gradient-pink"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {fmtIDR(saved)} / {fmtIDR(target)}
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-primary shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <button
          onClick={() => setOpenAdd(true)}
          className="fixed bottom-24 right-4 z-30 h-14 w-14 rounded-full bg-gradient-pink text-white shadow-pink flex items-center justify-center"
        >
          <Plus size={26} strokeWidth={2.6} />
        </button>
      </div>
      <BottomNav />
      <AddWishlistSheet open={openAdd} onClose={() => setOpenAdd(false)} />
      <AddCategorySheet open={openCat} onClose={() => setOpenCat(false)} />
    </>
  );
}
