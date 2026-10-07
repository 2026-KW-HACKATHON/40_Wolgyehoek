import "server-only";
import { api } from "./api";
import type { Media } from "./domain/types";
export interface SwipeCard { id:string; title:string; body:string; target:string; place:string; effect:string; proposerName:string; isSeed:boolean; endsAt:string; remaining:number; media:Media[] }
export interface Deck {enabled:boolean; balance:number; cards:SwipeCard[]}
export interface Voucher {id:string; title:string; cost:number; createdAt:string; usedAt:string|null}
export interface Wallet {enabled:boolean; balance:number; ledger:{amount:number; kind:string; description:string; createdAt:string}[]; vouchers:Voucher[]}
export interface Product {id:string; title:string; shop:string; detail:string; cost:number; category:string}
export interface Campaign {id:string; title:string; endsAt:string; decision:string|null; hidden:boolean; open:boolean; remaining:number; funded:number; returned:number; likes:number; passes:number; responses:{direction:"RIGHT"|"LEFT";reason:string;reward:number;createdAt:string}[]}
export interface Team {enabled:boolean;balance:number;campaigns:Campaign[];ledger?:{amount:number;description:string;createdAt:string}[]}
export const getDeck=()=>api<Deck>("/api/credits/discover");
export const getWallet=()=>api<Wallet>("/api/credits/wallet");
export const getTeam=()=>api<Team>("/api/credits/team");
export const getProducts=()=>api<Product[]>("/api/credits/products");

export interface CreditInsight {campaign:boolean;visible:boolean;accepting:boolean;mine:{direction:"RIGHT"|"LEFT";reason:string;reward:number}|null;total?:number;likes?:number;passes?:number;showRatio?:boolean;responses?:{direction:"RIGHT"|"LEFT";reason:string}[]}
export const getCreditInsight=(id:string)=>api<CreditInsight>(`/api/credits/campaigns/${encodeURIComponent(id)}`);
