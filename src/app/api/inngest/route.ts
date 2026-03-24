import { serve } from "inngest/next";
import { inngest } from "@/server/services/inngest/client";
import { extractInvoiceNumber } from "@/server/services/inngest/functions";

export const runtime = "nodejs";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [extractInvoiceNumber],
});
