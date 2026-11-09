import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Enter the customer's name.").max(160),
  phone: z.string().trim().refine(
    (value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 7 && digits.length <= 15;
    },
    "Enter a valid phone number.",
  ),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email address.")]),
  address: z.string().trim().max(500),
  district: z.string().trim().max(100),
  category: z.enum(["RESIDENTIAL", "COMMERCIAL"]),
});

export type CustomerInput = z.infer<typeof customerSchema>;
