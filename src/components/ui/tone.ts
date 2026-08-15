export type BalanceTone = "positive" | "negative" | "neutral";

export const toneText: Record<BalanceTone, string> = {
  positive: "text-success",
  negative: "text-danger",
  neutral: "text-muted",
};
