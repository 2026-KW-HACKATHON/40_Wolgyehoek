export type Decision = "go" | "hold" | "stop";
export type CardStatus = "open" | "closed" | "go" | "hold" | "stop" | "stale";
export type RespondentType = "resident" | "work_study" | "visitor";
export type Stance = "pro" | "con" | "conditional";
export interface Media { id: string; kind: "IMAGE" | "VIDEO"; contentType: string }
export const MEDIA_MAX = 4;
export const MEDIA_LIMIT_BYTES = { IMAGE: 10 * 1024 * 1024, VIDEO: 50 * 1024 * 1024 } as const;

export const STEP_LABELS = ["괜찮다", "써볼 것 같다", "이 가격이면 쓰겠다", "알림 신청"] as const;
export const RESPONDENT_LABELS: Record<RespondentType, string> = {
  resident: "거주",
  work_study: "직장·학교",
  visitor: "방문",
};
export const STANCE_LABELS: Record<Stance, string> = { pro: "찬성", con: "반대", conditional: "조건부 찬성" };
export const DECISION_LABELS: Record<Decision, string> = { go: "진행", hold: "보류", stop: "중단" };
export const STATUS_LABELS: Record<CardStatus, string> = {
  open: "검증 중",
  closed: "검증 종료",
  go: "진행",
  hold: "보류",
  stop: "중단",
  stale: "정체",
};
export const REASON_TAGS = ["운영 주체 없음", "예산·공간 부족", "수요 부족", "규제·허가", "기타"] as const;
export const DISCLAIMER = "비공식 의견 조사로, 공식 결정이 아니며 대표성을 보장하지 않음";
