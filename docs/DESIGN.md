# CampusConnect DESIGN.md — MIT-ADT Light

Source of truth for every page. Read before generating any screen.
Brand reference: mituniversity.edu.in — deep purple header, magenta gradient heroes, white surfaces, orange CTAs.

## 1. Concept
Clean light product UI in white + lavender-gray, deep purple primary, magenta reserved for hero/PR moments, orange used sparingly. Think Linear / Vercel dashboard体系 with a university brand, not a SaaS template.

## 2. Tokens (tailwind theme)
- Surfaces: white cards/page, `surface #F6F5FA` app bg, borders `border`.
- Text: `ink #1E1B26`, `sub #655E76`.
- Brand scale: 50 `#F5F0FA`, 100 `#E9DDF5`, 200 `#D3BCEA`, 500 `#7C3FB0`, 600 `#5E2D91`, 700 `#4A2373`.
- Accents: `magenta #C13584` (gradients only), `ember #F26522` (CTAs sparingly), emerald/amber/red-50 tints for status.
- Banned: any hex color in class names (use tokens), paper/beige backgrounds, black sidebar, gold, mono uppercase eyebrow labels on everything, `shadow-subtle`.

## 3. Typography
- Display: Plus Jakarta Sans Extrabold (`font-display`) — hero + page titles + stat values.
- Body: Public Sans. Tables/forms 14px.
- Data: JetBrains Mono — attendance %, marks, rupee fees, timetable times.
- Section labels: `text-xs font-semibold uppercase tracking-wider text-sub` — sparingly.

## 4. Shape / shadow / spacing
- Radius: 12px cards (`rounded-xl`), 8px inputs/buttons (`rounded-lg`), full pills for badges.
- Shadows: `shadow-card` default, `shadow-pop` on hover/dialogs.
- Rhythm: page `p-5 lg:p-8 max-w-6xl`, stack `gap-4/6`, table `py-3 px-4`.

## 5. Layout
- Shell: white sidebar (icon + label, active = `bg-brand-50 text-brand-700` + dot), breadcrumb top-nav + avatar, mobile drawer.
- Dashboards: header (display title + sub) → stat cards with icon tiles → data Card (header + table/list). Reveal stagger on sections, never on every row.
- Status always via `StatusBadge`/`Badge`. Buttons via `Button`, inputs via `Input`, tables via `Table` primitives.

## 6. Motion
- Route changes: `PageTransition` (AnimatePresence `mode="wait"`, pathname key, 220ms fade+rise) mounted once in `(dashboard)/template.tsx`.
- Entrances: `Reveal` with small stagger delays. `MotionConfig reducedMotion="user"` globally. No layout animations on tables, no spinners without skeletons.
