"use server";
import {api,ApiError} from "@/lib/api";
import {revalidatePath} from "next/cache";
import type {Deck} from "@/lib/credits";
export type CreditResult<T=Record<string,never>>={ok:true;data:T}|{ok:false;error:string};
async function write<T>(path:string,body?:unknown):Promise<CreditResult<T>> {
 try {const data=await api<T>(path,{method:"POST",body});revalidatePath("/","layout");return {ok:true,data};}
 catch(e){return {ok:false,error:e instanceof ApiError?e.message:"저장하지 못했어요. 다시 시도해 주세요."};}
}
export async function swipeIdea(id:string,direction:"RIGHT"|"LEFT",reason:string){return write<{reward:number;balance:number;duplicate:boolean;pledges?:number;goal?:number;succeeded?:boolean}>(`/api/credits/campaigns/${encodeURIComponent(id)}/swipe`,{direction,reason});}
export async function prepareSamples(){return write<Deck>("/api/credits/samples");}
export async function announceSuccess(id:string,note:string){return write<{notified:number}>(`/api/credits/campaigns/${encodeURIComponent(id)}/success-note`,{note});}
export async function endIdea(id:string){return write<{closed:boolean}>(`/api/credits/campaigns/${encodeURIComponent(id)}/end`);}
