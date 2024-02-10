import { ZodError } from "zod";

export function handleValidationError(cb: (data: { error: string; message: string[] }) => void, error: ZodError) {
  const errMessage = error.issues.flatMap((issue) => {
    return issue.path.map((path) => {
      return `${path}: ${issue.message}`;
    });
  });
  cb({ error: "validation error", message: errMessage });
  return;
}
