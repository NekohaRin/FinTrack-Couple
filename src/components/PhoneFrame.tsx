import type { ReactNode } from "react";
import { Blobs, FloatingDecor } from "./Decor";

export function PhoneFrame({
  children,
  withNav = false,
  className = "",
}: {
  children: ReactNode;
  withNav?: boolean;
  className?: string;
}) {
  return (
    <div className="min-h-dvh w-full bg-gradient-blush flex justify-center">
      <div
        className={`relative w-full max-w-[430px] min-h-dvh overflow-hidden bg-background/60 ${className}`}
      >
        <Blobs />
        <FloatingDecor />
        <div className={`relative z-10 ${withNav ? "pb-28" : "pb-6"} pt-6 px-5`}>
          {children}
        </div>
      </div>
    </div>
  );
}
