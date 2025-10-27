import { z } from "zod";

const emailSchema = z
  .string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string",
  })
  .trim()
  .toLowerCase()
  .pipe(
    z.string().regex(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Invalid email format"
    )
  );

const passwordSchema = z
  .string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  })
  .trim();

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema.min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema
    .min(6, "Password must be at least 6 characters long")
    .max(128, "Password must not exceed 128 characters"),
});
