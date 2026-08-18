# Pay La — Product Specification

> Shared Expense Tracking & Settlement Web Application

**Status:** MVP  
**Last Updated:** 2026-08-14

---

# 1. Product Overview

## 1.1 Product

Pay La 是一個多人共享消費與分帳 Web App。

適用情境包括：

- 情侶共同生活
- 朋友聚餐
- 多人旅行
- 室友共同支出
- 聚會與活動

核心流程：

```text
Google Sign-In
↓
建立或加入群組
↓
新增共同消費
↓
設定付款者與分攤方式
↓
查看 Balance
↓
完成還款
```

---

## 1.2 Product Principles

產品設計優先考慮：

### Simple

分帳流程應保持簡單，避免為少數情境增加不必要操作。

### Mobile First

主要使用情境可能發生在餐廳、旅行、購物等場合，因此核心操作應優先考慮手機。

### Clear Balance

使用者應能快速理解：

- 我欠誰錢？
- 欠多少？
- 誰欠我錢？
- 欠多少？

### Fast Expense Entry

`Add Expense` 是產品最重要且最頻繁的操作之一，應容易找到並快速完成。

### Light & Dark

所有主要介面必須同時支援 Light Mode 與 Dark Mode。

---

# 2. User & Authentication

## 2.1 Google Sign-In

Pay La MVP 只提供：

**Continue with Google**

不提供：

- Email / Password Registration
- Email / Password Login
- Facebook Login
- Apple Login
- Guest Account

第一次使用 Google 登入時，自動建立 Pay La 使用者。

---

## 2.2 User Profile

使用者基本資料來自 Google Account：

- Display Name
- Email
- Profile Image

使用者登入後可以：

- 建立 Group
- 加入 Group
- 查看自己的 Groups
- 新增 Expense
- 查看 Balance
- 建立 Settlement

---

## 2.3 Dashboard

登入後進入 Dashboard。

主要顯示：

- Groups
- Recent Expenses
- You Owe
- You Are Owed

主要操作：

- Create Group
- Open Group

---

# 3. Groups & Invitations

## 3.1 Create Group

使用者可以建立共同消費 Group。

建立時需要：

- Group Name
- Currency

例如：

```text
Japan Trip
JPY
```

建立者自動加入 Group。

---

## 3.2 Members

每個 Group：

- 最少 1 人
- 最多 30 人

所有 Group Members 權限相同。

MVP 不存在：

- Owner
- Admin
- Moderator
- Viewer

任何 Group Member 都可以：

- 查看 Group
- 新增、修改、刪除 Expense
- 查看 Balance
- 建立 Settlement
- 邀請其他使用者
- 修改 Group Name
- 修改 Currency

Non-Member 無法查看或操作 Group 內容。

---

## 3.3 Invite by Link

Group Member 可以建立 Invitation Link。

流程：

```text
Create Invitation
↓
Copy / Share Link
↓
Receiver Opens Link
↓
Google Sign-In
↓
Join Group
```

如果接收者已登入，可以直接進入 Join Group 流程。

---

## 3.4 Invitation Rules

Invitation 必須：

- 對應到特定 Group
- 具有有效 / 無效狀態
- 只能加入指定 Group

如果使用者已經是 Member：

直接進入 Group，不重複加入。

如果 Group 已達：

```text
30 / 30
```

顯示 Group Full，禁止加入。

---

## 3.5 QR Code

QR Code Invitation 不屬於 MVP。

Future 可以讓使用者：

```text
Create Invitation
↓
Show QR Code
↓
另一位使用者掃描
↓
Join Group
```

QR Code 與 Invitation Link 應指向相同的加入流程。

---

## 3.6 Currency

每個 Group 有一個 Currency，例如：

- TWD
- USD
- JPY
- EUR
- GBP

Currency **只負責金額的顯示單位，不代表貨幣換算。**

例如：

```text
Currency:
TWD

Amount:
1000

Display:
NT$1,000
```

如果 Group Currency 改成 USD：

```text
Amount:
1000

Display:
US$1,000
```

數值仍然是：

```text
1000
```

修改 Currency：

- 不重新計算 Expense
- 不修改歷史 Amount
- 不進行 Exchange Rate Conversion

MVP 不支援 Multi-Currency Calculation。

---

# 4. Expenses

## 4.1 Create Expense

Group Member 可以新增 Expense。

一筆 Expense 包含：

**Required**

- Name
- Amount
- Category
- Paid By
- Participants
- Split Method
- Date

