"use server";
import { getT } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/messages/common";
import {api,ApiError} from "@/lib/api";
import {revalidatePath} from "next/cache";
import type {Deck} from "@/lib/credits";
export type CreditResult<T=Record<string,never>>={ok:true;data:T}|{ok:false;error:string};
async function write<T>(path:string,body?:unknown):Promise<CreditResult<T>> {
 const {t}=await getT();
 try {const data=await api<T>(path,{method:"POST",body});revalidatePath("/","layout");return {ok:true,data};}
 catch(e){
  if(e instanceof ApiError){const prefix=Object.keys(t.system.errors).find(key=>key.endsWith(": ")&&e.message.startsWith(key));return {ok:false,error:prefix?t.system.errors[prefix]+e.message.slice(prefix.length):pick(t.system.errors,e.message,e.message)};}
  return {ok:false,error:t.system.saveFailed};
 }
}
export async function swipeIdea(id:string,direction:"RIGHT"|"LEFT",reason:string){return write<{reward:number;balance:number;duplicate:boolean;pledges?:number;goal?:number;succeeded?:boolean}>(`/api/credits/campaigns/${encodeURIComponent(id)}/swipe`,{direction,reason});}
export async function prepareSamples(){return write<Deck>("/api/credits/samples");}
export async function announceSuccess(id:string,note:string){return write<{notified:number}>(`/api/credits/campaigns/${encodeURIComponent(id)}/success-note`,{note});}
export async function endIdea(id:string){return write<{closed:boolean}>(`/api/credits/campaigns/${encodeURIComponent(id)}/end`);}
