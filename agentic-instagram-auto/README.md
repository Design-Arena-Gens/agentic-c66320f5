## Instagram Auto Publisher

Production-ready Next.js dashboard to compose, schedule, and automatically publish Instagram posts through the Instagram Graph API. Built for Vercel deployment with serverless APIs, Upstash Redis-backed scheduling, and a cron endpoint that can be wired to [Vercel Cron](https://vercel.com/docs/cron-jobs).

### Features
- Compose posts with caption, validation, and image URL guidance
- Publish immediately or schedule for later (requires Upstash Redis)
- REST API endpoints for publishing, listing, and cancelling schedules
- Cron-friendly dispatcher (`POST /api/cron/dispatch`) to process due posts
- Type-safe environment validation with graceful fallbacks for local development

### Configuration

Create an `.env.local` file (or set Vercel project environment variables):

```env
# Instagram Graph API
IG_USER_ID=17841400000000000                # Instagram Business Account ID
IG_ACCESS_TOKEN=EAAJZA...                   # Long-lived access token
IG_GRAPH_API_VERSION=v19.0                  # Optional, defaults to v19.0

# Optional: enable scheduling with Upstash Redis
UPSTASH_REDIS_REST_URL=https://us1-positive-12345.upstash.io
UPSTASH_REDIS_REST_TOKEN=XXXXXX
```

> **Important:** Generate a long-lived access token (60-day) via Facebook Graph API explorer, ensure `instagram_basic`, `pages_show_list`, and `instagram_content_publish` scopes, and connect a valid Facebook Page + Instagram Business Account.

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scheduling & Cron

1. Configure Upstash Redis credentials to persist schedules.
2. In Vercel, add a Cron Job that triggers `POST https://<your-domain>/api/cron/dispatch` every 5 minutes (or desired cadence).
3. The dispatcher promotes pending schedules, publishes to Instagram, and updates status/error history.

### Deployment

Deploy to Vercel (after setting env vars & cron job):

```bash
npm run build
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-c66320f5
```

After build completes, verify:

```bash
curl https://agentic-c66320f5.vercel.app
```
