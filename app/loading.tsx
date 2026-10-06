export default function Loading() {
  return <div role="status" aria-label="화면을 불러오는 중" className="mx-auto max-w-[1280px] space-y-6 px-4 py-7 sm:px-8">
    <span className="sr-only">동네의 기록을 불러오고 있어요.</span>
    <div aria-hidden="true" className="animate-pulse space-y-6 motion-reduce:animate-none"><div className="h-4 w-48 rounded bg-muted" /><div className="h-72 rounded-[24px] bg-muted" /><div className="grid grid-cols-3 gap-4">{[0, 1, 2].map(i => <div key={i} className="h-16 rounded-xl bg-muted" />)}</div><div className="h-24 rounded-2xl bg-muted" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map(i => <div key={i} className="h-60 rounded-2xl bg-muted" />)}</div></div>
  </div>;
}