**Optional**

- Note

例如：

```text
Dinner

NT$1,200

Paid by:
Calvin

Participants:
Calvin
Harry

Split:
Equal
```

---

## 4.2 Payer

每筆 Expense MVP 只支援：

**One Payer**

Payer 必須是 Group Member。

Payer 不一定需要是 Participant。

例如：

```text
Calvin 幫 Harry 和 Amy 付款

Paid By:
Calvin

Participants:
Harry
Amy
```

是有效 Expense。

### Payer and Split Responsibility

`paidBy` 與 Split responsibility 是兩個獨立概念。

付款者不一定需要負擔該筆 Expense。

例如：

```text
Calvin pays NT$600

Harry is responsible for NT$600
```

也是有效 Expense。

另一個有效例子：

```text
Calvin pays NT$600

Calvin is responsible for 20%
Harry is responsible for 80%
```

`paidBy` 只記錄誰支付了原始 Expense。

Resolved participant shares 記錄誰實際負擔該筆 Expense，以及各自負擔多少。

Multiple Payers 不屬於 MVP。

---

## 4.3 Participants

一筆 Expense 可以由部分或全部 Group Members 共同分攤。

Participants：

- 必須屬於目前 Group
- 至少需要一位

沒有參與該筆 Expense 的 Group Member 不需要負擔該筆費用。

---

## 4.4 Categories

每筆 Expense 必須選擇 Category。

MVP 使用一組固定的高頻分類，約 15–25 個。

例如：

- Food
- Groceries
- Transport
- Housing
- Utilities
- Entertainment
- Shopping
- Travel
- Health
- Education
- Subscriptions
- Pets
- Gifts
- Insurance
- Other

Category 是語言無關的概念。

例如同一個 Category：

```text
English
Groceries

Traditional Chinese
食品雜貨
```

切換語言只改變顯示名稱，不改變 Expense 本身。

MVP 不提供 Custom Category。

---

## 4.5 Expense History

Group Member 可以查看 Group 的 Expense History。

每筆紀錄至少顯示：

- Name
- Category
- Amount
- Date
- Paid By
- Current User's related balance

---

## 4.6 Edit & Delete

任何 Group Member 都可以修改或刪除 Group 中的 Expense。

可以修改：

- Name
- Amount
- Category
- Paid By
- Participants
- Split Method
- Date
- Note

修改或刪除 Expense 後，Balance 必須反映最新結果。

刪除 Expense 前必須提供確認操作。

---

# 5. Splitting & Balance

## 5.1 Split Methods

MVP 支援三種 Split Method：

- Equal — 將 Expense 平均分給選取的 Participants
- Exact Amount — 為每位選取的 Participant 指定確切金額
- Percentage — 為每位選取的 Participant 指定百分比

Exact Amount split 中，所有 Participant amount 加總必須等於 Expense amount。

Percentage split 中，所有 Participant percentage 加總必須等於 100%。

編輯過程中可以顯示尚未完整分配的狀態，但 invalid split 不能儲存。

### Equal

平均分攤。

```text
NT$900

A
B
C

→

A = 300
B = 300
C = 300
```

如果無法平均整除，系統必須處理最小金額單位的差額。

最終所有人的 Share 加總必須等於 Expense Amount。

---

### Exact Amount

直接指定每個人的金額。

```text
NT$1,000

A = 200
B = 300
C = 500
```

必須：

```text
200 + 300 + 500 = 1000
```

否則不能儲存。

---

### Percentage

指定每人的比例。

```text
A = 50%
B = 30%
C = 20%
```

所有 Percentage 必須：

```text
Total = 100%
```

否則不能儲存。

因百分比產生的最小金額差額必須被正確處理，使最終 Share 總和等於 Expense Amount。

---

## 5.2 Balance

Balance 根據：

```text
Expenses
+
Settlements
```

計算目前每位 Member 的淨債務狀態。

例如：

```text
Dinner
NT$900

Paid by A

A / B / C
Equal Split
```

結果：

```text
A = +600
B = -300
C = -300
```

代表：

```text
B owes A NT$300
C owes A NT$300
```

---

## 5.3 Balance Summary

使用者應能看到：

```text
You Owe
NT$500
```

以及：

```text
You Are Owed
NT$1,200
```

如果沒有任何未結清 Balance：

```text
You're all settled up.
```

---

## 5.4 Debt Simplification

系統可以根據 Group Members 的最終 Balance，提供較少轉帳次數的 Settlement Suggestions。

