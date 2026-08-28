"use client";

import { useState } from "react";
import { Timestamp } from "firebase/firestore";
import { GroupBalancePanel } from "@/src/components/balance";
import { ExpenseForm, ExpenseHistory } from "@/src/components/expenses";
import { LanguageSwitcher } from "@/src/components/i18n";
import { AppHeader } from "@/src/components/layout";
import {
  Alert,
  Badge,
  Button,
  Dialog,
  Frame,
  Icon,
  ThemeToggle,
} from "@/src/components/ui";
import {
  demoCurrentUserId,
  demoExpenses,
  demoGroup,
  demoMemberProfiles,
  demoSettlements,
} from "@/src/demo/demo-data";
import { useI18n } from "@/src/i18n";
import { calculateSplit, type SplitParticipantInput } from "@/src/lib/split-engine";
import {
  parseAmountToMinor,
  parseNonNegativeAmountToMinor,
  parsePercentageToBasisPoints,
} from "@/src/services/expenses";
import type { Expense, ExpenseFormValues } from "@/src/types/expense";

function createLocalExpense(values: ExpenseFormValues): Expense {
  const amountMinor = parseAmountToMinor(values.amount);

  if (!amountMinor) {
    throw new Error("Amount must be greater than 0.");
  }

  const splitParticipants = values.participantIds.map<SplitParticipantInput>((userId) => {
    if (values.splitType === "exact") {
      return {
        userId,
        exactAmountMinor: parseNonNegativeAmountToMinor(values.exactAmounts[userId] ?? ""),
      };
    }

    if (values.splitType === "percentage") {
      return {
        userId,
        percentageBasisPoints: parsePercentageToBasisPoints(
          values.percentages[userId] ?? "",
        ),
      };
    }

    return { userId };
  });
  const splitResult = calculateSplit({
    amountMinor,
    splitType: values.splitType,
    participants: splitParticipants,
  });

  if (!splitResult.ok) {
    throw new Error("Split validation failed.");
  }

  const now = Timestamp.now();

  return {
    id: `demo-expense-${now.toMillis()}`,
    name: values.name.trim(),
    amountMinor,
    amountScale: 2,
    category: values.category,
    paidBy: values.paidBy,
    participants: Object.fromEntries(
      splitResult.shares.map((share) => [share.userId, share]),
    ),
    splitType: values.splitType,
    date: Timestamp.fromDate(new Date(`${values.date}T00:00:00`)),
    note: values.note.trim(),
    createdBy: demoCurrentUserId,
    createdAt: now,
    updatedAt: now,
  };
}

export function DemoWorkspace({ onExit }: { onExit: () => void }) {
  const { t } = useI18n();
  const [expenses, setExpenses] = useState<Expense[]>(demoExpenses);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);
  const [demoError, setDemoError] = useState<string | null>(null);

  async function handleCreateExpense(values: ExpenseFormValues) {
    setIsSavingExpense(true);
    setDemoError(null);

    try {
      const localExpense = createLocalExpense(values);

      setExpenses((currentExpenses) => [localExpense, ...currentExpenses]);
      setDemoMessage(t("demo.temporarySaved"));
      setIsAddingExpense(false);
    } catch (error) {
      setDemoError(error instanceof Error ? error.message : t("common.error"));
    } finally {
      setIsSavingExpense(false);
    }
  }

  return (
    <main className="min-h-dvh bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-5">
        <AppHeader
          leading={
            <Button
              type="button"
              variant="primary"
              aria-label={t("demo.exit")}
              onClick={onExit}
            >
              <Icon name="arrow-left" />
            </Button>
          }
          eyebrow={t("demo.groupEyebrow")}
          title={demoGroup.name}
          actions={(placement) => (
            <>
              <LanguageSwitcher fullWidth={placement === "menu"} />
              <ThemeToggle
                className={placement === "menu" ? "w-full justify-start" : undefined}
              />
              <Button
                type="button"
                variant="outline"
                className={placement === "menu" ? "w-full justify-start" : undefined}
                onClick={onExit}
              >
                <Icon name="arrow-left" />
                {t("demo.exit")}
              </Button>
            </>
          )}
          showMenuButtonOnDesktop
        />

        <Frame surface="raised" className="p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Badge tone="accent">{t("demo.badge")}</Badge>
              <p className="type-small mt-3 max-w-2xl text-muted">
                {t("demo.notice")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="muted">
                {t("members.memberCount", { count: demoGroup.memberIds.length })}
              </Badge>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  setDemoError(null);
                  setDemoMessage(null);
                  setIsAddingExpense(true);
                }}
              >
                <Icon name="plus" />
                {t("action.addExpense")}
              </Button>
            </div>
          </div>
        </Frame>

        {demoMessage ? (
          <Alert title={t("demo.temporaryTitle")} tone="success">
            {demoMessage}
          </Alert>
        ) : null}

        {demoError ? (
          <Alert title={t("expense.error")} tone="danger">
            {demoError}
          </Alert>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="min-w-0">
            <ExpenseHistory
              group={demoGroup}
              currentUserId={demoCurrentUserId}
              memberProfiles={demoMemberProfiles}
              expenses={expenses}
              settlements={demoSettlements}
              loading={false}
              error={null}
              readOnly
            />
          </div>

          <aside className="hidden min-w-0 lg:block">
            <GroupBalancePanel
              group={demoGroup}
              currentUserId={demoCurrentUserId}
              memberProfiles={demoMemberProfiles}
              expenses={expenses}
              settlements={demoSettlements}
              onSettleUp={() => undefined}
              readOnly
            />
          </aside>
        </div>

        <Button
          type="button"
          size="lg"
          className="fixed bottom-5 right-4 z-40 md:hidden"
          onClick={() => {
            setDemoError(null);
            setDemoMessage(null);
            setIsAddingExpense(true);
          }}
        >
          <Icon name="plus" />
          {t("action.addExpense")}
        </Button>

        <Dialog
          open={isAddingExpense}
          title={t("action.addExpense")}
          description={t("demo.expenseDescription")}
          onClose={() => setIsAddingExpense(false)}
        >
          <ExpenseForm
            group={demoGroup}
            currentUserId={demoCurrentUserId}
            memberProfiles={demoMemberProfiles}
            submitLabel={t("action.createExpense")}
            loading={isSavingExpense}
            onSubmit={handleCreateExpense}
            onCancel={() => setIsAddingExpense(false)}
          />
        </Dialog>
      </div>
    </main>
  );
}
