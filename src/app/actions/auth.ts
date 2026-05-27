"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { LoginFormSchema, FormState } from "@/lib/definitions";
import { createSession, deleteSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function login(state: FormState, formData: FormData) {
  const validatedFields = LoginFormSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { identifier, password } = validatedFields.data;

  // Search by NIK using Prisma
  const user = await prisma.user.findUnique({
    where: { nik: identifier },
  });

  if (!user) {
    return { message: "NIK atau password salah." };
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return { message: "NIK atau password salah." };
  }

  await createSession(user.id, user.email, user.name, user.role.toLowerCase());
  redirect("/dashboard");
}

// Quick login for demo/presentation purposes
export async function loginAsDemo(role: "admin" | "synergy" | "founder") {
  const dbRole = role.toUpperCase() as Role;
  const user = await prisma.user.findFirst({
    where: { role: dbRole },
  });

  if (user) {
    await createSession(user.id, user.email, user.name, user.role.toLowerCase());
    redirect("/dashboard");
  }
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
