import { NewCardForm } from "./new-card-form";
import { PageHeaderBar } from "@/components/PageHeaderBar";
export default function NewPage() {
  return <><PageHeaderBar title="아이디어 올리기" /><div className="mx-auto max-w-[800px] space-y-6 px-4 py-6 sm:px-8"><p className="text-sm leading-6 text-muted-foreground">자유롭게 적어 주세요. 대상·장소·기대 효과로 정리한 초안을 먼저 보여드리고, 확인한 뒤에 게시돼요.</p><NewCardForm /></div></>;
}
