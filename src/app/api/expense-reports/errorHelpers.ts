export const isAuthError = (error: unknown) =>
  error instanceof Error &&
  ("code" in error && typeof (error as Record<string, unknown>).code === "string"
    ? ((error as Record<string, unknown>).code as string).startsWith("auth/")
    : error.message === "Missing or invalid Authorization header")

export const getErrorMessage = (
  error: unknown,
  fallbackMessage: string,
) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallbackMessage
}
