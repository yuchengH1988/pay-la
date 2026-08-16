# Pay La — Implementation Plan

This document defines the implementation order for the Pay La MVP.

Product behavior is defined in `docs/PRODUCT_SPEC.md`.  
UI rules are defined in `docs/UI_GUIDELINES.md`.

Complete one phase at a time. Do not implement future phases unless required by the current phase.

---

## Technical Direction

### Frontend

- Next.js 16
- React
- TypeScript
- App Router
- Tailwind CSS

### Backend

- Firebase Authentication
- Cloud Firestore
- Firestore Security Rules

### Deployment

- GitHub
- GitHub Actions
- GitHub Pages
- Custom Domain

The application must remain compatible with Next.js static export.

---

# Phase 0 — Firebase Foundation

Connect the existing Firebase project to the application.

### Tasks

- Install and configure Firebase SDK
- Add Firebase environment variables
- Add `.env.example`
- Initialize Firebase App
- Initialize Firebase Auth
- Initialize Firestore
- Keep Firebase initialization centralized
- Verify the application still supports static export

### Done When

- Application connects to the correct Firebase project
- Firebase initializes without runtime errors
- Environment-specific configuration is not hard-coded
- `lint` and `build` pass

---

# Phase 1 — Authentication

Implement Google authentication using Firebase Authentication.

### Tasks

- Google Sign-In
- Sign Out
- Authentication state handling
- Create or update `users/{uid}` after authentication
- Loading and authentication states
- Protected application experience where required

### Done When

A user can:

1. Sign in with Google
2. Refresh the page and remain authenticated
3. Sign out
4. Have a corresponding Firestore user document

---

# Phase 2 — Groups

Implement the core Group experience.

### Tasks

- Create Group
- List Groups belonging to the current user
- View Group
- Edit Group
- Store Group members
- Enforce the 30-member limit
- Display Group currency as a label

### Data

Primary collection:

`groups/{groupId}`

Group membership is represented by `memberIds`.

### Done When

An authenticated user can create and access Groups they belong to, while unrelated users cannot access them.

---

# Phase 3 — Invitations

Implement single-use Group invitations.

### Tasks

- Generate Invitation
- Copy invitation link
- Open invitation route
- Require authentication before joining
- Validate invitation status
- Validate expiration
- Validate Group capacity
- Join Group
- Consume Invitation atomically
- Handle invalid, expired, used, and full-group states

Invitation rules are defined in `PRODUCT_SPEC.md`.

### Data

`invitations/{invitationId}`

### Done When

A Group member can generate a link that allows exactly one authenticated user to join the Group within its validity period.

After successful use, the same invitation cannot be reused.

---

# Phase 4 — Expense CRUD

Implement expense persistence and management.

### Tasks

- Create Expense
- Expense history
- Edit Expense
- Delete Expense
- Select payer
- Select participants
- Select category
- Date and optional note

### Data

`groups/{groupId}/expenses/{expenseId}`

Store the resolved participant shares with the Expense.

### Done When

Group members can create, view, edit, and delete Expenses and the persisted data follows the product rules.

---

# Phase 5 — Split Engine

Implement financial split calculations independently from UI and Firebase.

### Split Methods

- Equal
- Exact Amount
- Percentage

### Requirements

Split calculations should be deterministic pure functions.

They must handle:

- Validation
- Rounding
- Smallest currency-unit differences
- Participant totals

The final participant shares must always equal the Expense amount.

### Testing

Add automated tests for financial calculations.

Important edge cases must include:

- Uneven equal splits
- Percentage rounding
- Invalid exact totals
- Invalid percentage totals
- Single participant

### Done When

All supported split methods produce valid deterministic shares and their tests pass.

---

# Phase 6 — Balance Engine

Calculate Group balances from persisted financial events.

Balance is derived from:

`Expenses + Settlements`

Do not create Balance as an independent source of truth.

### Tasks

- Calculate member net balances
- Calculate current user's owed / owing totals
- Generate member-to-member balances
- Implement debt simplification
- Integrate calculated balances into existing UI components

### Testing

Add automated tests for:

- Multiple payers across multiple expenses
- Partial participation
- Settlements
- Fully settled Groups
- Debt simplification

### Done When

The same Expense and Settlement history always produces the same Balance result.

---

# Phase 7 — Settlements

Implement repayment records.

### Tasks

- Create Settlement
- Settlement history
- Update Balance calculations after settlement
- Integrate settlement suggestions

### Data

`groups/{groupId}/settlements/{settlementId}`

### Done When

Members can record repayments and balances correctly reflect those repayments.

---

# Phase 8 — Security Rules

Finalize and test Firestore Security Rules before public release.

### Core Requirements

- Unauthenticated users cannot access private application data
- Group members have equal Group permissions
- Non-members cannot access Group data
- Groups cannot exceed 30 members
- Only Group members can create invitations
- Full Groups cannot create usable invitations
- Invitations expire according to product rules
- Invitations are single-use
- Invitation acceptance can only add the authenticated user
- Invitation consumption and Group membership update must be atomic

Security must not rely on UI restrictions.

### Done When

Authorized operations succeed and unauthorized operations fail when tested against Firestore Rules.

---

# Phase 9 — Product Integration

Complete the MVP experience using the established Design System.

### Tasks

- Connect existing UI components to real data
- Replace remaining mock data
- Complete loading states
- Complete empty states
- Complete error states
- Verify Light / Dark mode
- Verify mobile, tablet, and desktop layouts
- Complete Traditional Chinese / English support
- Accessibility review

### Done When

The complete MVP flow can be performed without mock data.

---

# Phase 10 — Deployment

Prepare the application for public deployment.

### Tasks

- Configure Next.js static export
- Configure GitHub Actions
- Deploy to GitHub Pages
- Configure Firebase Authorized Domains
- Configure Custom Domain
- Verify Google Sign-In on the production domain
- Review production Firestore Rules
- Configure Firebase App Check
- Run final production build and QA

### Done When

Pay La is accessible through the production custom domain and the complete MVP flow works against the production Firebase project.

---

# Development Rule

For each phase:

1. Read the relevant project documentation.
2. Inspect the existing implementation.
3. Implement only the current phase.
4. Add tests where business logic warrants them.
5. Run relevant verification.
6. Report completed work and remaining issues.
7. Stop before starting the next phase.

Do not implement future features simply because they are adjacent to the current task.