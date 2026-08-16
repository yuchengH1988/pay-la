# Pay La — UI Guidelines

Pay La uses a playful, bold, colorful, slightly retro visual language.

`/ui` is the visual reference for the design system.
`app/globals.css` is the source of truth for design tokens and global styles.

This document defines design principles, not product behavior or component APIs.

---

## 1. Design Direction

Pay La should feel:

- Playful
- Bold
- Friendly
- Colorful
- Slightly retro
- Graphic rather than corporate

The visual language is inspired by editorial and poster design while keeping financial information easy to scan.

Key characteristics:

- Warm off-white surfaces
- Near-black ink and strong borders
- High-saturation accent colors
- Condensed display typography
- Mono-style numeric typography
- Hard offset shadows
- Low-radius geometric components
- Graphic elements such as dots, stripes, blocks, and arrows

Financial information always takes priority over decoration.

---

## 2. Color

Use semantic design tokens instead of raw colors inside components.

Core roles include:

- Background / Surface
- Foreground / Muted
- Border
- Primary / Secondary / Accent
- Success / Warning / Danger / Info

Light and Dark themes use the same semantic roles.

Dark mode should preserve the same playful, high-contrast personality rather than simply invert the light theme.

Actual color values are defined in `app/globals.css`.

---

## 3. Typography

Typography has three primary roles:

### Display

Bold, condensed, and expressive.

Used for page titles, major headings, and graphic statements.

### Body

Optimized for readability.

Used for forms, labels, descriptions, metadata, and general UI.

### Amount

Used for financial values and balances.

Amounts should have strong visual hierarchy and remain easy to scan.

Use the existing semantic `type-*` utilities rather than recreating typography styles inside components.

The complete typography scale can be previewed in `/ui`.

---

## 4. Shape & Visual Treatment

### Borders

Strong borders are a defining part of the Pay La visual language.

### Radius

Prefer low-radius geometric shapes over soft, highly rounded UI.

### Shadows

Use hard offset shadows rather than soft blurred shadows.

### Graphic Elements

Dots, stripes, arrows, and graphic blocks may be used to add personality.

Decoration should never interfere with financial information or interaction.

---

## 5. Components

Reuse existing components and design tokens before introducing new visual patterns.

Generic UI components live in:

`src/components/ui`

Domain components live in their corresponding feature directories.

Components should maintain:

- Clear visual hierarchy
- Visible interactive states
- Touch-friendly controls
- Consistent borders, radius, and shadows
- Semantic feedback colors

Product components should make amounts, balances, payer information, and settlement direction easy to scan.

Use `/ui` as the reference for available components, variants, sizes, and states.

---

## 6. Responsive Design

Pay La is mobile-first.

Mobile layouts prioritize:

- Fast expense entry
- Clear balances
- Touch-friendly controls
- Easy scanning

Desktop layouts should use additional space to improve hierarchy and information density rather than simply stretching mobile layouts.

---

## 7. Accessibility

Maintain:

- Sufficient contrast
- Visible focus states
- Touch-friendly interactive targets
- Clear hierarchy beyond color alone

Financial states such as owed, owing, success, or error must not rely only on color.

Motion should remain subtle and functional.

If larger motion is introduced, reduced-motion behavior should also be provided.

---

## Source of Truth

| Concern | Source |
| --- | --- |
| Visual reference | `/ui` |
| Design tokens | `app/globals.css` |
| Components | `src/components` |
| Product behavior | `docs/PRODUCT_SPEC.md` |

When the design system changes, update this document only when the change represents an established design rule.