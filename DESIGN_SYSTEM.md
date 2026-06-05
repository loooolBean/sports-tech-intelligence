# Sports Tech Intelligence — Design System

## Design References
- **Homepage**: The Verge — bold hero, editorial grid, visual hierarchy
- **Article Page**: Medium — focused reading, clean typography
- **Navigation**: Linear — minimal, dark, precise
- **Components**: shadcn/ui
- **Animations**: Framer Motion

---

## 1. Typography Scale

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|-------|------|--------|-------------|----------------|-----|
| `display` | 4rem (64px) | 800 | 1.05 | -0.03em | Hero headline |
| `h1` | 2.5rem (40px) | 700 | 1.15 | -0.025em | Page title |
| `h2` | 1.75rem (28px) | 700 | 1.25 | -0.02em | Section title |
| `h3` | 1.25rem (20px) | 600 | 1.35 | -0.01em | Card title |
| `body-lg` | 1.125rem (18px) | 400 | 1.75 | 0 | Article body |
| `body` | 1rem (16px) | 400 | 1.65 | 0 | Default text |
| `caption` | 0.8125rem (13px) | 500 | 1.5 | 0.01em | Meta, labels |
| `overline` | 0.6875rem (11px) | 600 | 1.5 | 0.08em | Category tag |

**Font Stack**: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

---

## 2. Color System

### Light Mode
| Token | Hex | Use |
|-------|-----|-----|
| `bg` | `#FAFAFA` | Page background |
| `bg-card` | `#FFFFFF` | Card surface |
| `bg-elevated` | `#F5F5F5` | Hover, active states |
| `border` | `#E5E5E5` | Default borders |
| `border-subtle` | `#F0F0F0` | Dividers |
| `text-primary` | `#0A0A0A` | Headlines |
| `text-secondary` | `#525252` | Body text |
| `text-tertiary` | `#A3A3A3` | Meta, captions |
| `accent` | `#E11D48` | Brand red (The Verge inspired) |
| `accent-hover` | `#BE123C` | Accent hover |

### Dark Mode
| Token | Hex | Use |
|-------|-----|-----|
| `bg` | `#0A0A0A` | Page background |
| `bg-card` | `#171717` | Card surface |
| `bg-elevated` | `#262626` | Hover, active states |
| `border` | `#262626` | Default borders |
| `border-subtle` | `#1F1F1F` | Dividers |
| `text-primary` | `#FAFAFA` | Headlines |
| `text-secondary` | `#A3A3A3` | Body text |
| `text-tertiary` | `#737373` | Meta, captions |
| `accent` | `#FB7185` | Brand red (lighter for dark) |
| `accent-hover` | `#F43F5E` | Accent hover |

---

## 3. Spacing Scale

| Token | Value | Use |
|-------|-------|-----|
| `space-1` | 0.25rem (4px) | Tight gaps |
| `space-2` | 0.5rem (8px) | Compact gaps |
| `space-3` | 0.75rem (12px) | Default gaps |
| `space-4` | 1rem (16px) | Card padding |
| `space-6` | 1.5rem (24px) | Section gaps |
| `space-8` | 2rem (32px) | Large gaps |
| `space-12` | 3rem (48px) | Section spacing |
| `space-16` | 4rem (64px) | Page sections |
| `space-24` | 6rem (96px) | Hero spacing |

---

## 4. Layout

| Token | Value | Use |
|-------|-------|-----|
| `max-w-prose` | 42rem (672px) | Article body |
| `max-w-content` | 72rem (1152px) | Page content |
| `max-w-wide` | 80rem (1280px) | Full-width sections |

---

## 5. Card Design

### Article Card (Homepage Grid)
```
┌─────────────────────────┐
│  [Image placeholder]    │
│                         │
│  CATEGORY · 5 MIN READ  │  ← overline, text-tertiary
│                         │
│  Article Title Here     │  ← h3, text-primary, font-semibold
│                         │
│  Brief excerpt text     │  ← body, text-secondary, line-clamp-2
│  that goes here...      │
│                         │
│  Source · Date          │  ← caption, text-tertiary
└─────────────────────────┘
```

### Hero Card (Featured)
```
┌────────────────────────────────────────────┐
│                                            │
│  [Large Image]                             │
│                                            │
│  CATEGORY                                  │  ← overline, accent
│                                            │
│  Big Bold Headline                         │  ← display-sm, text-primary
│  That Spans Two Lines                      │
│                                            │
│  Excerpt paragraph that gives context...   │  ← body-lg, text-secondary
│                                            │
│  Source · Author · Date                    │  ← caption, text-tertiary
└────────────────────────────────────────────┘
```

---

## 6. Component Patterns

### Navigation (Linear Style)
- Dark background (`bg-primary`)
- Minimal, horizontal layout
- Logo left, links center, CTA right
- Subtle border-bottom
- No excessive decoration

### Article Page (Medium Style)
- Narrow prose width (672px)
- Large drop cap on first paragraph
- Generous line height (1.75)
- Floating share bar (optional)
- Clean footer with tags

### Category Headers
- Large category name
- Article count
- Optional description
- Breadcrumb navigation

---

## 7. Animations (Framer Motion)

| Pattern | Duration | Easing |
|---------|----------|--------|
| Page enter | 0.3s | ease-out |
| Card hover | 0.2s | ease-out |
| Stagger children | 0.05s delay | ease-out |
| Fade in | 0.4s | ease-out |
| Slide up | 0.3s | ease-out |

---

## 8. Responsive Breakpoints

| Breakpoint | Width | Columns |
|------------|-------|---------|
| `sm` | 640px | 1 |
| `md` | 768px | 2 |
| `lg` | 1024px | 3 |
| `xl` | 1280px | 4 |
