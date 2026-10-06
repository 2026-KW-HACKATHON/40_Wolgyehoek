import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { api } from "./api";

export const DEVICE_COOKIE = "dn_device";
export interface Device { id: string; nickname: string; isOperator: boolean }
export const currentDevice = cache(async (): Promise<Device | null> => {
  const id = (await cookies()).get(DEVICE_COOKIE)?.value;
  if (!id || !/^d_[0-9a-f]{16}$/.test(id)) return null;
  const me = await api<{ nickname: string; operator: boolean }>("/api/me");
  return { id, nickname: me.nickname, isOperator: me.operator };
});
export async function requireDevice(): Promise<Device> {
  const me = await currentDevice();
  if (!me) throw new Error("기기 정보를 확인할 수 없어요. 새로고침 후 다시 시도해 주세요.");
  return me;
}
