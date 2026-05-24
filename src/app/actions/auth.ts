"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { LoginFormSchema, FormState } from "@/lib/definitions";
import { createSession, deleteSession } from "@/lib/session";

const USERS_FILE = path.join(process.cwd(), "src/data/users.json");

interface UserStore {
  id: string;
  name: string;
  email: string;
  nik: string;
  passwordHash: string;
  role: string;
}

function readUsers(): UserStore[] {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      return [];
    }
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeUsers(users: unknown) {
  const dir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

// Auto-seed demo accounts if empty
async function seedDemoUsersIfNeeded() {
  const users = readUsers();
  if (users.length === 0) {
    const adminHash = await bcrypt.hash("admin123", 10);
    const synergyHash = await bcrypt.hash("synergy123", 10);
    const founderHash = await bcrypt.hash("founder123", 10);

    const demoUsers: UserStore[] = [
      {
        id: "demo-admin-id",
        name: "Hendra Wijaya",
        email: "hendra.wijaya@telkom.co.id",
        nik: "940123",
        passwordHash: adminHash,
        role: "admin",
      },
      {
        id: "demo-synergy-id",
        name: "Rina Kusuma",
        email: "rina.kusuma@telkom.co.id",
        nik: "940789",
        passwordHash: synergyHash,
        role: "synergy",
      },
      {
        id: "demo-founder-id",
        name: "Yusuf Pratama",
        email: "yusuf@antarestar.com",
        nik: "850456",
        passwordHash: founderHash,
        role: "founder",
      },
    ];
    writeUsers(demoUsers);
  }
}

export async function login(state: FormState, formData: FormData) {
  await seedDemoUsersIfNeeded();

  const validatedFields = LoginFormSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { identifier, password } = validatedFields.data;
  const users = readUsers();

  // Search by NIK
  const user = users.find((u) => u.nik === identifier);

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
  await seedDemoUsersIfNeeded();
  const users = readUsers();
  const user = users.find((u) => u.role === role);

  if (user) {
    await createSession(user.id, user.email, user.name, user.role);
    redirect("/dashboard");
  }
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
