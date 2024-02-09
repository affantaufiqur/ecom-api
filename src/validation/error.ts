import { ZodError } from "zod";

export function handleValidationError(error: ZodError) {
  return error.issues
    .map((issue) => {
      return issue.path.map((path) => {
        return `${path}: ${issue.message}`;
      });
    })
    .flat();
}
