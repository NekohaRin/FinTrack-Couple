import { useState } from "react";
import { X, Target } from "lucide-react";
import { supabase } from "../lib/supabase";
import { queryClient } from "../lib/queryClient";
import { fmtIDR } from "../lib/formatCurrency";

export function EditSavingGoalSheet({
  open,
  onClose,
  coupleId,
  currentGoal,
}: {
  open: boolean;
  onClose: () => void;
  coupleId: string;
  currentGoal: number;
}) {
  const [goal, setGoal] = useState(String(currentGoal));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    const parsed = parseInt(goal);
    if (!parsed || parsed <= 0) {
      setError("Target harus lebih dari 0");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: err } = await supabase
        .from("couples")
        .update({ saving_goal: parsed })
        .eq("id", coupleId);

      if (err) throw err;

      queryClient.invalidateQueries({ queryKey: ["couple"] });
      onClose();
    } catch (e: any) {
      setError(e.message || "Gagal menyimpan target");
    } finally {
      setLoading(false);
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
        <h3 className="font-script text-3xl text-center">Target Tabungan 🎯</h3>
        <p className="text-xs text-muted-foreground text-center mt-1">
          Target saat ini: {fmtIDR(currentGoal)}
        </p>

        <div className="mt-6 text-center">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Target Baru
          </div>
          <div className="inline-flex items-baseline gap-1 border-b-2 border-primary px-2 pb-1">
            <span className="font-script text-xl text-primary">Rp</span>
            <input
              autoFocus
              inputMode="numeric"
              value={goal}
              onChange={(e) => setGoal(e.target.value.replace(/\D/g, ""))}
              className="font-script text-5xl bg-transparent outline-none w-44 text-center placeholder:text-primary/30"
            />
          </div>
        </div>

        {/* Quick presets */}
        <div className="mt-4 flex gap-2 justify-center flex-wrap">
          {[1000000, 5000000, 10000000, 25000000, 50000000].map((preset) => (
            <button
              key={preset}
              onClick={() => setGoal(String(preset))}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                parseInt(goal) === preset
                  ? "bg-gradient-pink text-white shadow-pink"
                  : "glass text-muted-foreground"
              }`}
            >
              {fmtIDR(preset)}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-xs text-red-400 text-center mt-3">{error}</p>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          className="mt-6 w-full py-3.5 rounded-full bg-gradient-pink text-white font-semibold shadow-pink disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Simpan Target 🎯"}
        </button>
      </div>
    </div>
  );
}
