"use client";
import { Button } from "@/components/ui/Button";
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="flex flex-col items-center gap-5 px-6 py-24 text-center"><h1 className="text-xl font-extrabold">문제가 생겼어요</h1><Button onClick={reset}>다시 시도</Button></div>; }
