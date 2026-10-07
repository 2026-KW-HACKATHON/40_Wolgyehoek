import { redirect } from "next/navigation";
export default async function DrawerPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const q = new URLSearchParams(await searchParams).toString();
  redirect(q ? `/?${q}` : "/");
}
