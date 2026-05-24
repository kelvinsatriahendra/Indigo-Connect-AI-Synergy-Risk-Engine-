"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { SignupFormSchema, LoginFormSchema, FormState } from "@/lib/definitions";
import { createSession, deleteSession } from "@/lib/session";

const USERS_FILE = path.join(process.cwd(), "src/data/users.json");

function readUsers(): Array<{ id: string; name: string; email: string; password: string; role: string }> {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeUsers(users: unknown) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export async function signup(state: FormState, formData: FormData) {
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, email, password } = validatedFields.data;
  const users = readUsers();

  if (users.find((u) => u.email === email)) {
    return { message: "Email sudah terdaftar" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: crypto.randomUUID(),
    name,
    email,
    password: hashedPassword,
    role: users.length === 0 ? "admin" : "user",
  };

  writeUsers([...users, newUser]);

  await createSession(newUser.id, newUser.email, newUser.name, newUser.role);
  redirect("/dashboard");
}

export async function login(state: FormState, formData: FormData) {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password } = validatedFields.data;
  const users = readUsers();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return { message: "Email atau password salah" };
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return { message: "Email atau password salah" };
  }

  await createSession(user.id, user.email, user.name, user.role);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
