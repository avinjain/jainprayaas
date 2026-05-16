import { z } from "zod";

export const submissionFieldsSchema = z.object({
  fullName: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, "Full name is required")),
  gender: z.enum(["Male", "Female"]),
  age: z.coerce.number().int().min(18).max(80),
  mobileNumber: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().regex(/^\d{10}$/, "Mobile number must be exactly 10 digits")),
});

export type SubmissionFields = z.infer<typeof submissionFieldsSchema>;
