# Shared Expense Web — Project Specification

> Working title: Shared Expense / Split Web  
> Stack: Next.js + React + Firebase + Tailwind CSS  
> Status: MVP specification  
> Primary goal: Build a public web-based shared expense and settlement product while using the project to review React and learn modern Next.js architecture.

---

# 1. Product Goal

建立一個類似 Splitwise 的 Web 共享分帳工具。

使用者可以：

- 註冊 / 登入
- 建立共同消費群組
- 邀請其他使用者加入群組
- 每個群組最多 30 人
- 新增共同消費
- 指定付款者
- 指定參與分攤的人
- 選擇不同分帳方式
- 查看目前誰欠誰多少
- 記錄實際還款（Settlement）
- 查看消費歷史

本產品以 Web 為主，不建立 Native App。

---

# 2. Core Product Decisions

## 2.1 Currency is Display-only

每個 Group 可以設定一個 `currency`。

例如：

```text
TWD
USD
JPY
EUR
```

Currency **只負責顯示標籤，不進行任何匯率轉換**。

例如：

```text
Group currency = TWD
Amount = 1000

顯示：
NT$1,000
```

如果使用者之後把 Group currency 改成 USD：

```text
Amount 仍然 = 1000

顯示：
US$1,000
```

不重新換算，不修改歷史數字。

因此：

```text
currency = presentation metadata
amount = financial value
```

MVP 不處理：

- 即時匯率
- 歷史匯率
- Currency conversion
- Multi-currency settlement
- Exchange-rate API

---

# 3. Group Rules

## 3.1 Maximum Members

每個 Group 最多：

```text
30 members
```

包含建立 Group 的使用者。

---

## 3.2 Permission Model

MVP 不做：

```text
Owner
Admin
Member
Viewer
```

所有 Group Members 都具有相同權限。

只要是 Group Member，即可：

- 查看群組
- 查看所有 Expense
- 新增 Expense
- 修改 Expense
- 刪除 Expense
- 邀請成員
- 查看 Balance
- 新增 Settlement
- 修改 Group 基本設定

因此權限模型只有：

```text
Group Member
Non-member
```

---

## 3.3 Membership Rule

只有 Group Member 可以存取 Group 相關資料。

Non-member：

```text
Cannot read
Cannot write
Cannot query expenses
Cannot query settlements
```

---

# 4. Expense Categories

MVP 保留 Expense Category。

分類不需要傳統 Backend。

Category 使用固定 key，例如：

```js
food
groceries
transport
housing
utilities
entertainment
shopping
travel
health
education
subscriptions
pets
gifts
taxes
insurance
other
```

Firestore Expense 只保存：

```js
{
  category: 'groceries'
}
```

不要保存：

```js
{
  category: '食品雜貨'
}
```

也不要保存：

```js
{
  category: 'Groceries'
}
```

UI 再根據 locale 顯示翻譯。

---

## 4.1 Category i18n

例如：

```js
const categories = {
  groceries: {
    icon: 'shopping-cart',
  },

  transport: {
    icon: 'car',
  },
}
```

語系：

```json
{
  "categories": {
    "groceries": "食品雜貨",
    "transport": "交通"
  }
}
```

英文：

```json
{
  "categories": {
    "groceries": "Groceries",
    "transport": "Transport"
  }
}
```

因此資料庫永遠只認識：

```text
groceries
transport
travel
```

不需要知道語言。

---

## 4.2 Initial Category Strategy

MVP 建議約：

```text
15–25 個主要分類
```

不建議一開始做 100 個。

原因：

- 搜尋成本高
- 使用者選擇困難
- 很多分類使用率極低
- i18n 維護量暴增
- MVP 沒有必要

未來可以擴充：

```text
Category Search
Subcategories
User-defined Categories
Recently Used Categories
```

---

# 5. i18n

MVP 支援：

```text
zh-TW
en
```

所有 UI 文案透過 locale key。

例如：

```text
expense.add
expense.edit
group.create
group.members
balance.youOwe
categories.food
```

不要把顯示文字直接存進 Firestore。

---

# 6. Main User Flow

## 6.1 New User

```text
Landing Page
↓
Register
↓
Login
↓
Dashboard
↓
Create Group / Join Group
```

---

## 6.2 Create Group

