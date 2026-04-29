# ARHDAY — Photography Portfolio

A production-ready Next.js rebuild of the [ARHDAY Framer website](https://sleepy-sandwich-485491.framer.app/).

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** — full type safety
- **Tailwind CSS** — utility-first styling
- **Google Fonts** — Playfair Display (serif display) + Outfit (clean sans)

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open in browser
# → http://localhost:3000
```

## Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
arhday/
├── app/
│   ├── layout.tsx          # Root layout — fonts, metadata, Navbar
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles, animations, custom CSS
│   ├── work/
│   │   └── page.tsx        # Work / Projects page
│   └── contact/
│       └── page.tsx        # Contact page with form
│
├── components/
│   ├── Navbar.tsx          # Fixed navbar — sticky, blur on scroll, mobile menu
│   ├── Hero.tsx            # Scattered photo collage section
│   ├── IntroSection.tsx    # "Lights, Lens and Adegheosa" heading + bio
│   ├── AboutSection.tsx    # (About Me) — 3 cards layout
│   ├── AndAlso.tsx         # Text-only section
│   ├── Services.tsx        # Orange bg + 3D perspective service cards
│   ├── Testimonials.tsx    # Masonry testimonial grid with like buttons
│   ├── CTASection.tsx      # Orange booking card with email input
│   └── Footer.tsx          # Large "Adegheosa" text + links + info
│
├── lib/
│   └── utils.ts            # cn() utility for class merging
│
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── package.json
```

---

## Design Decisions

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--black` | `#0a0a0a` | Primary background |
| `--card` | `#141414` | Card backgrounds |
| `--border` | `#1f1f1f` | Subtle borders |
| `--orange` | `#E84C0D` | Primary accent — CTAs, active states, headings |

### Typography
- **Playfair Display** — serif display font for hero headings, section titles, card text. Italic variant used for accent labels (e.g. *(About Me)*, *And Also*).
- **Outfit** — clean geometric sans for body copy, UI labels, nav links.

### Animations
All reveal animations use the **Intersection Observer API** (no external dependencies):
- `.reveal` — fade up (opacity + translateY)
- `.reveal-left` — slide in from left
- `.reveal-scale` — fade + scale in
- Stagger delays via `.delay-1` through `.delay-8` classes

### Key Sections

**Hero** — Absolute-positioned cards forming a scattered collage. Each card fades in with a staggered delay. Replace `picsum.photos` seeds with actual portfolio images.

**Services** — CSS `perspective` + `rotateY/rotateX` gives the 3D card-fan effect. Cards are interactive (click to select).

**Testimonials** — 3-column masonry grid with interactive like buttons (client-side state only — connect to a backend if persistence needed).

**Work Grid** — Hover reveals project metadata (category, year, summary) with a smooth scale + opacity transition.

---

## Swapping in Real Photos

Replace `picsum.photos` URLs in each component:

```tsx
// components/Hero.tsx
src: '/images/hero-portrait-1.jpg',   // put in /public/images/

// Or remote URLs (add the domain to next.config.js remotePatterns)
src: 'https://your-cdn.com/photo.jpg',
```

---

## Adding Real Contact Form Submission

In `app/contact/page.tsx`, replace the `setTimeout` mock with a real API call:

```tsx
// Using Resend, Formspree, or any email API
const handleSubmit = async () => {
  const res = await fetch('/api/contact', {
    method: 'POST',
    body: JSON.stringify(form),
    headers: { 'Content-Type': 'application/json' },
  })
  if (res.ok) setSubmitted(true)
}
```

---

## Deployment

Deploy to **Vercel** (recommended for Next.js):

```bash
npx vercel --prod
```

Or push to GitHub and connect via [vercel.com](https://vercel.com).

---

*Built in pixels, shaped in Adegheosa.*
