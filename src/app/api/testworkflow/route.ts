import { del, put } from "@vercel/blob";
import { z } from "zod";

import {
  testWorkflowErrorResponseSchema,
  testWorkflowSuccessResponseSchema,
  uploadFileMetadataSchema,
} from "@/app/api/testworkflow/contract";
import { TEST_WORKFLOW_EVENT_NAME } from "@/server/services/inngest/events";
import { inngest } from "@/server/services/inngest/client";
import { extractInvoiceNumberEventDataSchema } from "@/server/services/inngest/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let uploadedBlobPathname: string | null = null;

  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("BLOB_READ_WRITE_TOKEN is not configured.");
    }

    const formData = await request.formData();
    const fileEntry = formData.get("file");

    if (!(fileEntry instanceof File)) {
      return Response.json(
        testWorkflowErrorResponseSchema.parse({ error: "A file is required." }),
        { status: 400 },
      );
    }

    const fileMetadata = uploadFileMetadataSchema.parse({
      name: fileEntry.name,
      type: fileEntry.type,
      size: fileEntry.size,
    });

    const requestId = crypto.randomUUID();
    const pathname = `testworkflow/${requestId}-${sanitizeFileName(fileMetadata.name)}`;

    const blob = await put(pathname, fileEntry, {
      access: "private",
      addRandomSuffix: false,
      contentType: fileMetadata.type,
      multipart: true,
    });

    uploadedBlobPathname = blob.pathname;

    const eventData = extractInvoiceNumberEventDataSchema.parse({
      requestId,
      blobPathname: blob.pathname,
      blobUrl: blob.url,
      fileName: fileMetadata.name,
      contentType: fileMetadata.type,
      size: fileMetadata.size,
    });

    await inngest.send({
      name: TEST_WORKFLOW_EVENT_NAME,
      data: eventData,
    });

    return Response.json(
      testWorkflowSuccessResponseSchema.parse({
        data: "Test workflow started",
        requestId,
      }),
      { status: 200 },
    );
  } catch (error) {
    if (uploadedBlobPathname) {
      try {
        await del(uploadedBlobPathname);
      } catch (cleanupError) {
        console.error("Failed to clean up uploaded blob.", cleanupError);
      }
    }

    console.error("Failed to execute test workflow.", error);

    if (error instanceof z.ZodError) {
      return Response.json(
        testWorkflowErrorResponseSchema.parse({
          error: error.issues[0]?.message ?? "Invalid request data.",
        }),
        { status: 400 },
      );
    }

    return Response.json(
      testWorkflowErrorResponseSchema.parse({ error: getErrorMessage(error) }),
      { status: 500 },
    );
  }
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Failed to execute test workflow.";
}
