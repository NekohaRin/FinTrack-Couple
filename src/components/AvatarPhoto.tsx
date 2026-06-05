type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-20 w-20 text-xl",
};

export function AvatarPhoto({
  src,
  name,
  size = "md",
  className = "",
}: {
  src?: string;
  name: string;
  size?: Size;
  className?: string;
}) {
  const initial = name?.[0]?.toUpperCase() ?? "?";
  const base = `${SIZES[size]} rounded-full ring-2 ring-yellow-400/60 shadow-pink shrink-0 overflow-hidden inline-flex items-center justify-center bg-gradient-pink text-white font-bold ${className}`;

  if (src) {
    // Tambahkan timestamp untuk bypass cache browser
    const cacheBustedSrc = src.includes('?') 
      ? `${src}&t=${Date.now()}` 
      : `${src}?t=${Date.now()}`;
    
    return (
      <span className={base}>
        <img
          src={cacheBustedSrc}
          alt={name}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </span>
    );
  }
  return <span className={base}>{initial}</span>;
}
