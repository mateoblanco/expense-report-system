# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Expense Report Management System where users upload receipt/invoice documents (PDF/JPG/PNG). An LLM extracts structured data from those documents as a background job. Users can view a listing of their registered expense reports.

Core flow: **upload receipt → store file → fire Inngest event → LLM extracts data → persist to Firestore**

- **Storage:** Firebase Storage (bucket path: `invoices/`)
- **LLM:** `openai/gpt-4.1` via AI Gateway

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

Next.js 16 App Router + TypeScript. API routes live in `src/app/api/`. Server-side code is organized in layers:

- `src/server/types.ts` — shared TypeScript types (`User`, `ExpenseReport`, and their `Create*` variants)
- `src/server/dataRepository/` — Firestore CRUD only, no business logic
- `src/server/logic/` — business rules; calls repositories
- `src/server/services/firebase/init.ts` — Firebase Admin SDK singleton (`db`)
- `src/server/services/inngest/` — Inngest client, event names, Zod schemas, and function definitions

### Firestore collections

| Collection | Description |
|---|---|
| `ExpenseReport` | Expense reports linked to a user, with receipt reference and extracted data |

### Patterns

- All API request/response shapes are defined as Zod schemas in `contract.ts` files co-located with the route, shared with client code.
- Inngest event data is validated with Zod schemas in `src/server/services/inngest/schemas.ts`.
- Use arrow functions throughout (`const foo = async () => {}`), not `function` declarations.
- React state management uses TanStack Query; `<Providers>` in `src/app/providers.tsx` sets up `QueryClientProvider`.
- The React Compiler is enabled (`reactCompiler: true` in `next.config.ts`).

### Required environment variables

| Variable | Purpose |
|---|---|
| `FIREBASE_PROJECT_ID` | Firebase project ID (Admin SDK) |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket name |
| `AI_GATEWAY_API_KEY` | AI Gateway for LLM calls |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase client-side API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID (client SDK) |
| `INNGEST_EVENT_KEY` | Inngest event signing (production) |
| `INNGEST_SIGNING_KEY` | Inngest webhook signing (production) |