```text
Dashboard
↓
Create Group
↓
Group Name
↓
Currency Label
↓
Create
↓
Group Dashboard
```

建立者自動加入：

```text
memberIds
```

---

## 6.3 Invite Member

```text
Group
↓
Invite
↓
Generate invitation link
↓
Share link
↓
Receiver opens link
↓
Login / Register
↓
Accept invitation
↓
Join Group
```

Acceptance 前必須確認：

```text
member count < 30
```

---

## 6.4 Add Expense

```text
Group
↓
Add Expense
↓
Title
↓
Amount
↓
Category
↓
Paid By
↓
Participants
↓
Split Method
↓
Preview
↓
Save
```

---

## 6.5 Balance

```text
Expenses
+
Settlements
↓
calculateBalances()
↓
Net Balance
↓
simplifyDebts()
↓
Settlement Suggestions
```

---

## 6.6 Settlement

```text
Balance
↓
Settle Up
↓
Payer
↓
Receiver
↓
Amount
↓
Confirm
↓
Settlement Record
↓
Balance recalculated
```

---

# 7. Authentication

MVP：

```text
Email
Password
Display Name
```

Functions：

- Register
- Login
- Logout
- Persistent session

Future：

- Google Sign-in
- Password Reset
- Email Verification

Authentication provider：

```text
Firebase Authentication
```

---

# 8. Group Data Model

Recommended Firestore document:

```js
groups/{groupId}

{
  name: 'Japan Trip',

  currency: 'JPY',

  memberIds: [
    'uid_1',
    'uid_2',
    'uid_3'
  ],

  createdBy: 'uid_1',

  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

`createdBy` 保留作 audit / historical information。

它不代表額外權限。

---

# 9. Why memberIds are stored on Group

因為：

```text
Maximum = 30 users
```

所以 `memberIds` array 很小。

優點：

- 快速判斷 membership
- Firestore Rules 容易檢查
- 易於限制 <= 30
- Query authorization 比較單純
- Group list 容易查詢 array-contains

Example:

```text
groups
where memberIds array-contains currentUser.uid
```

---

# 10. User Data Model

```js
users/{userId}

