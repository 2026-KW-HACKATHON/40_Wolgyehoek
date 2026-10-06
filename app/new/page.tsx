import { NewCardForm } from "./new-card-form";
import { Lightbulb, PencilLine, Send, Sparkles } from "lucide-react";

export default function NewPage() {
  return <div className="mx-auto max-w-[880px] space-y-8 px-4 py-7 sm:px-8 sm:py-10">
    <header className="border-b border-border/70 pb-7"><p className="mb-4 flex items-center gap-2 text-xs font-semibold text-primary"><Lightbulb className="size-4" />우리 동네의 다음 아이디어</p><h1 className="text-[30px] font-semibold leading-snug tracking-[-0.035em] sm:text-[38px]">작은 생각에서<br />동네의 변화가 시작돼요.</h1><p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">일상에서 느낀 불편, 함께 해보고 싶은 일을 적어 주세요.<br className="hidden sm:block" />정리된 초안을 직접 확인한 뒤, 이웃의 반응을 받을 수 있어요.</p></header>
    <ol aria-label="아이디어 등록 안내" className="grid grid-cols-3 gap-2 text-xs sm:gap-4">{[{ icon: PencilLine, label: "생각 적기" }, { icon: Sparkles, label: "초안 확인" }, { icon: Send, label: "이웃에게 공유" }].map(({ icon: StepIcon, label }, i) => { return <li key={label} className="flex flex-col gap-2 rounded-xl bg-[var(--brand-soft)] p-3 sm:flex-row sm:items-center"><StepIcon className="size-4 text-primary" /><span className="font-medium">{i + 1}. {label}</span></li>; })}</ol>
    <NewCardForm />
    <p className="text-xs leading-5 text-muted-foreground">초안은 직접 고칠 수 있어요. 이름·연락처 등 개인 정보는 본문에 적지 않아도 됩니다.</p>
  </div>;
}
