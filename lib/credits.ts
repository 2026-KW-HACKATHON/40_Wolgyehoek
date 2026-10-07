import "server-only";
import { api } from "./api";
import type { Media } from "./domain/types";
export interface SwipeCard { id:string; title:string; body:string; target:string; place:string; effect:string; proposerName:string; isSeed:boolean; endsAt:string; media:Media[]; goal:number; pledges:number; succeededAt:string|null; problem:string; topic:string }
export interface Deck {enabled:boolean; balance:number; cards:SwipeCard[]}
export interface Wallet {enabled:boolean; balance:number; ledger:{amount:number; kind:string; description:string; createdAt:string}[]}
export const getDeck=()=>api<Deck>("/api/credits/discover");
export const getWallet=()=>api<Wallet>("/api/credits/wallet");

export interface CreditInsight {campaign:boolean;visible:boolean;owner:boolean;accepting:boolean;pledges:number;goal:number;succeededAt:string|null;successNote:string|null;mine:{direction:"RIGHT"|"LEFT";reason:string;reward:number}|null;total?:number;likes?:number;passes?:number;showRatio?:boolean;responses?:{direction:"RIGHT"|"LEFT";reason:string}[]}
export const getCreditInsight=(id:string)=>api<CreditInsight>(`/api/credits/campaigns/${encodeURIComponent(id)}`);
