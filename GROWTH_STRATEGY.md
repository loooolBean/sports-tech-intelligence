# Sports Technology Intelligence — Growth Strategy

> Last updated: 2026-06-09 | Owner: CTO/Product Owner

---

## Progress Dashboard

| Dimension | Score | Notes |
|-----------|-------|-------|
| Product Progress | 42% | Architecture done, content pipeline needs AI key |
| Deployment Progress | 65% | Live on Vercel, env vars need fixing |
| SEO Progress | 18% | Infra built, metadata generation blocked by AI |
| Traffic Readiness | 12% | 10 published articles, no summaries/tags yet |
| Monetization Readiness | 0% | Blocked by traffic |

---

## Phase 1: Unblock Production (This Week)

**Priority: P0 — blocks everything**

### 1.1 Fix Vercel Environment Variables

| Variable | Current | Required | Impact |
|----------|---------|----------|--------|
| AI_API_KEY | placeholder/invalid | Valid Mimo or OpenAI key | Unblocks summaries, tags, SEO metadata |
| NEXT_PUBLIC_SITE_URL | Preview deployment URL | https://sports-tech-intelligence.vercel.app | Fixes sitemap, canonical URLs, OG links |
| CRON_SECRET | dev-cron-secret | Secure random string | Protects cron endpoints |

### 1.2 Run AI Backfill

After fixing the API key:
```
POST /api/cron/generate-seo-metadata?batchSize=10&overwrite=true
Authorization: Bearer <CRON_SECRET>
```

This generates for all 10 published articles:
- AI summary + key takeaways
- 5-10 searchable tags
- SEO title + meta description

### 1.3 Verify Cron Automation

Confirm on Vercel dashboard that cron jobs are executing:
- ingest-rss: every 6 hours (0 */6 * * *)
- generate-seo-metadata: every 6 hours offset (30 */6 * * *)

**Effort:** 15 minutes | **Impact:** Unblocks entire platform

---

## Phase 2: Content Growth (Weeks 2-4)

**Goal:** 100+ published sports technology articles

### 2.1 High-Value RSS Sources to Add

| Source | URL | Focus | Priority |
|--------|-----|-------|----------|
| WHOOP Blog | https://www.whoop.com/blog/feed/ | Wearables, recovery | High |
| Second Spectrum | https://www.secondspectrum.com/blog/feed | Basketball analytics | High |
| Hawk-Eye Innovations | https://www.hawkeyeinnovations.com/feed | Ball tracking, officiating | Medium |
| MIT Sloan Sports | https://www.sloansportsconference.com/feed | Research papers | Medium |
| Nature Sports Medicine | https://nature.com/natsport/feed.xml | Peer-reviewed research | Medium |
| Catapult Sports | Already added | Athlete tracking | High |
| SportTechie | Already added | Sports tech news | High |
| Front Office Sports | Already added | Sports business | Medium |

### 2.2 Content Categories Strategy

| Category | Target Articles/Month | Key Topics |
|----------|----------------------|------------|
| Sports Analytics | 15+ | Player tracking, predictive models, computer vision |
| Wearable Technology | 10+ | GPS trackers, HR monitors, smart clothing, recovery |
| Sports Science | 8+ | Nutrition, sleep science, injury prevention |
| Sports Business & Tech | 8+ | Sponsorship tech, fan engagement, venue tech |
| Sports Technology | 10+ | General platform/product news |
| Sports Analysis | 5+ | Tactical analysis tools, video breakdown |

### 2.3 Content Quality Rules

1. No general tech news — every article must relate to sports performance, sports business, or athlete technology
2. AI curation — use AI summary confidence score to filter low-relevance articles
3. Minimum content length — reject articles under 500 characters (already implemented)
4. Source reputation weighting — prioritize high-reputation sources in the feed

### 2.4 New Landing Pages to Build

| Page | URL | SEO Value |
|------|-----|-----------|
| Wearable Technology Guide | /wearable-technology | High-volume keyword |
| Sports Analytics Explained | /sports-analytics | Growing search interest |
| NFL Draft Technology | /nfl-draft-technology | Seasonal traffic spike |
| Sports Science Research | /sports-science-research | Academic audience |

**Effort:** 2-3 weeks | **Impact:** 10x content volume

---

## Phase 3: SEO Growth (Weeks 2-6)

**Goal:** Get indexed by Google, rank for sports technology keywords

### 3.1 Immediate SEO Tasks

| Task | Status | Impact | Effort |
|------|--------|--------|--------|
| Fix NEXT_PUBLIC_SITE_URL | Blocked on user | Critical | 2 min |
| Submit sitemap to Google Search Console | Not started | High | 10 min |
| Add structured data to homepage | Done (JSON-LD) | High | Done |
| Add breadcrumbs to all pages | Done | Medium | Done |
| Category descriptions | Done | Medium | Done |
| Internal linking between articles | Partial (related articles) | High | 2 hours |
| Add hreflang tags | Not started | Low (single language) | 30 min |

