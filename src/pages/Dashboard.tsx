import { useState } from "react";
import { Plus, Star, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { TransactionItem } from "../components/TransactionItem";
import { AddTransactionSheet } from "../components/AddTransactionSheet";
import { fmtIDR } from "../lib/formatCurrency";
import { useDashboardSummary, useTransactions } from "../hooks/useTransactions";
import { useProfile } from "../hooks/useProfile";
import { AvatarPhoto } from "../components/AvatarPhoto";

export default function Dashboard() {
  const [open, setOpen] = useState(false);

  // Fetch data dari Supabase
  const { data: profile } = useProfile();
  const { data: summary, isLoading: loadingSummary } = useDashboardSummary();
  const { data: transactions, isLoading: loadingTxs } = useTransactions();

  // Ambil 10 transaksi terakhir
  const recentTransactions = transactions?.slice(0, 10) || [];

  // Loading state
  if (loadingSummary || loadingTxs) {
    return (
      <div className="min-h-screen pb-28 px-4 pt-6">
        <div className="space-y-3">
          <div className="glass rounded-3xl h-32 animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-2xl h-20 animate-pulse" />
            <div className="glass rounded-2xl h-20 animate-pulse" />
          </div>
          <div className="glass rounded-2xl h-20 animate-pulse" />
          <div className="glass rounded-2xl h-20 animate-pulse" />
        </div>
      </div>
    );
  }

  const income = summary?.income || 0;
  const expense = summary?.expense || 0;
  const balance = summary?.balance || 0;
  const displayName = profile?.display_name || "Kamu";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <div className="min-h-screen pb-28 px-4 pt-6 relative overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-muted-foreground">
              Selamat datang kembali
            </p>
            <h1 className="font-script text-3xl leading-tight">
              Hei, {displayName} ✨
            </h1>
          </div>
          <AvatarPhoto src={profile?.avatar_url} name={displayName} size="md" />
        </header>

        {/* Balance card */}
        <div className="relative rounded-3xl p-5 bg-gradient-pink text-white shadow-pink overflow-hidden">
          <Sparkles
            className="absolute top-3 right-3 text-yellow-300 anim-twinkle"
            size={18}
          />
          <span
            className="absolute bottom-3 left-4 text-yellow-300 text-lg anim-twinkle"
            style={{ animationDelay: "0.6s" }}
          >
            ✦
          </span>
          <span className="absolute top-1/2 left-2 text-white/40 anim-float">
            ♡
          </span>
          <p className="text-xs uppercase tracking-widest opacity-90">
            Saldo Bulan Ini
          </p>
          <p className="font-script text-5xl mt-1 drop-shadow-sm">
            {fmtIDR(balance)}
          </p>
          <p className="text-xs mt-1 opacity-90">
            {transactions?.length || 0} transaksi bulan ini 💕
          </p>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="glass rounded-2xl p-3 border border-emerald-200/60">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-xs font-semibold">Pemasukan 💚</span>
              <TrendingUp size={14} />
            </div>
            <p className="font-script text-2xl mt-1">{fmtIDR(income)}</p>
          </div>
          <div className="glass rounded-2xl p-3 border border-rose-200/60">
            <div className="flex items-center justify-between text-rose-400">
              <span className="text-xs font-semibold">Pengeluaran 🌸</span>
              <TrendingDown size={14} />
            </div>
            <p className="font-script text-2xl mt-1">
              {fmtIDR(Math.abs(expense))}
            </p>
          </div>
        </div>

        {/* Transactions */}
        <div className="mt-6 flex items-center justify-between">
          <h2 className="font-script text-2xl">Transaksi Terakhir ✦</h2>
          <button className="text-xs text-primary font-semibold">
            Lihat semua
          </button>
        </div>

        {/* Empty state */}
        {recentTransactions.length === 0 ? (
          <div className="mt-8 text-center py-12 glass rounded-3xl">
            <p className="text-4xl mb-3">💸</p>
            <p className="text-muted-foreground mb-2">Belum ada transaksi</p>
            <p className="text-xs text-muted-foreground">
              Tap tombol + untuk menambah transaksi pertamamu
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-2.5">
            {recentTransactions.map((t) => (
              <TransactionItem key={t.id} tx={t} />
            ))}
          </div>
        )}

        {/* FAB */}
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-4 z-30 h-14 w-14 rounded-full bg-gradient-pink text-white shadow-pink flex items-center justify-center"
        >
          <Plus size={26} strokeWidth={2.6} />
          <Star
            size={12}
            className="absolute -top-1 -right-1 text-yellow-300 anim-twinkle"
            fill="currentColor"
          />
        </button>
      </div>

      <BottomNav />
      <AddTransactionSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
