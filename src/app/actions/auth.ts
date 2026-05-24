"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { LoginFormSchema, FormState } from "@/lib/definitions";
import { createSession, deleteSession } from "@/lib/session";

// Demo users stored in memory — works on Vercel (no filesystem needed)
const DEMO_USERS = [
  {
    id: "demo-admin-id",
    name: "Hendra Wijaya",
    email: "hendra.wijaya@telkom.co.id",
    nik: "940123",
    passwordHash: "$2b$10$r84H0sR36wQ1Jhjx.51Y.OSKQroRDncUlkD14NCf/JT5Ts4Q.GRxa", // admin123
    role: "admin",
  },
  {
    id: "demo-synergy-id",
    name: "Rina Kusuma",
    email: "rina.kusuma@telkom.co.id",
    nik: "940789",
    passwordHash: "$2b$10$9ej0NlHfT6JqD8OjlxcLGuDn6nlQHKKu8heYnLvuOzbu67m1XWjC6", // synergy123
    role: "synergy",
  },
  {
    id: "demo-founder-id",
    name: "Yusuf Pratama",
    email: "yusuf@antarestar.com",
    nik: "850456",
    passwordHash: "$2b$10$FnD1lqdqrsNR1Bp8SHgPCOjPzRWYeEBcwLzkJZzvRHeVl1YikRTAS", // founder123
    role: "founder",
  },
];

export async function login(state: FormState, formData: FormData) {
  const validatedFields = LoginFormSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { identifier, password } = validatedFields.data;

  // Search by NIK
  const user = DEMO_USERS.find((u) => u.nik === identifier);

  if (!user) {
    return { message: "NIK atau password salah." };
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return { message: "NIK atau password salah." };
  }

  await createSession(user.id, user.email, user.name, user.role);
  redirect("/dashboard");
}

// Quick login for demo/presentation purposes
export async function loginAsDemo(role: "admin" | "synergy" | "founder") {
  const user = DEMO_USERS.find((u) => u.role === role);

  if (user) {
    await createSession(user.id, user.email, user.name, user.role);
    redirect("/dashboard");
  }
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