{
  displayName: 'Calvin',
  email: '...',
  photoURL: null,

  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

# 11. Expense Data Model

```js
groups/{groupId}/expenses/{expenseId}

{
  title: 'Dinner',

  amount: 120000,

  category: 'food',

  paidBy: 'uid_1',

  splitType: 'equal',

  participants: [
    {
      userId: 'uid_1',
      amount: 40000
    },
    {
      userId: 'uid_2',
      amount: 40000
    },
    {
      userId: 'uid_3',
      amount: 40000
    }
  ],

  date: Timestamp,

  note: '',

  createdBy: 'uid_1',

  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

# 12. Money Storage

避免 JavaScript floating-point 問題。

金額以最小貨幣單位儲存。

例如：

```text
TWD 1200
→ 1200
```

```text
USD 12.50
→ 1250
```

UI formatting 才轉換成：

```text
$12.50
```

Currency label 不影響 stored amount。

---

# 13. Expense Split Types

## Equal

平均分攤。

Example：

```text
900 / 3

A = 300
B = 300
C = 300
```

---

## Exact

指定每人的實際金額。

Example：

```text
Total = 900

A = 200
B = 300
C = 400
```

Validation：

```text
sum(participants.amount) === expense.amount
```

---

## Percentage

MVP 可以保留。

Example：

```text
A = 50%
B = 30%
C = 20%
```

Validation：

```text
sum(percentages) === 100
```

---

# 14. Balance Architecture

Balance 不作為主要 Source of Truth。

Source of Truth：

```text
Expenses
Settlements
```

Balance：

```text
Derived Data
```

---

# 15. Balance Calculation

每個 user：

```text
netBalance =
amountPaid
-
personalShare
+
settlementReceived
-
settlementPaid
```

Example：

```text
Dinner = 900

A pays = 900

A share = 300
B share = 300
C share = 300
```

Result：

```text
A = +600
B = -300
C = -300
```

---

# 16. Debt Simplification

Function：

```js
simplifyDebts(balances)
```

Input：

```js
[
  { userId: 'A', balance: 600 },
  { userId: 'B', balance: -300 },
  { userId: 'C', balance: -300 }
]
```

Output：

```js
[
  {
    from: 'B',
    to: 'A',
    amount: 300
  },

  {
    from: 'C',
    to: 'A',
    amount: 300
  }
]
```

Goal：

```text
reduce number of transfers
```

---

# 17. Settlement Data Model

```js
groups/{groupId}/settlements/{settlementId}

{
  payerId: 'uid_2',

  receiverId: 'uid_1',

  amount: 30000,

  date: Timestamp,

  note: '',

  createdBy: 'uid_2',

  createdAt: Timestamp
}
```

Validation：

```text
payerId !== receiverId

amount > 0

payer belongs to group

receiver belongs to group
```

---

# 18. Invitation Model

```js
invitations/{invitationId}

{
  groupId: 'group_123',

  createdBy: 'uid_1',

  token: 'random-secure-token',

  status: 'active',

  createdAt: Timestamp,

  expiresAt: Timestamp
}
```

Flow：

```text
Create Invitation
↓
Generate URL
↓
/invite/[token]
↓
Login
↓
Validate invitation
↓
Check member count < 30
↓
Add current UID to group.memberIds
```

---

# 19. Dashboard

User Dashboard：

- Groups
- Recent Expenses
- Amount You Owe
- Amount Owed To You

---

# 20. Group Dashboard

Display：

- Group Name
- Currency Label
- Members
- Current Balance
- Settlement Suggestions
- Recent Expenses

Actions：

- Add Expense
- Settle Up
- Invite Member
- Group Settings

---

# 21. Routes

```text
/
│
├── login
├── register
├── invite/[token]
│
└── dashboard
    │
    ├── groups
    │   ├── new
    │   │
    │   └── [groupId]
    │       ├── overview
    │       ├── expenses
    │       ├── balances
    │       ├── members
    │       └── settings
    │
    └── profile
```

---

# 22. Next.js Project Structure

```text
src/
│
├── app/
│   │
│   ├── layout.js
│   ├── globals.css
│   │
│   ├── (public)/
│   │   └── page.js
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.js
│   │   └── register/
│   │       └── page.js
│   │
│   ├── (dashboard)/
│   │   ├── layout.js
│   │   │
│   │   └── dashboard/
│   │       ├── page.js
│   │       │
│   │       └── groups/
│   │           ├── new/
│   │           │   └── page.js
│   │           │
│   │           └── [groupId]/
│   │               ├── layout.js
│   │               ├── page.js
│   │               ├── expenses/
│   │               │   └── page.js
│   │               ├── balances/
│   │               │   └── page.js
│   │               ├── members/
│   │               │   └── page.js
│   │               └── settings/
│   │                   └── page.js
│   │
│   ├── invite/
│   │   └── [token]/
│   │       └── page.js
│   │
│   └── api/
│
├── components/
│   │
│   ├── ui/
│   │
│   ├── auth/
│   │
│   ├── group/
│   │   ├── GroupCard.js
│   │   ├── GroupHeader.js
│   │   ├── GroupMembers.js
│   │   └── InviteMemberModal.js
│   │
│   ├── expense/
│   │   ├── ExpenseCard.js
│   │   ├── ExpenseList.js
│   │   ├── ExpenseForm.js
│   │   └── ExpenseSplitForm.js
│   │
│   └── balance/
│       ├── BalanceSummary.js
│       ├── MemberBalance.js
│       └── SettlementSuggestion.js
│
├── hooks/
│   ├── useAuth.js
│   ├── useGroups.js
│   ├── useGroup.js
│   ├── useExpenses.js
│   └── useSettlements.js
│
├── stores/
│   └── uiStore.js
│
├── lib/
│   ├── firebase.js
│   └── firebaseAdmin.js
│
├── services/
│   ├── authService.js
│   ├── groupService.js
│   ├── expenseService.js
│   ├── invitationService.js
│   └── settlementService.js
│
├── utils/
│   ├── money.js
│   ├── splitEqual.js
│   ├── splitExact.js
│   ├── splitPercentage.js
│   ├── calculateBalances.js
│   └── simplifyDebts.js
│
├── constants/
│   ├── categories.js
│   └── currencies.js
│
└── locales/
    ├── en.json
    └── zh-TW.json
```

---

# 23. React State Strategy

## Local State

使用 React local state：

```text
Modal open
Selected member
Temporary UI state
Form interaction
```

---

## Form State

使用：

```text
React Hook Form
+
Yup
```

---

## Derived State

不要額外存進 state。

例如：

```text
Total Expenses
Member Balance
Participant Total
Settlement Suggestions
```

由原始資料計算。

---

## Zustand

只處理真正需要跨頁共享的 UI state。

不要：

```text
把所有 Firebase data 都塞進 Zustand
```

Firestore data 由：

```text
hooks
+
services
```

處理。

---

# 24. Server / Client Component Strategy

Server Component：

- Layout
- Public Page
- Static content
- SEO content

Client Component：

- Firebase Client SDK
- Forms
- Modal
- Realtime listener
- useState
- useEffect
- Browser APIs

Principle：

```text
Keep "use client" boundary as low as practical.
```

---

# 25. Firebase Architecture

```text
Next.js Web
     │
     ├──────── Firebase Authentication
     │
     └──────── Cloud Firestore
                     │
                     └── Security Rules
```

MVP 不建立：

```text
Express.js API Server
```

---

# 26. Firebase Responsibilities

Firebase Authentication：

```text
Register
Login
Logout
Session
Current User
```

Cloud Firestore：

```text
Users
Groups
Expenses
Settlements
Invitations
```

Security Rules：

```text
Authentication validation
Group membership validation
Maximum 30 members
Read permission
Write permission
Data validation
```

App Check：

```text
Reduce unauthorized / scripted access
```

---

# 27. Client → Firebase Data Flow

Example: Add Expense

```text
ExpenseForm
↓
React Hook Form + Yup
↓
expenseService.createExpense()
↓
Firebase SDK
↓
Firestore Security Rules
↓
Cloud Firestore
```

There is no custom REST API in between for normal MVP CRUD.

---

# 28. Firebase Security Principles

Allow only authenticated users.

Group read:

```text
request.auth.uid exists in group.memberIds
```

Expense read/write:

```text
current user belongs to parent group
```

Group update:

```text
current user belongs to group
```

Member limit:

```text
memberIds.length <= 30
```

Security cannot rely on:

```text
hidden buttons
disabled UI
client-side route guards
```

Those are UX only.

---

# 29. Loading / Error / Empty States

Every async feature must handle:

```text
Loading
Success
Empty
Error
```

Examples：

```text
No Groups
No Expenses
No Settlements
Invitation Invalid
Invitation Expired
Group Full
Permission Denied
```

---

# 30. Responsive Strategy

Mobile-first。

Primary scenarios：

- Restaurants
- Travel
- Shopping
- Roommates
- Couples

Mobile：

```text
Single-column
Bottom actions
Fast Add Expense flow
```

Desktop：

```text
Dashboard
Sidebar
Split content
```

---

# 31. MVP Must Have

- Register
- Login
- Logout
- Create Group
- Group max 30 members
- All Group Members have equal permissions
- Invite Member
- Accept Invitation
- Group Currency Label
- Change Currency Label without value conversion
- Add Expense
- Edit Expense
- Delete Expense
- Expense Category
- zh-TW / English category labels
- Equal Split
- Exact Split
- Percentage Split
- Expense History
- Balance Calculation
- Debt Simplification
- Settlement
- Group Settings
- Firestore Security Rules
- Responsive UI

---

# 32. Not MVP

- Currency Conversion
- Exchange-rate API
- Multi-currency calculations
- Owner/Admin permission system
- Native Mobile App
- Receipt OCR
- AI classification
- AI spending insights
- Payment Gateway
- Push Notifications
- Recurring Expenses
- Custom Categories
- Advanced Statistics
- Budget System

---

# 33. Financial Logic Must Be Pure Functions

Core logic should not depend on React.

```text
splitEqual()
splitExact()
splitPercentage()
calculateBalances()
simplifyDebts()
```

Example：

```js
const result = splitEqual({
  amount: 90000,
  participantIds: ['A', 'B', 'C'],
})
```

Benefits：

- Easy unit testing
- Easy debugging
- No UI dependency
- Can later move logic server-side
- Clear portfolio architecture

---

# 34. Testing Priorities

Highest priority：

```text
splitEqual
splitExact
splitPercentage
calculateBalances
simplifyDebts
```

Security tests：

```text
member can read
non-member cannot read
member can write
group cannot exceed 30 members
```

Integration tests：

```text
Create Group
Join Group
Create Expense
Settlement
```

---

# 35. Suggested Development Order

## Phase 1 — Foundation

- Next.js App Router
- Tailwind
- Folder structure
- Firebase setup
- i18n structure

---

## Phase 2 — Authentication

- Register
- Login
- Logout
- Session handling
- Protected dashboard

---

## Phase 3 — Groups

- Create Group
- Group List
- Group Detail
- Currency Label
- Membership check

---

## Phase 4 — Invitations

- Generate invitation
- Invitation page
- Accept invitation
- 30-member limit

---

## Phase 5 — Expense Core

- Expense form
- Category
- Payer
- Participants
- CRUD

---

## Phase 6 — Split Algorithms

- Equal
- Exact
- Percentage
- Validation

---

## Phase 7 — Balance

- calculateBalances
- Balance UI
- simplifyDebts

---

## Phase 8 — Settlement

- Add Settlement
- Settlement history
- Balance recalculation

---

## Phase 9 — Security

- Firestore Rules
- Firebase Emulator tests
- App Check

---

## Phase 10 — Production Polish

- Responsive QA
- Loading states
- Empty states
- Error handling
- Accessibility
- Performance
- Deployment

---

# 36. MVP Acceptance Criteria

MVP is complete when:

1. User A can register.
2. User B can register.
3. User A can create a Group.
4. User A can invite User B.
5. User B can join the Group.
6. All Group Members have identical group permissions.
7. A Group cannot exceed 30 Members.
8. A non-member cannot access Group data.
9. A Member can add an Expense.
10. Expense can have one payer and multiple participants.
11. Equal Split is calculated correctly.
12. Exact Split is calculated correctly.
13. Percentage Split is calculated correctly.
14. Category is stored using a language-neutral key.
15. Category labels work in zh-TW and English.
16. Group currency changes only the display label.
17. Changing currency does not alter historical numeric values.
18. Balance is calculated from Expenses + Settlements.
19. Settlement updates the derived Balance correctly.
20. Debt Simplification returns valid transfer suggestions.
21. Mobile and desktop flows are usable.
22. Firebase Rules block unauthorized reads/writes.

---

# 37. Next Major Step A — UI Direction

This specification intentionally does not decide visual design yet.

Before implementation, decide:

```text
Visual personality
Layout system
Navigation
Mobile interaction
Dashboard density
Typography
Color system
Card / list style
Expense creation interaction
Balance visualization
```

Recommended process：

```text
Reference research
↓
Select 2–3 visual directions
↓
Choose one
↓
Define design tokens
↓
Wireframe core screens
↓
Start implementation
```

Core screens to design first：

```text
Landing
Login / Register
Dashboard
Group Overview
Add Expense
Balance / Settle Up
```

---

# 38. Next Major Step B — AI Implementation Plan

After UI direction is chosen, create a separate implementation document for AI.

It should not ask AI to:

```text
"build the whole app"
```

Instead split implementation into small verified stages.

Example structure：

```text
Step 01 — Bootstrap project
Step 02 — Firebase configuration
Step 03 — Authentication
Step 04 — Dashboard shell
Step 05 — Group model
Step 06 — Group CRUD
Step 07 — Invitation
Step 08 — Expense model
Step 09 — Expense CRUD
Step 10 — Split algorithms
Step 11 — Balance
Step 12 — Settlement
Step 13 — Security rules
Step 14 — Tests
Step 15 — Production QA
```

Each step should define:

```text
Goal
Files to create/change
Data contract
Constraints
Acceptance criteria
What NOT to modify
```

This makes AI-generated implementation easier to review and prevents architecture drift.

---

# 39. Architecture Principle

The project should keep four concerns separate:

```text
UI
↓
Hooks
↓
Services
↓
Firebase
```

Financial business logic stays separate:

```text
Pure Functions
```

Result：

```text
React UI
does not own financial rules

Firebase
does not own presentation rules

Currency label
does not alter financial values

Locale
does not alter stored category keys
```

---

# 40. Final MVP Architecture

```text
GitHub
   │
   ▼
Next.js
   │
   ├── React UI
   ├── React Hook Form + Yup
   ├── Custom Hooks
   ├── Services
   ├── Pure Financial Functions
   │
   ▼
Firebase
   │
   ├── Authentication
   ├── Firestore
   ├── Security Rules
   └── App Check
```

No traditional custom backend is required for the MVP.
