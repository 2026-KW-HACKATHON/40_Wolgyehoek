import { NewCardForm } from "./new-card-form";

export default function NewPage() {
  return <div className="space-y-6 px-4 pb-8 pt-2">
    <h1 className="text-[28px] font-extrabold tracking-[-0.04em]">새 아이디어</h1>
    <NewCardForm />
  </div>;
}
