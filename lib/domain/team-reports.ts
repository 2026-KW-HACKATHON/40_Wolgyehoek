import data from "./team-reports.json";
import type { IdeaCheck } from "./ideas";
import type { Precedent } from "./problems";

export interface TeamReport {
  no: number;
  teamName: string;
  service: string;
  category: string;
  summary: string;
  galleryUrl: string;
  check: IdeaCheck | null;
  precedents: Precedent[];
}

export const TEAM_REPORTS = data as TeamReport[];

export const teamReport = (no: number) => TEAM_REPORTS.find((r) => r.no === no) ?? null;
