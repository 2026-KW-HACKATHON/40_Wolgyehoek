import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={cn("size-8 shrink-0", className)}>
    <path d="M5 7.5h22v18H5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M3 4.5h26v6H3z" fill="currentColor" />
    <path d="M12 16h8M5 21h22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M13 25.5v3m6-3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>;
}
