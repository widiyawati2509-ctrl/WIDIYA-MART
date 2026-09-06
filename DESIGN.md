# Widiya Mart Design System Specification (`DESIGN.md`)

Documented design system for **Widiya Mart / PENGENJEK MART** e-commerce web application.
This document serves as the single source of truth for aesthetics, typography, color palettes, spacing, motion, component design, and print thermal receipt standards.

---

## 1. Brand Essence & Aesthetics

* **Brand Personality**: Friendly, warm local minimarket, fast delivery, trustworthy cash-on-delivery (COD).
* **Visual Theme**: **3D Puffy Neumorphic Coral**.
  - Warm cream/paper backdrop (`#FAF0EB`) paired with crisp white cards (`#FFFFFF`) and vibrant coral accents (`#FF6B35`).
  - Subtle inset highlights (`inset 0 1px 0 #ffffff`) and warm diffused shadows for a tactile, touch-friendly physical feel.
* **Viewport Target**: Mobile-first retail ergonomics (`max-width: 480px` centered shell) with seamless responsive tablet/desktop scaling.

---

## 2. Color Palette & Semantic Tokens

| Token | Hex Value | Semantic Usage |
|---|---|---|
| `--paper` | `#FAF0EB` | Page background (warm cream) |
| `--card` | `#FFFFFF` | Card surface, modal sheet, popover background |
| `--navy` | `#2B1810` | Dark coffee navy (app topbar branding, dark cards, bottom-nav) |
| `--ink` | `#23150F` | Primary text, titles, prominent price labels |
| `--ink-soft` | `#5E443B` | Muted subtitles, descriptions (WCAG AAA compliant > 7.9:1) |
| `--line` | `#E8D6CD` | Subtle card borders, dividers, chip outlines |
| `--accent` | `#FF6B35` | Vibrant coral/orange (primary CTA, active icons, brand badges) |
| `--accent-2` | `#E85521` | Darker coral for gradient stops, active states, and focus |
| `--accent-bg` | `#FFEBE3` | Soft coral tint for tags, badges, active tabs |
| `--success` | `#10B981` | Order completed, in-stock badge, free shipping alert |
| `--warning` | `#F59E0B` | Loyalty points, processing order badge, promo tags |
| `--danger` | `#E74C3C` | Order canceled, delete action, out-of-stock badge |

---

## 3. Typography Scale & Hierarchy

* **Heading Font**: `Sora` (`'Sora', sans-serif`, weights: 600, 700, 800) — Modern geometric rounded display font with high legibility.
* **Body & UI Font**: `Inter` (`'Inter', sans-serif`, weights: 400, 500, 600, 700) — Clear, neutral reading font for numbers, prices, and long descriptions.

### Type Scale:
- **Display / Big Numbers**: `32px – 36px` font-extrabold (`font-sora`, tabular numbers for points/currency).
- **Page Title**: `18px – 20px` font-bold (`font-sora`).
- **Section Heading**: `15px – 16px` font-bold (`font-sora`).
- **Product Title**: `12px – 13px` font-semibold, 2-line clamp (`line-clamp-2`).
- **Price Label**: `13px – 14px` font-extrabold (`font-sora text-[var(--accent-2)]`).
- **Caption / Meta**: `10.5px – 11px` font-medium (`text-[var(--ink-soft)]`).

---

## 4. Spacing, Elevation & Corner Radii

* **Corner Radius Scale**:
  - Small (`--radius-sm`): `12px` (badges, chips, small buttons)
  - Medium (`--radius-md`): `16px` (inputs, thumbnails, floating pills)
  - Large (`--radius-lg`): `20px` (product cards, modal alerts)
  - Extra Large (`--radius-xl`): `24px` (hero banners, bottom sheet cards)
* **Shadow Elevation**:
  - Default Card: `--shadow-3d` (`0 10px 25px -5px rgba(232,85,33,.12), inset 0 1px 0 #ffffff`)
  - Primary Button: `--shadow-btn` (`0 8px 20px -2px rgba(255,107,53,.42)`)
  - Floating Nav: `--shadow-nav` (`0 16px 35px -6px rgba(43,24,16,.5)`)

---

## 5. Mobile Retail Layout Patterns (Alfagift / Indomaret Model)

1. **Horizontal Carousel Cards**:
   - Beranda product sections use horizontal scroll row: `flex row`, `overflow-x-auto`, `snap-x snap-mandatory`, `scrollbar-hide`.
   - Card width is fixed (`w-40` or `w-[42%]`) with peek affordance so the next item teases from the right viewport edge.
2. **Bottom Navigation Shell**:
   - Fixed at viewport bottom with safe-area insets (`pb-safe`).
   - Deep coffee pill background with high-contrast icon states and notification dots.
3. **Cart & Action Buttons**:
   - Bounded touch targets (`min-height: 44px`).
   - Active micro-interaction: `active:scale-95 transition-all`.

---

## 6. Thermal Receipt Standard (58mm POS Printers)

* **Physical Paper Width**: `58mm`
* **Safe Printable Area**: `max-width: 48mm`
* **Page Margin**: `0`
* **Padding**: `3mm 2.5mm`
* **Print Font**: `9.5px – 10.5px`, `line-height: 1.25`, monospace/clean sans.
* **Footer**: Single-line concise closing: `"Terima kasih!"`.
* **Media Query Isolation**: `@media print` strictly hides web UI, header, and buttons; only `#receipt-print-area` is rendered.
