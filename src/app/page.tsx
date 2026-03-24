
"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import {
  testWorkflowErrorResponseSchema,
  testWorkflowSuccessResponseSchema,
  type TestWorkflowSuccessResponse,
} from "@/app/api/testworkflow/contract";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const workflowMutation = useMutation<TestWorkflowSuccessResponse, Error, File>({
    mutationFn: testWorkflow,
  });

  return (
    <main>
      <h1>Test Workflow</h1>
      <p>
        Upload a PDF, JPG, or PNG and send it with a <code>POST</code> request
        to{" "}
        <code>/api/testworkflow</code>.
      </p>

      <input
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        onChange={(event) => {
          setSelectedFile(event.target.files?.[0] ?? null);
          workflowMutation.reset();
        }}
      />

      <p>{selectedFile ? `Selected file: ${selectedFile.name}` : "No file selected."}</p>

      <button
        type="button"
        onClick={() => {
          if (!selectedFile) {
            return;
          }

          workflowMutation.mutate(selectedFile);
        }}
        disabled={workflowMutation.isPending || !selectedFile}
      >
        {workflowMutation.isPending ? "Uploading..." : "Start workflow"}
      </button>

      <div aria-live="polite">
        {workflowMutation.isSuccess ? (
          <p>
            {workflowMutation.data.data} ({workflowMutation.data.requestId})
          </p>
        ) : null}

        {workflowMutation.isError ? (
          <p>Error: {workflowMutation.error.message}</p>
        ) : null}
      </div>
    </main>
  );
}

async function testWorkflow(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/testworkflow", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return testWorkflowSuccessResponseSchema.parse(await response.json());
}

async function getErrorMessage(response: Response) {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    const parsedResult = testWorkflowErrorResponseSchema.safeParse(
      await response.json(),
    );

    if (parsedResult.success) {
      return parsedResult.data.error;
    }
  }

  const text = await response.text();

  if (text) {
    return text;
  }

  return `Request failed with status ${response.status}.`;
}
