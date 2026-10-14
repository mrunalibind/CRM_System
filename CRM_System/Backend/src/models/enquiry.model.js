
import { z } from "zod";

export const createEnquirySchema = z.object({
  name: z.string().trim().min(2).max(100),

  email: z
    .string()
    .trim()
    .email()
    .max(255)
    .transform((email) => email.toLowerCase()),

  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .transform((phone) => phone || undefined),

  course_interest: z.string().trim().min(2).max(150),
});
