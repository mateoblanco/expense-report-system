import { z } from "zod";

export const allowedUploadMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export const maxUploadSizeBytes = 10 * 1024 * 1024;

export const uploadFileMetadataSchema = z.object({
  name: z.string().min(1, "The file name is required."),
  type: z.enum(allowedUploadMimeTypes, {
    error: "Only PDF, JPG, and PNG files are allowed.",
  }),
  size: z
    .number()
    .int()
    .positive("The file is empty.")
    .max(maxUploadSizeBytes, "The file must be 10 MB or smaller."),
});

export const testWorkflowSuccessResponseSchema = z.object({
  data: z.string(),
  requestId: z.uuid(),
});

export const testWorkflowErrorResponseSchema = z.object({
  error: z.string(),
});

export type TestWorkflowSuccessResponse = z.infer<
  typeof testWorkflowSuccessResponseSchema
>;
