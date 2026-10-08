import { IntakeForm } from "@/components/intake/IntakeForm";

export default function NewPage() {
  return <div className="mx-auto w-full max-w-[1200px] px-8 py-8">
    <div className="mb-8">
      <h1 className="text-[28px] font-extrabold tracking-[-0.04em]">아이디어 등록</h1>
      <p className="mt-2 text-sm text-muted-foreground">지난 시도를 살펴보고, 우리 팀의 다음 시도를 정해요.</p>
    </div>
    <IntakeForm />
  </div>;
}