### 3.2 Target Keywords

| Keyword Cluster | Monthly Search Volume | Competition | Priority |
|----------------|----------------------|-------------|----------|
| sports technology | 8,100 | Medium | High |
| athlete tracking system | 1,300 | Low | High |
| wearable technology sports | 2,400 | Medium | High |
| sports analytics software | 1,900 | Medium | High |
| GPS tracker for athletes | 1,600 | Low | High |
| sports science research | 3,200 | Medium | Medium |
| player tracking NBA | 880 | Low | Medium |
| injury prevention technology | 720 | Low | Medium |

### 3.3 Internal Linking Strategy

1. Category hub pages — each category page links to all its articles
2. Tag pages — each tag creates a keyword-focused landing page
3. Related articles — already implemented, but needs tags to work properly
4. Breadcrumbs — already implemented on article and category pages
5. Homepage — featured article + sidebar articles + grid (already implemented)

### 3.4 Google Search Console Setup

1. Verify domain ownership via DNS TXT record
2. Submit sitemap: https://sports-tech-intelligence.vercel.app/sitemap.xml
3. Request indexing for all 10 published articles
4. Monitor coverage report for errors

**Effort:** 1-2 weeks | **Impact:** Organic traffic foundation

---

## Phase 4: Monetization Planning (Months 2-3)

**Prerequisites:** 500+ monthly organic visitors

### 4.1 Monetization Channels

| Channel | Readiness | Timeline | Expected Revenue |
|---------|-----------|----------|-----------------|
| Google AdSense | Need 50+ articles + traffic | Month 2-3 | $2-5 per 1000 views |
| Affiliate (wearable reviews) | Need content | Month 2 | $50-200 per sale |
| Newsletter sponsorship | Need 1000+ subscribers | Month 3-4 | $50-200 per issue |
| Sponsored content | Need domain authority | Month 4-6 | $500-2000 per post |
| Premium reports | Need data/analytics | Month 6+ | $50-500 per report |

### 4.2 Google AdSense Requirements

- [x] Original content
- [x] Site navigation
- [x] Privacy policy page (needs adding)
- [ ] 50+ quality articles
- [ ] Sufficient organic traffic
- [ ] No policy violations

### 4.3 Affiliate Partnership Opportunities

| Partner | Product | Commission |
|---------|---------|------------|
| WHOOP | Recovery wearable | $10-30 per signup |
| Catapult | Athlete tracking | Enterprise referral |
| Garmin | GPS watches/trackers | 5-8% per sale |
| Oura Ring | Sleep/recovery | $10-20 per sale |
| Second Spectrum | Analytics platform | Enterprise referral |

### 4.4 Newsletter Growth Strategy

1. Lead magnet — free "Sports Tech Landscape 2026" report
2. Placement — homepage CTA (already implemented), article sidebar, exit intent
3. Content — weekly digest of top articles + exclusive analysis
4. Monetization — sponsored slots after 1000 subscribers

**Effort:** Ongoing | **Impact:** Revenue stream

---

## Phase 5: Technical Improvements (Ongoing)

### 5.1 High-Impact Code Changes

| Improvement | Impact | Effort |
|------------|--------|--------|
| Add AI timeout handling (30s max) | Prevents hanging cron jobs | 30 min |
| Add retry logic for transient AI failures | Reduces false failures | 1 hour |
| Add content relevance filter | Prevents off-topic articles | 2 hours |
| Add privacy policy page | Required for AdSense | 30 min |
| Add favicon/OG image | Brand recognition | 1 hour |
| Add Google Analytics/Plausible | Traffic tracking | 30 min |

### 5.2 Performance Monitoring

Set up alerts for:
- Cron job failures (check Vercel function logs)
- AI API errors (check ingestion_failures table)
- Database connection issues (Supabase dashboard)

---

## Key Metrics to Track

| Metric | Current | Week 4 Target | Month 3 Target |
|--------|---------|---------------|----------------|
| Published articles | 10 | 50 | 200 |
| AI summaries | 0 | 50 | 200 |
| Tags | 0 | 200 | 1000 |
| Organic visitors/month | 0 | 100 | 1000 |
| Newsletter subscribers | 0 | 50 | 500 |
| Google indexed pages | 0 | 30 | 150 |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-09 | Disabled 9 non-sports sources | Topical authority requires focused content |
| 2026-06-09 | Rejected 20 off-topic articles | General tech news hurts SEO ranking |
| 2026-06-09 | Published 10 Kitman Labs articles | All sports-tech relevant, proper categorization |
| 2026-06-09 | Kept Vercel (not Cloudflare) | Prisma + PostgreSQL incompatible with edge runtime |
| 2026-06-09 | Focus on organic SEO first | Highest ROI for media business |

---

*This is a living document. Update as metrics change and new opportunities emerge.*
