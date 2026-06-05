import { fmtIDR } from "../lib/formatCurrency";
import { formatTxDate } from "../lib/formatDate";

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  note?: string;
  date: string;
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  user?: {
    user_id: string;
    display_name: string;
    avatar_url?: string;
  };
}

export function TransactionItem({
  tx,
  readOnly = false,
  showAuthor = false,
}: {
  tx: Transaction;
  readOnly?: boolean;
  showAuthor?: boolean;
}) {
  const income = tx.type === 'income';
  const categoryIcon = tx.category?.icon || '📦';
  const categoryName = tx.category?.name || 'Lainnya';
  const displayName = tx.note || categoryName;
  const authorName = tx.user?.display_name || 'Saya';
  const authorInitial = authorName.charAt(0).toUpperCase();
  
  return (
    <div
      className={`glass rounded-2xl px-3.5 py-3 flex items-center gap-3 shadow-soft ${readOnly ? "opacity-80" : ""}`}
    >
      <div 
        className="h-11 w-11 rounded-2xl bg-pink-50 flex items-center justify-center text-xl shrink-0 gold-border"
        style={tx.category?.color ? { backgroundColor: tx.category.color + '20' } : {}}
      >
        {categoryIcon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{displayName}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
          <span>{categoryName}</span>
          <span className="opacity-50">•</span>
          <span>{formatTxDate(tx.date)}</span>
          {showAuthor && (
            <>
              <span className="opacity-50">•</span>
              <span className="inline-flex items-center gap-1">
                <span className="h-4 w-4 rounded-full bg-gradient-pink text-[9px] text-white flex items-center justify-center font-bold">
                  {authorInitial}
                </span>
                {authorName}
              </span>
            </>
          )}
        </div>
      </div>
      <div
        className={`text-sm font-bold tabular-nums ${income ? "text-emerald-500" : "text-rose-400"}`}
      >
        {income ? "+" : "−"} {fmtIDR(Math.abs(tx.amount))}
      </div>
    </div>
  );
}
