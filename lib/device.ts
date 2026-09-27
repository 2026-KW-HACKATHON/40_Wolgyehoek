import "server-only";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb, schema } from "./db";

export const DEVICE_COOKIE = "dn_device";

export interface Device {
  id: string;
  nickname: string;
  isOperator: boolean;
}

export async function currentDevice(): Promise<Device | null> {
  const id = (await cookies()).get(DEVICE_COOKIE)?.value;
  if (!id) return null;
  const db = await getDb();
  const [row] = await db.select().from(schema.devices).where(eq(schema.devices.id, id));
  if (row) return { id: row.id, nickname: row.nickname, isOperator: row.isOperator };
  const nickname = `주민 ${id.slice(-4).toUpperCase()}`;
  await db.insert(schema.devices).values({ id, nickname }).onConflictDoNothing();
  return { id, nickname, isOperator: false };
}

export async function requireDevice(): Promise<Device> {
  const d = await currentDevice();
  if (!d) throw new Error("기기 정보를 확인할 수 없어요. 새로고침 후 다시 시도해 주세요.");
  return d;
}
