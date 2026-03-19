# YIF Capital — SEO & Optimization Guide

Implementation-ready reference for on-page SEO, images, trust, performance, and keywords. Tailored for **YIF Capital** (Tanzania digital investment platform).

---

## A. Technical SEO (Implemented)

- **Root metadata** — Updated in `app/layout.tsx`: title template, description, keywords, Open Graph, Twitter cards, robots.
- **JSON-LD** — Organization schema in root layout (name, logo, url, address, contactPoint, sameAs).
- **Sitemap** — `app/sitemap.ts` generates `/sitemap.xml` with homepage, key pages, and all fund URLs.
- **Robots** — `app/robots.ts` allows crawling of public pages; disallows `/api/`, `/dashboard/`, `/admin/`, `/sessions/`, `/live/`, password routes.
- **Env** — Set `NEXT_PUBLIC_SITE_URL=https://yifcapital.co.tz` in production so sitemap/OG URLs are correct.

---

## B. Image SEO — Recommendations

### Current image paths (to reorganize)

| Current path | Suggested new path | Suggested filename |
|--------------|--------------------|---------------------|
| `/logo.png` | `/images/logo/yif-capital-logo.png` | yif-capital-logo.png |
| `/logo payment/background/contact.png` | `/images/banners/yif-capital-contact-hero.png` | yif-capital-contact-hero.png |
| `/logo payment/background/mobile.png` | `/images/banners/yif-capital-home-mobile-bg.png` | yif-capital-home-mobile-bg.png |
| `/logo payment/background/academy.png` | `/images/banners/yif-capital-academy-hero.png` | yif-capital-academy-hero.png |
| `/logo payment/background/itrust.svg` | `/images/funds/itrust-finance-logo.svg` | itrust-finance-logo.svg |
| `/logo payment/background/sanlama.svg` | `/images/funds/sanlamallianz-logo.svg` | sanlamallianz-logo.svg |
| `/logo payment/background/Professional Portfolio Management.png` | `/images/banners/yif-capital-investment-pro-hero.png` | yif-capital-investment-pro-hero.png |
| `/logo payment/background/Professional Market Analytics.png` | `/images/banners/yif-capital-analytics-hero.png` | yif-capital-analytics-hero.png |
| `/LOGO/CRDB2.jpg`, `/LOGO/NMB.jpg`, etc. | `/images/stocks/crdb-logo.jpg`, `/images/stocks/nmb-logo.jpg` | `{symbol-lowercase}-logo.jpg` |

### Suggested folder structure

```
public/
  images/
    logo/           # Brand logo(s)
    banners/        # Hero / landing backgrounds
    icons/         # UI icons, favicons
    funds/         # Fund provider logos (iTrust, Sanlam, etc.)
    stocks/        # DSE stock logos
```

### ALT text (ready-to-use)

- **Logo (site-wide):** `alt="YIF Capital — Tanzania digital investment platform"`
- **Contact hero:** `alt="YIF Capital contact page — get in touch for support and partnerships"`
- **Home background:** `alt="YIF Capital homepage — invest in Tanzania funds and stocks"`
- **Academy hero:** `alt="YIF Capital Academy — learn investing and capital markets"`
- **Investment Pro hero:** `alt="YIF Capital Investment Pro — professional portfolio management"`
- **Analytics hero:** `alt="YIF Capital — professional market analytics and data"`
- **iTrust logo:** `alt="iTrust Finance Limited — fund manager logo"`
- **Sanlam logo:** `alt="SanlamAllianz East Africa Investment — fund manager logo"`
- **Stock logos:** `alt="{Company name} (DSE: {symbol}) — stock logo"` e.g. `alt="CRDB Bank (DSE: CRDB) — stock logo"`

### Compression and format

- **Strategy:** Prefer WebP for photos/backgrounds; keep SVG for logos where possible.
- **Tools:** Use `sharp` (Node) or online tools (Squoosh, TinyPNG) to generate WebP; keep originals as fallback.
- **Next.js:** If you enable `images: { unoptimized: false }` in `next.config.mjs`, use `<Image>` with `sizes` and let Next optimize. For now with `unoptimized: true`, compress manually and consider adding `loading="lazy"` and explicit `width`/`height` on `<img>` to reduce CLS.
- **Lazy loading:** Use `loading="lazy"` for below-the-fold images; Next `<Image>` does this by default when enabled.

