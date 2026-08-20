# AGENTS.md

Instructions for AI coding agents working on Pay La.

## Read Before Changes

Before implementing product behavior, read:

* `docs/PRODUCT_SPEC.md`
* `docs/UI_GUIDELINES.md` when available
* `docs/IMPLEMENTATION_PLAN.md` when available

Do not invent product requirements.

If behavior is undefined, ask before introducing a new business rule.

## Stack

Use the existing project stack:

* Next.js 16
* React
* TypeScript
* App Router
* Tailwind CSS
* Firebase Authentication
* Cloud Firestore
* Firestore Security Rules

Do not add dependencies unless necessary.

## Package Management

Use Yarn for all package and script commands.

Do not use npm or create an npm lockfile.

## Working Rules

* Keep changes scoped to the requested task.
* Do not refactor unrelated working code.
* Follow existing naming, structure, and patterns.
* Prefer simple code over premature abstractions.
* Reuse existing components and utilities where appropriate.
* Do not silently change established product behavior.
* Keep Firebase initialization centralized.
* Keep Firestore Security Rules in the repository.
* Maintain Next.js static export and GitHub Pages compatibility.

## React

* Use functional components and hooks.
* Avoid duplicated derived state.
* Avoid unnecessary `useEffect`.
* Keep reusable business logic outside presentational components.

## Styling

* Use Tailwind CSS.
* Reuse existing UI components and design tokens.
* Follow `docs/UI_GUIDELINES.md` once it exists.

## Verification

After meaningful changes, run the relevant checks when available:

```bash
yarn lint
yarn build
```

Run tests for business logic when applicable.

```bash
yarn test
```

Do not claim a change is complete if verification fails.

## Scope

Implement only the requested feature.

If an additional improvement is useful but out of scope, mention it instead of implementing it.
