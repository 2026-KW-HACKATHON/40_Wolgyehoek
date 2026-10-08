import { common } from "./common";
import { shell } from "./shell";
import { connect } from "./connect";
import { explore } from "./explore";
import { problems } from "./problems";
import { report } from "./report";
import { intake } from "./intake";
import { card } from "./card";
import { me } from "./me";
import { system } from "./system";

const all = { common, shell, connect, explore, problems, report, intake, card, me, system };
type All = typeof all;

const build = <L extends "ko" | "en">(l: L) =>
  Object.fromEntries(Object.entries(all).map(([k, v]) => [k, v[l]])) as { [K in keyof All]: All[K]["ko"] };

export const messages = { ko: build("ko"), en: build("en") };
export type Messages = typeof messages.ko;
