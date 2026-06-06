import { Heart, Star, Sparkles } from "lucide-react";

type Item = {
  icon: "heart" | "star" | "sparkle" | "glyph";
  glyph?: string;
  top: string;
  left: string;
  size: number;
  color: string;
  delay?: string;
  twinkle?: boolean;
};

const DEFAULT_ITEMS: Item[] = [
  {
    icon: "heart",
    top: "8%",
    left: "10%",
    size: 16,
    color: "text-primary/40",
    delay: "0s",
  },
  {
    icon: "sparkle",
    top: "14%",
    left: "82%",
    size: 18,
    color: "text-yellow-400/70",
    delay: "0.6s",
    twinkle: true,
  },
  {
    icon: "glyph",
    glyph: "✦",
    top: "22%",
    left: "5%",
    size: 14,
    color: "text-yellow-400/60",
    delay: "1s",
    twinkle: true,
  },
  {
    icon: "star",
    top: "30%",
    left: "88%",
    size: 12,
    color: "text-primary/40",
    delay: "0.3s",
  },
  {
    icon: "glyph",
    glyph: "✧",
    top: "45%",
    left: "92%",
    size: 16,
    color: "text-yellow-400/70",
    delay: "1.4s",
    twinkle: true,
  },
  {
    icon: "heart",
    top: "55%",
    left: "4%",
    size: 14,
    color: "text-primary/30",
    delay: "0.9s",
  },
  {
    icon: "glyph",
    glyph: "♡",
    top: "68%",
    left: "85%",
    size: 18,
    color: "text-primary/40",
    delay: "1.6s",
  },
  {
    icon: "sparkle",
    top: "78%",
    left: "8%",
    size: 16,
    color: "text-yellow-400/60",
    delay: "0.4s",
    twinkle: true,
  },
  {
    icon: "star",
    top: "88%",
    left: "78%",
    size: 14,
    color: "text-primary/40",
    delay: "1.1s",
  },
  {
    icon: "glyph",
    glyph: "✦",
    top: "92%",
    left: "15%",
    size: 12,
    color: "text-yellow-400/70",
    delay: "0.7s",
    twinkle: true,
  },
];

export function FloatingDecor({ items = DEFAULT_ITEMS }: { items?: Item[] }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
    >
      {items.map((it, i) => {
        const style: React.CSSProperties = {
          top: it.top,
          left: it.left,
          animationDelay: it.delay,
        };
        const cls = `absolute ${it.color} ${it.twinkle ? "anim-twinkle" : "anim-float"}`;
        if (it.icon === "heart")
          return (
            <Heart
              key={i}
              className={cls}
              style={style}
              size={it.size}
              fill="currentColor"
            />
          );
        if (it.icon === "star")
          return (
            <Star
              key={i}
              className={cls}
              style={style}
              size={it.size}
              fill="currentColor"
            />
          );
        if (it.icon === "sparkle")
          return (
            <Sparkles key={i} className={cls} style={style} size={it.size} />
          );
        return (
          <span key={i} className={cls} style={{ ...style, fontSize: it.size }}>
            {it.glyph}
          </span>
        );
      })}
    </div>
  );
}

export function Blobs() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
    >
      <div
        className="absolute -top-24 -left-20 h-72 w-72 rounded-full blur-3xl"
        style={{
          background: "rgba(244, 114, 182, 0.35)",
          animation: "blobMove1 5s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-1/3 -right-24 h-80 w-80 rounded-full blur-3xl"
        style={{
          background: "rgba(251, 191, 36, 0.25)",
          animation: "blobMove2 6s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full blur-3xl"
        style={{
          background: "rgba(244, 114, 182, 0.25)",
          animation: "blobMove3 7s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 h-48 w-48 rounded-full blur-3xl"
        style={{
          background: "rgba(249, 168, 212, 0.30)",
          animation: "blobMove1 5.5s ease-in-out infinite reverse",
        }}
      />
    </div>
  );
}
