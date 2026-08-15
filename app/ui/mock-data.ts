export const palette = [
  ["Background", "bg-background", "Warm page canvas"],
  ["Foreground", "bg-foreground", "Primary ink"],
  ["Surface", "bg-surface", "Base panels"],
  ["Raised", "bg-surface-raised", "Inputs and cards"],
  ["Primary", "bg-primary", "Main action"],
  ["Secondary", "bg-secondary", "Hot action"],
  ["Accent", "bg-accent", "Fun highlight"],
  ["Success", "bg-success", "Positive balance"],
  ["Warning", "bg-warning", "Needs attention"],
  ["Danger", "bg-danger", "Errors"],
  ["Info", "bg-info", "System accent"],
];

export const groups = [
  {
    name: "Japan Trip",
    currency: "JPY",
    members: 5,
    amount: "¥24,800",
    status: "You are owed",
    accent: "bg-primary",
  },
  {
    name: "Apartment 6F",
    currency: "TWD",
    members: 3,
    amount: "NT$1,280",
    status: "You owe",
    accent: "bg-accent",
  },
  {
    name: "Friday Dinner",
    currency: "TWD",
    members: 8,
    amount: "Settled",
    status: "All clear",
    accent: "bg-secondary",
  },
];

export const expenses = [
  {
    title: "Ramen dinner",
    category: "Food",
    payer: "Calvin",
    date: "Aug 14",
    amount: "¥6,000",
    effect: "+¥1,200",
    tone: "positive" as const,
  },
  {
    title: "Airport taxi",
    category: "Transport",
    payer: "Mina",
    date: "Aug 13",
    amount: "¥9,400",
    effect: "-¥2,350",
    tone: "negative" as const,
  },
  {
    title: "Museum tickets",
    category: "Travel",
    payer: "Harry",
    date: "Aug 12",
    amount: "¥4,500",
    effect: "0",
    tone: "neutral" as const,
  },
];

export const members = [
  { name: "Calvin", balance: "+¥8,400", note: "Gets back", tone: "positive" as const },
  { name: "Mina", balance: "-¥3,600", note: "Pays out", tone: "negative" as const },
  { name: "Harry", balance: "-¥4,800", note: "Pays out", tone: "negative" as const },
  { name: "Amy", balance: "¥0", note: "Settled", tone: "neutral" as const },
];

export const settlements = [
  { from: "Mina", to: "Calvin", amount: "¥3,600" },
  { from: "Harry", to: "Calvin", amount: "¥4,800" },
];
