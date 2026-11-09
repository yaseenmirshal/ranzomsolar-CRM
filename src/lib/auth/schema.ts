import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email().transform((email) => email.toLowerCase().trim()),
  password: z.string().min(1),
});
