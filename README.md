# Pay La

Pay La is a shared expense tracking and settlement web application for couples, friends, roommates, and groups.

Traditional Chinese UI uses the product name **Pay啦**.

## Features

* Google Sign-In
* Shared expense groups with up to 30 members
* Single-use invitation links
* Equal, exact amount, and percentage splitting
* Expense history and fixed category keys
* Balance calculation and debt simplification
* Settlement tracking
* Traditional Chinese / English UI
* Light / Dark mode
* Responsive design

See [`docs/PRODUCT_SPEC.md`](docs/PRODUCT_SPEC.md) for complete product requirements and business rules.

## Tech Stack

* Next.js 16
* React
* TypeScript
* App Router
* Tailwind CSS
* Firebase Authentication
* Cloud Firestore
* Firestore Security Rules
* Vitest for pure business logic tests

The application is configured for Next.js static export and GitHub Pages compatibility.

## Project Structure

```text
app/                 # App Router routes and root layout
src/
├── components/      # UI and feature components
├── constants/       # Stable product constants
├── hooks/           # Reusable React hooks
├── i18n/            # Translation resources and i18n provider
├── lib/             # Pure business logic and tests
├── services/        # Firebase data access
├── types/           # Shared TypeScript types
└── utils/           # Small shared utilities
public/icons/        # SVG icons loaded by the Icon component
firestore.rules      # Firestore Security Rules
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the Firebase Web App values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Do not commit `.env.local`.

## Getting Started

Use Yarn for all project commands.

```bash
yarn install
yarn dev
```

Open `http://localhost:3000`.

For LAN testing:

```bash
yarn dev:host
```

Production build:

```bash
yarn build
```

Run checks:

```bash
yarn lint
yarn test
```

Deploy Firestore rules when they change:

```bash
yarn dlx firebase-tools deploy --only firestore:rules --project pay-la
```

## Documentation

| Document | Purpose |
| --- | --- |
| [`docs/PRODUCT_SPEC.md`](docs/PRODUCT_SPEC.md) | Product requirements and business rules |
| [`docs/UI_GUIDELINES.md`](docs/UI_GUIDELINES.md) | Design system and UI rules |
| [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) | Development phases and execution order |
| [`AGENTS.md`](AGENTS.md) | Instructions for AI coding agents |

`docs/PRODUCT_SPEC.md` is the source of truth for product behavior.
