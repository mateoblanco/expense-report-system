# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
yarn dev          # Start development server at localhost:3000
yarn build        # Production build
yarn lint         # Run ESLint
```

For Inngest background functions, run the Inngest Dev Server alongside `yarn dev`:
```bash
npx inngest-cli@latest dev
```

## Architecture

This is a Next.js 16 app (App Router) for an expense report system. The core flow is:

1. **Upload** — `POST /api/testworkflow` accepts a file (PDF/JPG/PNG ≤10MB), uploads it to Vercel Blob (private), then fires an Inngest event.
2. **Background processing** — Inngest receives the event at `GET|POST|PUT /api/inngest` and runs the `extract-invoice-number` function, which downloads the blob, sends it to an AI model via the Vercel AI SDK, and extracts structured data.
3. **AI model** — Uses `@ai-sdk/openai` with `openai/gpt-4.1` through an AI Gateway (`AI_GATEWAY_API_KEY`).

### Key directories

- `src/app/` — Next.js App Router pages and API routes
- `src/app/api/testworkflow/contract.ts` — Shared Zod schemas for the testworkflow API (used by both client and server)
- `src/server/services/inngest/` — Inngest client, event names, Zod schemas, and function definitions
- `src/server/services/firebase/` — Firebase initialization (analytics; largely unused currently)

### Patterns

- All API request/response shapes are defined as Zod schemas in `contract.ts` files co-located with the route, and shared with client code.
- Inngest event data is validated with Zod schemas in `src/server/services/inngest/schemas.ts`.
- React state management uses TanStack Query (`@tanstack/react-query`); the `<Providers>` wrapper in `src/app/providers.tsx` sets up the `QueryClientProvider`.
- The React Compiler is enabled (`reactCompiler: true` in `next.config.ts`).

### Required environment variables

| Variable | Purpose |
|---|---|
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage access |
| `AI_GATEWAY_API_KEY` | AI Gateway for OpenAI calls |
| `INNGEST_EVENT_KEY` | Inngest event signing (production) |
| `INNGEST_SIGNING_KEY` | Inngest webhook signing (production) |
