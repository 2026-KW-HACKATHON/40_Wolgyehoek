import { ButtonLink } from "@/components/ui";
export default function NotFound() { return <div className="mx-auto max-w-md space-y-4 px-6 py-20"><h1 className="text-xl font-semibold">카드를 찾을 수 없어요</h1><p className="text-sm text-muted-foreground">주소가 바뀌었거나 운영 정책에 따라 가려진 카드일 수 있어요.</p><ButtonLink href="/" variant="secondary">기록 탐색으로 돌아가기</ButtonLink></div>; }
