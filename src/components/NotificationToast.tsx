import { useEffect, useState } from "react";
import { Heart, X } from "lucide-react";

type Notif = {
  id: string;
  message: string;
  emoji: string;
};

let addNotifFn: ((notif: Omit<Notif, "id">) => void) | null = null;

export function triggerNotif(notif: Omit<Notif, "id">) {
  addNotifFn?.(notif);
}

export function NotificationToast() {
  const [notifs, setNotifs] = useState<Notif[]>([]);

  useEffect(() => {
    addNotifFn = (notif) => {
      const id = Math.random().toString(36).slice(2);
      setNotifs((prev) => [...prev, { ...notif, id }]);
      setTimeout(() => {
        setNotifs((prev) => prev.filter((n) => n.id !== id));
      }, 4000);
    };
    return () => {
      addNotifFn = null;
    };
  }, []);

  if (notifs.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-[400px]">
      {notifs.map((n) => (
        <div
          key={n.id}
          className="glass-pink gold-border rounded-2xl px-4 py-3 flex items-center gap-3 shadow-pink animate-in slide-in-from-top duration-300"
        >
          <span className="text-xl shrink-0">{n.emoji}</span>
          <p className="flex-1 text-sm font-semibold text-primary">
            {n.message}
          </p>
          <button
            onClick={() =>
              setNotifs((prev) => prev.filter((x) => x.id !== n.id))
            }
            className="h-6 w-6 rounded-full glass flex items-center justify-center shrink-0"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
