# IOC site

Production Next.js (App Router) app for **ligs.io**: Initial Operating Conditions (IOC) only.

## Surfaces

- `/` → redirects to `/ioc`
- `/ioc` — product UI
- `POST /api/ioc` — free IOC block
- `POST /api/ioc/checkout` — Stripe Checkout
- `GET /api/ioc/verify-session` — post-payment IOC full block
- `POST /api/stripe/webhook` — Stripe events (IOC-safe)
- `/llms.txt` — discovery

## Setup

```bash
npm install
cp .env.example .env.local
# Set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SITE_URL
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Stripe

Configure the webhook endpoint to `https://<your-domain>/api/stripe/webhook` with your signing secret in `STRIPE_WEBHOOK_SECRET`.
