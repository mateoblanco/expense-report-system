# Expense Report System

Expense Report Management System where users upload receipt/invoice documents (PDF, JPG, PNG). An LLM extracts structured data from those documents as a background job. Users can view, edit, and manage their registered expense reports.

**Core flow:** Upload receipt → Store file in Firebase Storage → Fire Inngest event → LLM extracts data → Persist to Firestore

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript  |
| UI | React |
| State Management | TanStack React Query |
| Database | Cloud Firestore (Firebase Admin SDK) |
| File Storage | Firebase Storage |
| Authentication | Firebase Auth (Google provider) |
| Background Jobs | Inngest |
| LLM | `openai/gpt-5.2` via Vercel AI SDK (`ai` + `@ai-sdk/openai`) |
| Validation | Zod |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn

### Environment Variables

Create a `.env.local` file with the following variables:

| Variable | Purpose |
|---|---|
| `FIREBASE_PROJECT_ID` | Firebase project ID (Admin SDK) |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket name |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase client-side API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID (client SDK) |
| `AI_GATEWAY_API_KEY` | AI Gateway API key from Vercel for LLM calls |
| `INNGEST_EVENT_KEY` | Inngest event signing (production only) |
| `INNGEST_SIGNING_KEY` | Inngest webhook signing (production only) |
| `INNGEST_DEV=1` | Set this variable only for local enviroments |


### Commands

```bash
yarn install          # Install dependencies
yarn dev              # Start dev server at localhost:3000
npx inngest-cli@latest dev  # Start Inngest dev server (required for background jobs)
yarn build            # Production build
yarn lint             # Run ESLint
```

Both `yarn dev` and the Inngest dev server must be running simultaneously during development.

## Architecture

### Project Structure

```
src/
├── app/api/                    # API routes (Next.js App Router)
│   └── expense-reports/        # Expenses endpoints + Inngest webhook
├── server/
│   ├── dataRepository/         # Firestore CRUD (no business logic)
│   ├── logic/                  # Business rules and orchestration
│   └── services/
│       ├── firebase/           # Firebase Admin SDK singleton + Storage helpers
│       └── inngest/            # Inngest client, events, schemas, functions
├── components/
│   ├── base/                   # Reusable UI components (Button, Table, Modal, Toast, Spinner)
│   └── pages/                  # Page-level components (Home, Login)
├── providers/                  # React context providers (Auth, QueryClient)
├── hooks/                      # Shared React hooks
└── types.ts                    # Shared server-side TypeScript types
```

### Key Patterns
- **Background processing with Inngest:** File uploads trigger an event (`expense-report/extract-data`). An Inngest function handles extraction in two steps: (1) call the LLM, (2) persist results. Failures are handled gracefully by marking the report as `failed`.
- **Concurrency-limited uploads:** Multiple files can be uploaded at once, processed with a concurrency limit of 3 using `p-limit`.

### API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/expense-reports` | List all reports for the authenticated user |
| `POST` | `/api/expense-reports` | Upload receipt files (multipart/form-data) |
| `PUT` | `/api/expense-reports/[id]` | Update extracted fields for a report |

All endpoints require a Firebase Auth token in the `Authorization` header.

### Firestore Collection: `ExpenseReport`

Single collection storing all expense report data:

```
{
  id, userId, status ("processing" | "completed" | "failed"),
  confidence,
  fields: { invoiceNumber, description, amount, currency, category,
            expenseDate, vendorName, additionalNotes, subtotal,
            taxAmount, dueDate, vendorTaxId },
  receipt: { storagePath, fileName },
  extraction: { provider, raw, error, processedAt },
  createdAt, updatedAt
}
```

### Extracted Fields

The LLM extracts the following data from each uploaded invoice/receipt:

| Field | Type | Description |
|---|---|---|
| `invoiceNumber` | string | Invoice or receipt number |
| `description` | string | General description of the expense |
| `amount` | number | Total amount |
| `currency` | string | Currency code (e.g., USD, EUR) |
| `category` | string | Expense category |
| `expenseDate` | string | Date of the expense |
| `vendorName` | string | Name of the vendor/supplier |
| `additionalNotes` | string | Any additional relevant information |
| `subtotal` | number | Subtotal before tax |
| `taxAmount` | number | Tax amount |
| `dueDate` | string | Payment due date |
| `vendorTaxId` | string | Vendor's tax identification number |

Each field includes a confidence score from the LLM. The report's overall confidence is the average across all fields.


## Trade-offs and Decisions

- **No tRPC:** API contracts are enforced with Zod schemas in `contract.ts` files shared between client and server. This keeps the stack simpler without adding a full RPC layer (TRPC).
- **No pagination:** Reports are fetched all at once.
- **Single Firestore collection:** All data (metadata, extracted fields, extraction info, receipt reference) lives in one `ExpenseReport` document.
- **No report deletion:** Users cannot delete expense reports.
- **Multi-line invoices not supported:** The LLM extraction schema is flat (single amount, single description). Invoices with multiple line items are summarized rather than itemized.
- **Google-only login:** Authentication uses Google Sign-In to minimize friction for testing and demo purposes. No email/password or other providers.
- **No manual expense creation:** Expenses can only be created by uploading a receipt file. There is no form to manually enter expense data.
- **Simple field editing:** Extracted fields can be edited as plain text/number inputs. There are no date pickers, currency selectors, or relational field validation..
