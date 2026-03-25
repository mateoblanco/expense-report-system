export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error && error.message) {
      return error.message
    }
  
    return "Expense report processing failed."
  }