例如：

```text
A owes B 300
B owes C 500
```

可以簡化成：

```text
A → C 300
B → C 200
```

簡化後：

- 每個人的最終 Balance 必須保持相同
- 不得改變任何歷史 Expense
- 只影響系統提供的還款建議

---

# 6. Settlement

Settlement 代表 Group Members 之間實際完成的還款。

例如：

```text
Harry → Calvin

NT$500
```

---

## 6.1 Create Settlement

建立 Settlement 需要：

- Payer
- Receiver
- Amount
- Date

Optional：

- Note

規則：

- Payer 必須是 Group Member
- Receiver 必須是 Group Member
- Payer 與 Receiver 不可以相同
- Amount 必須大於 0

---

## 6.2 Balance Update

Settlement 完成後，Balance 必須立即反映。

例如：

```text
Harry owes Calvin
NT$500
```

建立：

```text
Harry → Calvin
NT$500
```

結果：

```text
NT$0

You're all settled up.
```

---

## 6.3 Settlement History

Group Member 可以查看過去的 Settlement。

至少顯示：

- Payer
- Receiver
- Amount
- Date

---

# 7. Product Experience

## 7.1 Language

MVP 支援：

- Traditional Chinese (`zh-TW`)
- English (`en`)

切換語言會改變：

- UI Text
- Category Labels
- Buttons
- Validation Messages
- Status Messages

不會改變：

- Amount
- Expense
- Balance
- Settlement
- Group Data

---

## 7.2 Theme

MVP 支援：

- Light Mode
- Dark Mode

所有主要功能頁面與 Components 都必須能在兩種模式正常閱讀與操作。

Theme 不影響任何產品資料。

---

## 7.3 Responsive Design

Pay La 是 Responsive Web Application。

必須支援：

- Mobile
- Tablet
- Desktop

核心操作優先針對 Mobile 設計。

尤其：

```text
Add Expense
Invite
Balance
Settle Up
```

---

## 7.4 System States

主要功能必須考慮四種基本狀態：

```text
Loading
Success
Empty
Error
```

例如：

### Empty

```text
No expenses yet.
Add your first expense.
```

```text
No groups yet.
Create your first group.
```

```text
You're all settled up.
```

### Error

至少需要處理：

- Google Sign-In Failed
- Group Not Found
- Permission Denied
- Invitation Invalid
- Invitation Expired
- Group Full
- Expense Not Found
- Invalid Split
- Network Error

錯誤訊息應清楚告訴使用者發生什麼問題。

---

# 8. Product Scope

## 8.1 MVP

### Authentication
- Google Sign-In
- Logout

### Dashboard
- Group List
- Recent Expenses
- You Owe
- You Are Owed

### Group
- Create Group
- Edit Group
- Maximum 30 Members
- Equal Member Permissions
- Currency Display Setting

### Invitation
- Create Invitation Link
- Copy / Share Invitation Link
- Join Group

### Expense
- Create
- Edit
- Delete
- History
- Fixed Categories
- One Payer
- Selected Participants

### Split
- Equal
- Exact Amount
- Percentage

### Balance
- Member Balance
- You Owe
- You Are Owed
- Debt Simplification

### Settlement
- Create Settlement
- Settlement History

### Experience
- Traditional Chinese
- English
- Light Mode
- Dark Mode
- Mobile / Tablet / Desktop

---

## 8.2 Future

以下不屬於 MVP：

### Group & Invitation
- Invitation QR Code
- Member Roles / Permissions

### Expense
- Multiple Payers
- Custom Categories
- Recurring Expenses
- Receipt Upload
- Receipt OCR
- Expense Search / Advanced Filters

### Currency
- Currency Conversion
- Exchange Rate
- Historical Exchange Rates
- Multi-Currency Calculation

### Account
- Additional Login Methods
- Profile Customization

### Analytics
- Category Breakdown
- Monthly Reports
- Spending Trends
- Budget Management

### Platform
- PWA
- Offline Support
- Push Notifications
- Native Mobile Apps
- CSV Export

### Advanced
- Payment / Bank Integration
- AI Expense Classification
- AI Spending Insights

---

# Product Rule Priority

本文件定義 Pay La 的產品功能與 Business Rules。

其他文件可以定義：

- UI Design
- Technical Architecture
- Implementation
- Development Workflow

但不應自行修改本文件中的產品行為。

如果實作過程遇到本文件沒有定義的產品情境：

**先確認需求，再實作，不自行新增 Business Rule。**
