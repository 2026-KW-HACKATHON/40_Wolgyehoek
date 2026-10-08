export default function Loading() {
  return <div role="status" aria-label="불러오는 중" className="mx-auto w-full max-w-[1200px] space-y-6 px-8 pt-8">
    <div aria-hidden="true" className="h-10 w-80 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
    <div aria-hidden="true" className="h-[480px] animate-pulse rounded-[22px] bg-muted motion-reduce:animate-none" />
  </div>;
}
