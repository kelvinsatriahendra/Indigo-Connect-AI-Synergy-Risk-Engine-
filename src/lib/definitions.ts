import { z } from "zod";

export const SignupFormSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").trim(),
  email: z.string().email("Email tidak valid").trim(),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const LoginFormSchema = z.object({
  email: z.string().email("Email tidak valid").trim(),
  password: z.string().min(1, "Password harus diisi"),
});

export type FormState =
  | { errors?: { name?: string[]; email?: string[]; password?: string[] }; message?: string }
  | undefined;

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: string;
  expiresAt: Date;
};