---

## C. Content SEO (E-E-A-T)

- **Experience:** Add short “How we use the data” or “Our data process” on funds/analytics pages.
- **Expertise:** Publish short, factual articles (e.g. “What is NAV?”, “Understanding DSE”) under `/articles` or `/academy` with clear author/date.
- **Authoritativeness:** Link to CMSA, DSE, and fund managers where relevant; keep “Regulated” / “Compliant” messaging.
- **Trust:** Privacy Policy and Terms (see below); contact page with real address/email; secure (HTTPS) and clear data usage.

---

## D. Trust & Compliance (Implemented)

- **Terms & Conditions** — `app/terms/page.tsx`: acceptance, use of platform, accounts, privacy reference, IP, disclaimer of advice, limitation of liability, governing law, contact. Tone: regulated, transparent.
- **Privacy Policy** — `app/privacy/page.tsx`: what we collect, how we use it, security, retention, your rights, cookies, changes, contact. Tone: secure, transparent, compliant.
- **Contact** — Existing `app/contact/page.tsx`; ensure footer/header link to Terms and Privacy. Optional: add a short “Secure & regulated” line near the form.

---

## E. Performance Optimization

- **Images:** Enable Next.js image optimization when possible; use WebP; lazy load; fixed dimensions to avoid layout shift.
- **Fonts:** Inter is already loaded via `next/font`; consider `display: swap` in layout if not set.
- **Caching:** Ensure production sends `Cache-Control` for static assets (Next does by default). For API routes that serve fund/market data, use short cache (e.g. 60s) or `no-store` if real-time.
- **Code splitting:** Next.js automatic; avoid large client bundles on critical landing (e.g. homepage) by dynamic-importing heavy components.
- **Mobile-first:** Use responsive units (rem, %, clamp); touch targets ≥ 44px; test on real devices. Ensure forms and CTAs work on small screens.

---

## F. Social SEO (Open Graph & Branding)

- **Implemented in layout:** `openGraph` and `twitter` in `app/layout.tsx` (title, description, image, locale).
- **Default OG image:** Currently `/logo.png`. For richer shares, add a dedicated image, e.g. `/images/og-default.png` (1200×630), and set `metadata.openGraph.images` to it.
- **Branding consistency:** Use same logo, tagline (“Tanzania's digital investment platform”), and primary color (#0A1F44 / gold) across Twitter, Facebook, LinkedIn. Update `sameAs` in JSON-LD when social URLs are final.

---

## G. Keywords — Tanzania (Investment, Capital, Passive Income)

Use these in titles, descriptions, and content where natural (avoid stuffing).

| Keyword / phrase | Intent | Use in |
|------------------|--------|--------|
| investment Tanzania | High | Homepage, Funds, meta |
| mutual funds Tanzania | High | Funds page, fund detail pages |
| DSE stocks | High | Stocks page, meta |
| fund NAV Tanzania | Medium | Fund pages, articles |
| passive income Tanzania | High | Homepage, Academy, Pricing |
| capital markets Tanzania | Medium | Economics, Research |
| invest in Tanzania | High | Homepage, CTA |
| savings and investment Tanzania | Medium | Blog, Academy |
| unit trust Tanzania | Medium | Funds, glossary |
| Dar es Salaam Stock Exchange | Medium | Stocks, meta |
| yif capital | Brand | All key pages |

---

## Quick checklist

- [x] Meta titles and descriptions (root + key pages)
- [x] Sitemap and robots
- [x] JSON-LD Organization
- [x] Open Graph and Twitter cards
- [x] Terms & Conditions page
- [x] Privacy Policy page
- [x] Contact layout metadata
- [ ] Move and rename images (see B); add ALT site-wide
- [ ] Set `NEXT_PUBLIC_SITE_URL` in production
- [ ] Add optional `/images/og-default.png` for social shares
- [ ] Optional: Google Search Console verification code in `metadata.verification.google`
