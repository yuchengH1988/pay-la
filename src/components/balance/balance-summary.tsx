import { Frame } from "@/src/components/ui";
import { useI18n } from "@/src/i18n";

type BalanceEmphasis = "settled" | "owes" | "owed" | "mixed";

export function BalanceSummary({
  owesAmount = "¥6,950",
  isOwedAmount = "¥8,400",
  emphasis = "mixed",
}: {
  owesAmount?: string;
  isOwedAmount?: string;
  emphasis?: BalanceEmphasis;
}) {
  const { t } = useI18n();

  if (emphasis === "settled") {
    return (
      <Frame surface="primary" shadow="sm" className="min-w-0 p-4">
        <p className="type-label">{t("balance.title")}</p>
        <p className="type-amount-md mt-2 break-words">{t("balance.allSettled")}</p>
      </Frame>
    );
  }

  if (emphasis === "mixed") {
    return (
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <Frame surface="secondary" className="min-w-0 p-4">
          <p className="type-label">{t("balance.youOwe")}</p>
          <p className="type-amount-md mt-2 break-words sm:text-4xl">
            {owesAmount}
          </p>
        </Frame>
        <Frame surface="primary" className="min-w-0 p-4">
          <p className="type-label">{t("balance.youAreOwed")}</p>
          <p className="type-amount-md mt-2 break-words sm:text-4xl">
            {isOwedAmount}
          </p>
        </Frame>
      </div>
    );
  }

  const primaryLabel = emphasis === "owes" ? t("balance.youOwe") : t("balance.youAreOwed");
  const primaryAmount = emphasis === "owes" ? owesAmount : isOwedAmount;
  const secondaryLabel = emphasis === "owes" ? t("balance.youAreOwed") : t("balance.youOwe");
  const secondaryAmount = emphasis === "owes" ? isOwedAmount : owesAmount;

  return (
    <div className="grid min-w-0 gap-3">
      <Frame
        surface={emphasis === "owes" ? "secondary" : "primary"}
        className="min-w-0 p-4"
      >
        <p className="type-label">{primaryLabel}</p>
        <p className="type-amount-md mt-2 break-words sm:text-4xl">
          {primaryAmount}
        </p>
      </Frame>
      <Frame surface="surface" shadow="sm" className="min-w-0 p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="type-caption text-muted">{secondaryLabel}</p>
          <p className="type-amount-sm break-words text-right">{secondaryAmount}</p>
        </div>
      </Frame>
    </div>
  );
}
