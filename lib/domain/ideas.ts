export interface IdeaLabel { key: string; label: string }
export interface IdeaRelated {
  id: string; title: string; status: string; statusLabel: string; year: number;
  origin: string; originLabel: string; sourceTitle: string; sourceUrl: string; zone: string;
  shared: string[]; decision: string | null; reasonTags: string[]; reason: string;
  succeeded: boolean; canTakeOver: boolean; score: number; by?: string;
}
export interface IdeaOutcome { attempts: number; stopped: number; going: number; open: number; reasons: { tag: string; count: number }[]; since: number | null }
export interface IdeaCheck { concepts: IdeaLabel[]; zone: IdeaLabel; topic: string; related: IdeaRelated[]; outcome: IdeaOutcome }
export interface IdeaCell { zone: string; topic: string; count: number; stopped: number; going: number; open: number; ids: string[] }
export interface IdeaCluster { concept: string; conceptLabel: string; zone: string; zoneLabel: string; topic: string; outcome: IdeaOutcome; ideas: IdeaRelated[] }
export interface IdeaMap { zones: IdeaLabel[]; cells: IdeaCell[]; clusters: IdeaCluster[]; total: number }

export const ZONE_SHORT: Record<string, string> = {
  KW_STATION: "광운대역", KW_UNIV: "광운대 앞", SEOKGYE: "석계역", YEONGCHUK: "영축산", GYEONGCHUN: "숲길",
  STREAM: "하천", FACILITY: "복지시설", HOMES: "주거 골목", WIDE: "동 전역",
  WOLGYE_23: "월계2·3동", GONGNEUNG: "공릉동", SANGGYE: "상계동", JUNGGYE: "중계동", HAGYE: "하계동", NOWON: "노원구",
};
export const TOPIC_SHORT: Record<string, string> = { CARE: "돌봄", COMMERCE: "상권", SAFETY: "안전", ENVIRONMENT: "환경", YOUTH: "청년", NEIGHBOR: "이웃" };

export const ORIGIN_LABELS: Record<string, string> = { STUDENT: "학생 프로젝트", POLICY: "구·시 사업", RESIDENT: "주민 제안", PLEDGE: "선거 공약", ORDINANCE: "조례", COUNCIL: "의회 기록" };
