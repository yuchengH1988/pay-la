"use client";

import { ReactNode, useMemo, useState } from "react";
import { ShowcaseGrid, ShowcasePanel, TypeSamplePanel } from "./showcase-components";
import { BalanceSummary, MemberBalance, SettlementSuggestion } from "@/src/components/balance";
import { ExpenseCard } from "@/src/components/expense";
import { GroupCard, InvitationCard } from "@/src/components/group";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  CheckboxRow,
  DialogMock,
  EmptyState,
  Frame,
  LoadingCard,
  SelectField,
  TextInput,
  ThemeToggle,
} from "@/src/components/ui";
import { expenses, groups, members, palette, settlements } from "./mock-data";

type ExplorerItem = {
  id: string;
  label: string;
  group: "Foundations" | "Components" | "Product";
  render: () => ReactNode;
};

const navGroups: Array<ExplorerItem["group"]> = [
  "Foundations",
  "Components",
  "Product",
];

export default function UiPlayground() {
  const items = useMemo<ExplorerItem[]>(
    () => [
      { id: "colors", label: "Colors", group: "Foundations", render: ColorsShowcase },
      {
        id: "typography",
        label: "Typography",
        group: "Foundations",
        render: TypographyShowcase,
      },
      {
        id: "spacing-radius",
        label: "Spacing / Radius",
        group: "Foundations",
        render: SpacingRadiusShowcase,
      },
      { id: "button", label: "Button", group: "Components", render: ButtonShowcase },
      { id: "input", label: "Input", group: "Components", render: InputShowcase },
      { id: "select", label: "Select", group: "Components", render: SelectShowcase },
      {
        id: "checkbox-radio",
        label: "Checkbox / Radio",
        group: "Components",
        render: CheckboxRadioShowcase,
      },
      { id: "badge", label: "Badge", group: "Components", render: BadgeShowcase },
      { id: "avatar", label: "Avatar", group: "Components", render: AvatarShowcase },
      {
        id: "modal-alert",
        label: "Modal / Alert",
        group: "Components",
        render: ModalAlertShowcase,
      },
      { id: "group-card", label: "Group Card", group: "Product", render: GroupShowcase },
      { id: "expense", label: "Expense", group: "Product", render: ExpenseShowcase },
      { id: "balance", label: "Balance", group: "Product", render: BalanceShowcase },
      {
        id: "settlement",
        label: "Settlement",
        group: "Product",
        render: SettlementShowcase,
      },
      {
        id: "empty-loading",
        label: "Empty / Loading States",
        group: "Product",
        render: StateShowcase,
      },
    ],
    [],
  );
  const [activeId, setActiveId] = useState(items[0].id);
  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <Hero />

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
          <Frame as="aside" surface="surface" className="hidden p-4 lg:sticky lg:top-5 lg:block">
            <p className="type-h3 mb-4">
              Explorer
            </p>
            <ExplorerNav
              items={items}
              activeId={activeId}
              onChange={setActiveId}
            />
          </Frame>

          <div className="lg:hidden">
            <label className="grid gap-2 rounded-xs border-[3px] border-border bg-surface p-3 shadow-hard">
              <span className="type-label">
                Explorer
              </span>
              <select
                value={activeId}
                onChange={(event) => setActiveId(event.target.value)}
                className="type-control min-h-12 rounded-xs border-[3px] border-border bg-surface-raised px-3 text-foreground shadow-hard-sm"
              >
                {navGroups.map((group) => (
                  <optgroup key={group} label={group}>
                    {items
                      .filter((item) => item.group === group)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </label>
          </div>

          <Frame as="section" surface="surface" className="min-w-0 p-4 md:p-6">
            <div className="mb-6 flex items-end justify-between gap-4 border-b-[3px] border-border pb-4">
              <div>
                <p className="type-caption text-muted">
                  {activeItem.group}
                </p>
                <h2 className="type-h1">
                  {activeItem.label}
                </h2>
              </div>
              <div className="poster-grid hidden size-14 border-[3px] border-border md:block" />
            </div>
            {activeItem.render()}
          </Frame>
        </div>
      </div>
    </main>
  );
}

function ExplorerNav({
  items,
  activeId,
  onChange,
}: {
  items: ExplorerItem[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <nav className="grid gap-5">
      {navGroups.map((group) => (
        <div key={group}>
          <p className="type-caption mb-2 text-muted">
            {group}
          </p>
          <div className="grid gap-2">
            {items
              .filter((item) => item.group === group)
              .map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChange(item.id)}
                  className={`type-control border-[3px] border-border px-3 py-2 text-left shadow-hard-sm ${
                    item.id === activeId
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-raised text-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function Hero() {
  return (
    <header className="relative overflow-hidden rounded-xs border-[3px] border-border bg-surface px-4 py-5 shadow-hard md:px-6 md:py-7">
      <div className="absolute right-4 top-4 size-12 border-[3px] border-border bg-secondary" />
      <div className="poster-grid absolute right-20 top-8 hidden size-20 md:block" />
      <div className="diagonal-stripes absolute bottom-0 left-0 h-6 w-full border-t-[3px] border-border" />

      <div className="grid gap-8 pb-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3 pr-16">
            <p className="type-label inline-block border-[3px] border-border bg-primary px-2 py-1">
              Pay La UI Direction / v1
            </p>
            <ThemeToggle />
          </div>
          <h1 className="type-display">
            Split bills.
            <br />
            Keep friends.
          </h1>
          <p className="type-body mt-5 max-w-xl text-muted">
            The playground is now organized as a component explorer while keeping
            the first visual direction intact.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
          <Frame surface="primary" className="p-4">
            <p className="type-control-lg">
              You owe
            </p>
            <p className="type-amount-xl mt-2">NT$640</p>
          </Frame>
          <Frame className="p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="type-h3">
                Add expense
              </p>
              <Button className="min-h-10 px-3">+</Button>
            </div>
            <div className="grid gap-2">
              <div className="type-caption h-10 border-[3px] border-border bg-background flex-center text-muted">
                # Dinner with friends
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div className="type-amount-md border-[3px] border-border bg-background flex-center">
                  NT$1,280
                </div>
                <div className="type-h3 grid size-12 place-items-center border-[3px] border-border bg-secondary">
                  -&gt;
                </div>
              </div>
            </div>
          </Frame>
        </div>
      </div>
    </header>
  );
}

function ColorsShowcase() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {palette.map(([name, swatch, note]) => (
        <Frame
          key={name}
          shadow="sm"
          className="p-3"
        >
          <div className={`${swatch} mb-3 h-16 rounded-xs border-[3px] border-border`} />
          <p className="type-control-lg">
            {name}
          </p>
          <p className="type-caption mt-1 text-muted">{note}</p>
        </Frame>
      ))}
    </div>
  );
}

function TypographyShowcase() {
  const headingSamples = [
    ["Display", "Split bills. Keep friends.", "type-display"],
    ["H1", "Japan Trip Balance", "type-h1"],
    ["H2", "Recent Expenses", "type-h2"],
    ["H3", "Settlement Plan", "type-h3"],
  ];
  const interfaceSamples = [
    [
      "Body",
      "Clear balance information should stay quick to read, even when the visual system is loud.",
      "type-body",
    ],
    ["Small", "Paid by Calvin . Equal split", "type-small text-muted"],
    ["Caption", "30 member maximum", "type-caption text-muted"],
    ["Label", "Expense name", "type-label"],
    ["Control Small", "Small button", "type-control-sm"],
    ["Control", "Medium button", "type-control"],
    ["Control Large", "Large button", "type-control-lg"],
    ["Badge", "Settled", "type-badge"],
  ];
  const amountSamples = [
    ["Amount XL", "NT$24,800", "type-amount-xl"],
    ["Amount LG", "NT$12,800", "type-amount-lg"],
    ["Amount MD", "NT$1,280", "type-amount-md"],
    ["Amount SM", "+NT$640", "type-amount-sm text-success"],
  ];

  return (
    <div className="grid gap-5">
      <TypeSamplePanel title="Heading scale" samples={headingSamples} />
      <TypeSamplePanel title="Interface text" samples={interfaceSamples} />
      <TypeSamplePanel title="Amount / Numeric" samples={amountSamples} />

      <ShowcasePanel title="Font preview">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            ["Current display", "var(--font-display)", "PAY LA SPLITS"],
            ["Current body", "var(--font-body)", "Friendly expense details"],
            ["Current amount", "var(--font-amount)", "NT$12,800"],
          ].map(([label, family, text]) => (
            <Frame key={label} shadow="sm" className="p-3">
              <p className="type-caption mb-3 text-muted">
                {label}
              </p>
              <p className="type-amount-lg" style={{ fontFamily: family }}>
                {text}
              </p>
            </Frame>
          ))}
        </div>
      </ShowcasePanel>
    </div>
  );
}

function SpacingRadiusShowcase() {
  return (
    <ShowcaseGrid>
      <ShowcasePanel title="Radius">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {["0", "2", "4", "8"].map((radius) => (
            <div
              key={radius}
              className="type-control-lg grid min-h-24 place-items-center border-[3px] border-border bg-primary p-2 shadow-hard-sm"
              style={{ borderRadius: `${radius}px` }}
            >
              R{radius}
            </div>
          ))}
        </div>
      </ShowcasePanel>
      <ShowcasePanel title="Spacing">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {["4", "8", "12", "20"].map((space) => (
            <div key={space} className="border-[3px] border-border bg-surface-raised p-2 shadow-hard-sm">
              <div className="bg-secondary" style={{ height: `${space}px` }} />
              <p className="type-caption mt-2">{space}px</p>
            </div>
          ))}
        </div>
      </ShowcasePanel>
    </ShowcaseGrid>
  );
}

function ButtonShowcase() {
  return (
    <div className="grid gap-5">
      <ShowcasePanel title="Variants">
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </ShowcasePanel>
      <ShowcasePanel title="Sizes">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </ShowcasePanel>
      <ShowcasePanel title="States">
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
        </div>
      </ShowcasePanel>
    </div>
  );
}

function InputShowcase() {
  return (
    <ShowcaseGrid>
      <ShowcasePanel title="Default / Focus">
        <div className="grid gap-4">
          <TextInput label="Expense name" placeholder="Ramen dinner" />
          <TextInput label="Amount" defaultValue="NT$1,280" />
        </div>
      </ShowcasePanel>
      <ShowcasePanel title="Error / Disabled">
        <div className="grid gap-4">
          <TextInput label="Amount" defaultValue="0" error="Amount must be greater than 0." />
          <TextInput label="Paid by" defaultValue="Calvin" disabled />
        </div>
      </ShowcasePanel>
    </ShowcaseGrid>
  );
}

function SelectShowcase() {
  return (
    <ShowcaseGrid>
      <ShowcasePanel title="Select">
        <SelectField label="Category" defaultValue="Food">
          <option>Food</option>
          <option>Transport</option>
          <option>Travel</option>
        </SelectField>
      </ShowcasePanel>
      <ShowcasePanel title="Split method">
        <SelectField label="Split method" defaultValue="Equal">
          <option>Equal</option>
          <option>Exact Amount</option>
          <option>Percentage</option>
        </SelectField>
      </ShowcasePanel>
    </ShowcaseGrid>
  );
}

function CheckboxRadioShowcase() {
  return (
    <ShowcaseGrid>
      <ShowcasePanel title="Checkbox">
        <div className="grid gap-3">
          <CheckboxRow label="Calvin participates" checked />
          <CheckboxRow label="Mina participates" />
        </div>
      </ShowcasePanel>
      <ShowcasePanel title="Radio">
        <div className="grid gap-3">
          <CheckboxRow label="Equal split" checked type="radio" />
          <CheckboxRow label="Exact amount" type="radio" />
        </div>
      </ShowcasePanel>
    </ShowcaseGrid>
  );
}

function BadgeShowcase() {
  return (
    <ShowcasePanel title="Tones">
      <div className="flex flex-wrap gap-2">
        <Badge>Primary</Badge>
        <Badge tone="accent">New</Badge>
        <Badge tone="danger">Error</Badge>
        <Badge tone="muted">Settled</Badge>
      </div>
    </ShowcasePanel>
  );
}

function AvatarShowcase() {
  return (
    <ShowcasePanel title="Members">
      <div className="flex flex-wrap gap-3">
        <Avatar name="Calvin" />
        <Avatar name="Mina" tone="secondary" />
        <Avatar name="Harry" />
        <Avatar name="Amy" tone="secondary" />
      </div>
    </ShowcasePanel>
  );
}

function ModalAlertShowcase() {
  return (
    <ShowcaseGrid>
      <ShowcasePanel title="Modal">
        <DialogMock />
      </ShowcasePanel>
      <ShowcasePanel title="Alert">
        <div className="grid gap-4">
          <Alert title="Invalid split" tone="danger">
            Percentages must add up to exactly 100 before saving.
          </Alert>
          <Alert title="All settled" tone="success">
            No one owes money in this group right now.
          </Alert>
        </div>
      </ShowcasePanel>
    </ShowcaseGrid>
  );
}

function GroupShowcase() {
  return (
    <ShowcaseGrid>
      {groups.map((group) => (
        <GroupCard key={group.name} {...group} />
      ))}
      <InvitationCard />
    </ShowcaseGrid>
  );
}

function ExpenseShowcase() {
  return (
    <ShowcasePanel title="Recent expenses">
      {expenses.map((expense) => (
        <ExpenseCard key={expense.title} {...expense} />
      ))}
    </ShowcasePanel>
  );
}

function BalanceShowcase() {
  return (
    <div className="grid gap-5">
      <BalanceSummary />
      <ShowcasePanel title="Member balance">
        {members.map((member) => (
          <MemberBalance key={member.name} {...member} />
        ))}
      </ShowcasePanel>
    </div>
  );
}

function SettlementShowcase() {
  return (
    <ShowcasePanel title="Settle faster">
      <div className="grid gap-3">
        {settlements.map((settlement) => (
          <SettlementSuggestion key={`${settlement.from}-${settlement.to}`} {...settlement} />
        ))}
      </div>
    </ShowcasePanel>
  );
}

function StateShowcase() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      <EmptyState />
      <LoadingCard />
      <Alert title="Invitation expired" tone="danger">
        Ask a group member for a fresh invite link to join Japan Trip.
      </Alert>
    </div>
  );
}
