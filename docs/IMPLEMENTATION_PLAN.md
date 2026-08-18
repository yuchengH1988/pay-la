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

### Package Management

- Yarn
- Do not mix npm and Yarn lockfiles

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

Expense amounts use the project's integer / smallest-unit money representation.
Store resolved participant shares with the Expense.
Changing a Group currency changes only the currency label and never converts existing amounts.

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
- Payer selection and participant split responsibility are independent.

Money calculations must use the existing integer / smallest-unit representation.
The final participant shares must always equal the Expense amount.
Resolved shares are persisted with the Expense and must not be recalculated later by the Balance Engine.

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

Phase 6 implements the calculation model only.
Settlement inputs may be represented by test data at this stage.

Do not implement Settlement persistence, CRUD, or UI in this phase. Those belong to Phase 7.

### Tasks

* Calculate member net balances
* Calculate current user's owed / owing totals
* Generate member-to-member balances
* Implement debt simplification
* Integrate calculated balances into existing balance UI components

### Requirements

* Balance calculations must be deterministic
* Use persisted resolved Expense shares
* Do not recalculate historical Split logic
* Balance must always be derived from financial events
* Do not persist a separate Balance collection

### Testing

Add automated tests for:

* Multiple payers across multiple expenses
* Partial participation
* Uneven resolved shares
* Settlement inputs
* Fully settled Groups
* Debt simplification
* Deterministic results

### Done When

The same Expense and Settlement history always produces the same Balance result, and all Balance Engine tests pass.

---

# Phase 7 — Settlements

Implement persisted repayment records and integrate them with the existing Balance Engine.

### Tasks

* Create Settlement
* Settlement history
* Validate payer, receiver, and amount
* Persist Settlement records
* Recalculate derived Balance after Settlement changes
* Integrate settlement suggestions
* Add required loading, empty, error, and confirmation states
* Add the minimum Firestore Security Rules required for Settlements

### Data

`groups/{groupId}/settlements/{settlementId}`

### Requirements

* Payer and receiver must be Group members
* Payer and receiver cannot be the same user
* Amount must be greater than zero
* Settlement records must not directly mutate Expense data
* Balance remains derived from Expenses + Settlements

### Testing

Test:

* Full repayment
* Partial repayment
* Multiple Settlements
* Invalid payer / receiver combinations
* Balance after Settlement creation
* Fully settled state

### Done When

Group members can record repayments, Settlement history is persisted correctly, and the Balance Engine reflects those repayments accurately.

---

# Phase 8 — Security Hardening

Review, finalize, and test the Firestore Security Rules introduced throughout previous phases before public release.

This phase is a security review and hardening pass, not the first implementation of Security Rules.

### Core Requirements

* Unauthenticated users cannot access private application data
* Users can only modify permitted user-profile data
* Group members have equal Group permissions
* Non-members cannot access Group data
* Groups cannot exceed 30 members
* Expense writes follow the established Group and participant rules
* Settlement writes follow the established Group rules
* Only Group members can create invitations
* Full Groups cannot create usable invitations
* Invitations expire according to product rules
* Invitations are single-use
* Invitation acceptance can only add the authenticated user
* Invitation consumption and Group membership update must be atomic

Security must not rely on UI restrictions.

### Tasks

* Review all existing Firestore Security Rules
* Remove temporary or overly permissive rules
* Test authenticated and unauthenticated access
* Test member and non-member access
* Test cross-group access
* Test malformed writes
* Test Group member limit
* Test Expense field validation
* Test Settlement field validation
* Test Invitation edge cases
* Verify document field constraints where appropriate
* Verify no client-side restriction is being treated as a security boundary

### Done When

Authorized operations succeed, unauthorized operations fail, and the main security invariants are verified against Firestore Rules.

---

# Phase 9 — Product Polish & UX

Review and refine the complete MVP experience after all core product flows are functional.

This phase focuses on usability, visual consistency, responsiveness, and end-to-end product quality. It should not change established financial or product rules without updating the relevant specification first.

### Goals

* Improve end-to-end user flow
* Reduce unnecessary interaction steps
* Improve information hierarchy
* Refine responsive layouts
* Improve consistency across product screens
* Remove remaining development placeholders

### Tasks

* Review the complete Authentication → Group → Expense → Balance → Settlement flow
* Refine navigation and page hierarchy
* Improve Create / Edit Expense interaction
* Improve Split interaction
* Improve Balance presentation
* Improve Settle Up flow
* Review forms, dialogs, confirmations, and destructive actions
* Replace remaining mock or placeholder content
* Complete loading states
* Complete empty states
* Complete error states
* Complete disabled / pending states
* Verify Light / Dark mode
* Refine mobile, tablet, and desktop layouts
* Complete Traditional Chinese / English support
* Accessibility review
* Review focus states and touch targets
* Remove duplicated or obsolete UI
* Review component consistency against `/ui`
* Run an end-to-end manual UX pass

### Done When

The complete MVP can be used naturally from sign-in through shared expense settlement without mock data, broken flows, inconsistent UI, or unnecessary friction.

---

# Phase 10 — Deployment

Prepare and release the application through GitHub Pages.

### Tasks

* Verify Next.js static export configuration
* Configure GitHub Actions for build and deployment
* Deploy the production static build to GitHub Pages
* Configure Firebase Authorized Domains
* Configure Custom Domain
* Configure DNS
* Verify HTTPS
* Verify Google Sign-In on the production domain
* Verify Firestore access against production Security Rules
* Configure Firebase App Check
* Verify production environment variables
* Run final production build
* Run production smoke tests
* Verify mobile and desktop production behavior
* Verify Light / Dark mode in production
* Verify invitation links using the production domain

### Production Smoke Test

At minimum verify:

1. Google Sign-In
2. Create Group
3. Generate Invitation
4. Join Group with another account
5. Create Expense
6. Split Expense
7. View Balance
8. Create Settlement
9. Reach settled state
10. Sign Out
11. Refresh and direct-route navigation
12. Unauthorized access is rejected

### Done When

Pay La is accessible through the production custom domain and the complete MVP flow works correctly against the production Firebase project.

---

# Development Rule

For each phase:

1. Read the relevant project documentation.
2. Inspect the existing implementation.
3. Implement only the current phase.
4. Add tests where business logic warrants them.
5. Add or update the minimum Security Rules required by the feature.
6. Run relevant verification.
7. Report completed work and remaining issues.
8. Stop before starting the next phase.

Do not implement future features simply because they are adjacent to the current task.
