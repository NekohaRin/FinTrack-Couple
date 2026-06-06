import { useState } from "react";
import { Plus, Sparkles, Pencil } from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { AddSavingSheet } from "../components/AddSavingSheet";
import { EditSavingGoalSheet } from "../components/EditSavingGoalSheet";
import { useSavings, useSavingsSummary } from "../hooks/useSavings";
import { useCouple } from "../hooks/useCouple";
import { useAuth } from "../hooks/useAuth";
import { AvatarPhoto } from "../components/AvatarPhoto";
import { fmtIDR } from "../lib/formatCurrency";
import { formatTxDate } from "../lib/formatDate";

export default function Tabungan() {
  const [open, setOpen] = useState(false);
  const [openGoal, setOpenGoal] = useState(false);

  const { user } = useAuth();
  const { data: couple } = useCouple();
  const { data: savings, isLoading } = useSavings();
  const { data: summary } = useSavingsSummary();

  const totalSaved = summary?.total || 0;
  const SAVING_GOAL = parseFloat(String(couple?.saving_goal || 5000000));
  const pct = Math.min(100, Math.round((totalSaved / SAVING_GOAL) * 100));

  const partnerProfile =
    couple?.user1_id === user?.id ? couple?.user2 : couple?.user1;
  const myProfile =
    couple?.user1_id === user?.id ? couple?.user1 : couple?.user2;

  const myTotal = (savings || [])
    .filter((s) => s.added_by === user?.id)
    .reduce((a, b) => a + parseFloat(b.amount), 0);

  const partnerTotal = (savings || [])
    .filter((s) => s.added_by !== user?.id)
    .reduce((a, b) => a + parseFloat(b.amount), 0);

  return (
    <>
      <div className="min-h-screen pb-28 px-4 pt-6 relative overflow-hidden">
        <header className="mb-5">
          <h1 className="font-script text-4xl">Tabungan Berdua 💰</h1>
          <p className="text-sm text-muted-foreground">
            Nabung bareng untuk masa depan
          </p>
        </header>

        {/* Main saving card */}
        <div className="glass-pink gold-border rounded-3xl p-5 shadow-pink relative overflow-visible">
          <Sparkles
            size={16}
            className="absolute top-3 right-3 text-yellow-400 anim-twinkle"
          />

          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Total Tabungan
            </p>
            <button
              onClick={() => setOpenGoal(true)}
              className="flex items-center gap-1 text-xs text-primary font-semibold glass px-2 py-1 rounded-full"
            >
              <Pencil size={10} /> Edit Target
            </button>
          </div>

          <p className="font-script text-5xl text-primary mt-1">
            {fmtIDR(totalSaved)}
          </p>

          {/* Progress bar */}
          <div className="mt-3 relative">
            <div className="h-2.5 rounded-full bg-white/60 overflow-visible">
              <div
                className="h-full anim-shimmer rounded-full transition-all duration-700 relative"
                style={{ width: `${Math.max(pct, pct > 0 ? 3 : 0)}%` }}
              >
                {pct > 0 && (
                  <span className="absolute -top-5 right-0 text-[10px] font-bold text-primary whitespace-nowrap">
                    {pct}%
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex -space-x-2">
              <AvatarPhoto
                src={myProfile?.avatar_url}
                name={myProfile?.display_name || "Saya"}
                size="sm"
              />
              <AvatarPhoto
                src={partnerProfile?.avatar_url}
                name={partnerProfile?.display_name || "Pasangan"}
                size="sm"
              />
            </div>
            <span>
              dari target{" "}
              <span className="font-bold text-primary">
                {fmtIDR(SAVING_GOAL)}
              </span>
            </span>
          </div>
        </div>

        {/* Kontribusi */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="glass-pink rounded-2xl p-3 shadow-soft">
            <div className="flex items-center gap-2">
              <AvatarPhoto
                src={myProfile?.avatar_url}
                name={myProfile?.display_name || "Saya"}
                size="sm"
              />
              <span className="text-xs font-semibold text-muted-foreground truncate">
                {myProfile?.display_name || "Saya"}
              </span>
            </div>
            <p className="font-script text-xl mt-1 text-primary">
              {fmtIDR(myTotal)}
            </p>
          </div>
          <div className="glass rounded-2xl p-3 shadow-soft border border-purple-100">
            <div className="flex items-center gap-2">
              <AvatarPhoto
                src={partnerProfile?.avatar_url}
                name={partnerProfile?.display_name || "Pasangan"}
                size="sm"
              />
              <span className="text-xs font-semibold text-muted-foreground truncate">
                {partnerProfile?.display_name || "Pasangan"}
              </span>
            </div>
            <p className="font-script text-xl mt-1 text-primary">
              {fmtIDR(partnerTotal)}
            </p>
          </div>
        </div>

        {/* Riwayat */}
        <h2 className="font-script text-2xl mt-6 mb-3">Riwayat Tabungan 📖</h2>

        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl h-16 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && (savings || []).length === 0 && (
          <div className="glass rounded-3xl p-8 text-center">
            <p className="text-4xl mb-2">💰</p>
            <p className="text-muted-foreground text-sm">
              Belum ada tabungan, yuk mulai menabung!
            </p>
          </div>
        )}

        <div className="space-y-2">
          {(savings || []).map((s) => {
            const isMine = s.added_by === user?.id;
            const who = isMine ? myProfile : partnerProfile;
            const positive = parseFloat(s.amount) > 0;
            return (
              <div
                key={s.id}
                className="glass rounded-2xl p-3 flex items-center gap-3 shadow-soft"
              >
                <AvatarPhoto
                  src={who?.avatar_url}
                  name={who?.display_name || (isMine ? "Saya" : "Pasangan")}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {s.note || "Tabungan"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {who?.display_name || (isMine ? "Saya" : "Pasangan")} •{" "}
                    {formatTxDate(s.date)}
                  </p>
                </div>
                <span
                  className={`text-sm font-bold ${positive ? "text-emerald-600" : "text-rose-400"}`}
                >
                  {positive ? "+" : "−"}{" "}
                  {fmtIDR(Math.abs(parseFloat(s.amount)))}
                </span>
              </div>
            );
          })}
        </div>

        {/* FAB */}
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-4 z-30 h-14 w-14 rounded-full bg-gradient-pink text-white shadow-pink flex items-center justify-center"
        >
          <Plus size={26} strokeWidth={2.6} />
        </button>
      </div>
      <BottomNav />
      <AddSavingSheet open={open} onClose={() => setOpen(false)} />
      <EditSavingGoalSheet
        open={openGoal}
        onClose={() => setOpenGoal(false)}
        coupleId={couple?.id || ""}
        currentGoal={SAVING_GOAL}
      />
    </>
  );
}
