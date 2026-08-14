# Pay La

Pay La is a shared expense tracking and settlement web application for couples, friends, roommates, and groups.

Create a group, record shared expenses, split costs, track balances, and settle debts — without unnecessary financial complexity.

## Features

* Google Sign-In
* Shared expense groups with up to 30 members
* Invitation links
* Equal, exact amount, and percentage splitting
* Expense history and categories
* Balance calculation and debt simplification
* Settlement tracking
* Traditional Chinese / English
* Light / Dark mode
* Responsive design

See [`docs/PRODUCT_SPEC.md`](docs/PRODUCT_SPEC.md) for complete product requirements.

## Tech Stack

* Next.js 16
* React
* JavaScript
* Tailwind CSS
* App Router
* Firebase / Supabase — TBD

## Project Structure

```text
src/
├── app/          # Routes and layouts
├── components/   # UI and feature components
├── hooks/        # Reusable React hooks
├── services/     # Data access
├── utils/        # Utilities and financial logic
├── constants/    # Application constants
├── locales/      # i18n resources
└── mocks/        # Development mock data
```

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Production build:

```bash
npm run build
```

## Documentation

| Document                                  | Purpose                                 |
| ----------------------------------------- | --------------------------------------- |
| [`PRODUCT_SPEC.md`](docs/PRODUCT_SPEC.md) | Product requirements and business rules |
| `UI_GUIDELINES.md`                        | Design system and UI rules              |
| `IMPLEMENTATION_PLAN.md`                  | Development phases and milestones       |
| `AGENTS.md`                               | Instructions for AI coding agents       |

`PRODUCT_SPEC.md` is the source of truth for product behavior.
