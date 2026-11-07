import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Enter the customer's name.").max(160),
  phone: z.string().trim().refine(
    (value) => {
      const digits = value.replace(/\D/g, "");
      return /^[6-9]\d{9}$/.test(digits) || /^91[6-9]\d{9}$/.test(digits);
    },
    "Enter a valid 10-digit Indian mobile number.",
  ),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email address.")]),
  address: z.string().trim().max(500),
  district: z.string().trim().max(100),
  category: z.enum(["RESIDENTIAL", "COMMERCIAL"]),
});

export type CustomerInput = z.infer<typeof customerSchema>;
