import { ZodError } from "zod";

export function handleValidationError(error: ZodError) {
  const errMessage = error.issues.map((issue) => {
    return issue.path.map((path) => {
      return `${path}: ${issue.message}`;
    });
  });
  return errMessage.flat();
}
