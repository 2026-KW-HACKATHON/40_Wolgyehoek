export default function Loading() {
  return <div role="status" aria-label="불러오는 중" className="px-3 pt-1">
    <div aria-hidden="true" className="swipe-stage animate-pulse rounded-[22px] bg-muted motion-reduce:animate-none" />
  </div>;
}
