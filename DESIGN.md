# Widiya Mart / PENGENJEK MART Design System Specification (`DESIGN.md`)

Documented design system for **PENGENJEK MART (Widiya Mart)** e-commerce web application.
This document serves as the single source of truth for aesthetics, typography, color palettes, spacing tokens, motion, component design, sticky header ergonomics, and print thermal receipt standards.

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
| `--accent` | `#FF6B35` | Vibrant coral/orange (primary CTA, active icons, brand badges, Admin Mode) |
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

## 4. Spacing, Elevation & Compact Card Standards

### A. Compact Spacing Tokens
To maximize visible content per viewport while preserving legibility and tap accessibility, spacing across all cards is standardized as follows:

- **ProductCard (`ProductCard.tsx`)**:
  - Container padding: `p-2.5` (10px).
  - Image container margin: `mb-1.5`, inner image padding: `p-1`.
  - Typography spacing: `mb-0.5` between category, title, and price.
  - Action footer: `mt-1.5 pt-1.5`.
  - Product images and typography sizes remain 100% full-scale.
- **Generic Cards (`Card` in `ui.tsx`)**: `p-3` (12px), reduced from `p-4` to remove dead space.
- **List Item Cards (Cart, Wishlist, Orders, Admin Rows)**: `py-2.5 px-3` (10px vertical, 12px horizontal).
- **Grids & Carousels**: `gap-2` (8px) between items.
- **Touch Target Ergonomic Rule**: All buttons, chips, and interactive icons maintain a minimum interactive hit area of $\ge 40\times 40$px (`min-h-[40px]`).

### B. Corner Radii & Shadows
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

## 5. Sticky Header & Scroll Transition Architecture

The homepage header implements a high-performance, scroll-linked collapse pattern designed for maximum screen efficiency:

1. **Component Separation for Zero Layout Shift**:
   - The store branding info (`Nama Toko`, `Logo`, `Tagline`, `Favorit`, and unified `AddressSelector`) and the search bar are split into independent sibling DOM elements inside the root page flow (`<div className="w-full pb-32">`).
   - Store info is in regular document flow and collapses smoothly.
   - The `SearchBar` is permanently `sticky top-[var(--admin-bar-offset,0px)]` with its own blurred translucent backdrop (`rgba(250,240,235,0.96)`). It never participates in disappearing and remains docked across the entire page.

2. **1-to-1 Linear Interpolation (`useScrollHeader`)**:
   - Rather than relying on discrete toggle transitions (`max-height` or step classes) which suffer from dead-zones or jerky animations, the collapse tracks window scroll position in real-time:
     $$\text{progress} = \min\left(1, \frac{\text{scrollY}}{60}\right)$$
     $$\text{opacity} = 1 - \text{progress}$$
     $$\text{translateY} = -(\text{progress} \times 12)\text{px}$$
   - When $\text{progress} = 1$, the store info applies `visibility: hidden` and `pointer-events: none` to prevent phantom clicks.
   - When scrolling back up, opacity and transform smoothly reverse in direct proportion to touch motion.

3. **Unified Single-Line Info Row**:
   - Active delivery address and store operating hours are merged into a single compact line below the store title:
     `📍 Rumah · Pengenjek lauk dusun... · 🟢 Buka 06:00-23:00 [Ganti]`
   - Eliminates redundant card frames and frees up vertical screen estate so product catalog is immediately visible above the fold.
   - The address selection bottom sheet is portaled directly to `document.body` to avoid stacking context clipping from header backdrop filters.

4. **Mode Admin Full-Bleed Status Bar**:
   - When an administrator views the store, the top Mode Admin bar extends into the device status bar / notch area via `padding-top: env(safe-area-inset-top)`.
   - The page `<meta name="theme-color">` dynamically switches to `#FF6B35` so browser chrome and physical device cutouts render as one cohesive, seamless orange surface.

---

## 6. Mobile Retail Layout Patterns (Alfagift / Indomaret Model)

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

## 7. Media, Video & Gesture Scrolling Standards (Instagram/Facebook Feed Ergonomics)

All media elements (hero banners, image carousels, photo galleries, and future video players) across **PENGENJEK MART** must strictly obey natural, uninhibited vertical page scrolling:

1. **Zero Vertical Scroll Locking**:
   - Swiping vertically over any image, carousel, banner, or video must **always** scroll the page naturally without resistance or delay (identical to Facebook, Instagram, or TikTok vertical feed scrolling).
2. **Technical Implementation Rules**:
   - **NO `onTouchMove` with `preventDefault()`**: Never intercept or prevent default events during touch movement.
   - **`touchstart` + `touchend` Gesture Detection Only**: Swipes must be calculated exclusively by comparing start coordinates on `touchstart` and end coordinates on `touchend`.
   - **Horizontal Dominance Validation**: Only trigger horizontal slide changes if `Math.abs(diffX) >= 45` AND `Math.abs(diffX) > Math.abs(diffY) * 1.2`. If vertical motion dominates or is close, discard the swipe so the page scrolls vertically without accidental slide changes.
   - **CSS `touch-action: pan-y` (`touch-pan-y`)**: Always add `touch-pan-y` to swipeable media wrappers. This signals the browser's touch pipeline that vertical dragging has primary native authority.
   - **NEVER use `touch-pan-x`**: Do not use `touch-pan-x` on horizontal content lists because mobile browsers interpret it as a directive to disable vertical gestures.
   - **Standard Reusable Hook**: All swipeable components must use `useSwipeGesture` from `@/lib/useSwipeGesture`.
3. **Video Integration Standard**:
   - Future video components (product previews, promotional clips) must be rendered as standard inline document elements inside normal page scroll flow.
   - Automatic video autoplay must remain silent (`muted`, `playsinline`), never lock or snap scroll position, and fullscreen is only triggered upon explicit user tap.

---

## 8. Thermal Receipt Standard (58mm POS Printers)

* **Physical Paper Width**: `58mm`
* **Safe Printable Area**: `max-width: 48mm`
* **Page Margin**: `0`
* **Padding**: `3mm 2.5mm`
* **Print Font**: `9.5px – 10.5px`, `line-height: 1.25`, monospace/clean sans.
* **Footer**: Single-line concise closing: `"Terima kasih!"`.
* **Media Query Isolation**: `@media print` strictly hides web UI, header, and buttons; only `#receipt-print-area` is rendered.
