import { Heart, TrendingUp, TrendingDown } from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { TransactionItem } from "../components/TransactionItem";
import { AvatarPhoto } from "../components/AvatarPhoto";
import { useCouple } from "../hooks/useCouple";
import { useAuth } from "../hooks/useAuth";
import { usePartnerTransactions } from "../hooks/usePartnerTransactions";
import { fmtIDR } from "../lib/formatCurrency";

export default function PartnerView() {
  const { user } = useAuth();
  const { data: couple } = useCouple();
  const { data: txs, isLoading } = usePartnerTransactions();

  const partnerProfile =
    couple?.user1_id === user?.id ? couple?.user2 : couple?.user1;
  const partnerName = partnerProfile?.display_name || "Pasangan";
  const partnerAvatar = partnerProfile?.avatar_url || undefined;

  const income = (txs || [])
    .filter((t) => parseFloat(t.amount) > 0)
    .reduce((a, b) => a + parseFloat(b.amount), 0);
  const expense = (txs || [])
    .filter((t) => parseFloat(t.amount) < 0)
    .reduce((a, b) => a + parseFloat(b.amount), 0);
  const balance = income - Math.abs(expense);
  return (
    <>
      <div className="min-h-screen pb-28 px-4 pt-6 relative overflow-hidden">
        <div className="flex flex-col items-center pt-4">
          <div className="relative">
            <AvatarPhoto src={partnerAvatar} name={partnerName} size="lg" />
            <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white flex items-center justify-center shadow-pink">
              <Heart size={14} className="text-primary" fill="currentColor" />
            </div>
          </div>
          <h1 className="font-script text-4xl mt-3">{partnerName}</h1>
          <p className="text-xs text-muted-foreground">
            Terhubung sejak{" "}
            {couple?.linked_at
              ? new Date(couple.linked_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "—"}{" "}
            💕
          </p>
        </div>

        <div className="mt-6">
          {/* Balance card utama */}
          <div className="relative rounded-3xl p-5 bg-gradient-pink text-white shadow-pink overflow-hidden mb-3">
            <p className="text-xs uppercase tracking-widest opacity-90">
              Saldo {partnerName}
            </p>
            <p className="font-script text-5xl mt-1 drop-shadow-sm">
              {fmtIDR(balance)}
            </p>
            <p className="text-xs mt-1 opacity-90">
              {(txs || []).length} transaksi bulan ini 💕
            </p>
          </div>

          {/* Mini cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-2xl p-3 border border-emerald-200/60">
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-xs font-semibold">Pemasukan</span>
                <TrendingUp size={14} />
              </div>
              <p className="font-script text-xl mt-1">{fmtIDR(income)}</p>
            </div>
            <div className="glass rounded-2xl p-3 border border-rose-200/60">
              <div className="flex items-center justify-between text-rose-400">
                <span className="text-xs font-semibold">Pengeluaran</span>
                <TrendingDown size={14} />
              </div>
              <p className="font-script text-xl mt-1">
                {fmtIDR(Math.abs(expense))}
              </p>
            </div>
          </div>
        </div>

        <h2 className="font-script text-2xl mt-6">Catatan {partnerName} 💕</h2>
        <p className="text-xs text-muted-foreground mb-3">
          Hanya bisa dilihat — tidak bisa diubah
        </p>

        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl h-16 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && (txs || []).length === 0 && (
          <div className="glass rounded-3xl p-8 text-center">
            <p className="text-4xl mb-2">💕</p>
            <p className="text-muted-foreground">
              Belum ada transaksi dari {partnerName}
            </p>
          </div>
        )}

        <div className="space-y-2.5">
          {(txs || []).map((t) => (
            <TransactionItem key={t.id} tx={t} readOnly />
          ))}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
