import { NewCardForm } from "./new-card-form";

export default function NewPage() {
  return (
    <div className="mx-auto max-w-[720px]">
      <p className="mb-2 font-mono text-[12px] uppercase tracking-wider text-ink-3">New verification card</p>
      <h1 className="text-[26px] font-semibold tracking-[-0.03em] sm:text-[32px]">아이디어 올리기</h1>
      <p className="mt-2 text-[15px] leading-7 text-ink-2">대충 적어도 괜찮아요. 대상·장소·기대 효과로 정리한 초안을 먼저 보여드리고, 확인한 뒤에 게시돼요.</p>
      <div className="mt-8">
        <NewCardForm />
      </div>
    </div>
  );
}
