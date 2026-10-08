"use client";
import { useI18n } from "@/lib/i18n/client";
import { Badge, type BadgeProps } from "./Badge";
import type { CardStatus } from "@/lib/domain/types";

const STATUS_VARIANT: Record<CardStatus, BadgeProps["variant"]> = {
  open: "info", closed: "outline", go: "success", hold: "warning", stop: "destructive", stale: "default",
};
export function StatusBadge({ status }: { status: CardStatus }) {
  const { t } = useI18n();
  return <Badge variant={STATUS_VARIANT[status]} className="shrink-0 px-2 py-0.5 text-[11px] font-bold">{t.common.cardStatus[status]}</Badge>;
}

export function Disclaimer({ total }: { total?: number }) {
  const { t } = useI18n();
  return (
    <p className="text-xs leading-5 text-ink-3">
      {typeof total === "number" && <span className="tnum mr-2 text-ink">{t.system.participants(total)}</span>}
      {t.system.disclaimer}
    </p>
  );
}
