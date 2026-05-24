import { z } from "zod";

export const LoginFormSchema = z.object({
  identifier: z.string().min(1, "NIK harus diisi").trim(),
  password: z.string().min(1, "Password harus diisi"),
});

export type FormState =
  | { errors?: { identifier?: string[]; password?: string[] }; message?: string }
  | undefined;

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: string;
  expiresAt: Date;
};
