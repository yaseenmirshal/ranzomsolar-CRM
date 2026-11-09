import "dotenv/config";
import { hash } from "bcryptjs";
import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";
import contractJson from "../src/prisma/contract.json" with { type: "json" };
import { createInterface } from "node:readline/promises";
import { randomUUID } from "node:crypto";
import { stdin, stdout } from "node:process";

const contract = contractFromJson(contractJson);
const db = postgres({
  contract,
  ...(process.env.DATABASE_URL ? { url: process.env.DATABASE_URL } : {}),
});

async function promptForAdmin() {
  const readline = createInterface({ input: stdin, output: stdout });
  try {
    const email = (process.env.ADMIN_EMAIL || await readline.question("Admin email: ")).trim().toLowerCase();
    const name = (process.env.ADMIN_NAME || await readline.question("Admin name: ")).trim();
    let password = process.env.ADMIN_PASSWORD;

    if (!password) {
      if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
        throw new Error("Run this command in an interactive terminal to enter the admin password securely.");
      }

      readline.close();
      stdout.write("New admin password (12+ characters; input hidden): ");
      stdin.setEncoding("utf8");
      stdin.setRawMode(true);
      stdin.resume();
      password = await new Promise((resolve, reject) => {
        let value = "";
        const onData = (key) => {
          if (key === "\u0003") {
            stdin.off("data", onData);
            stdin.setRawMode(false);
            reject(new Error("Admin setup cancelled."));
          } else if (key === "\r" || key === "\n") {
            stdin.off("data", onData);
            stdin.setRawMode(false);
            stdout.write("\n");
            resolve(value);
          } else if (key === "\u007f" || key === "\b") {
            value = value.slice(0, -1);
          } else {
            value += key;
          }
        };
        stdin.on("data", onData);
      });
    }

    return { email, name, password };
  } finally {
    readline.close();
  }
}

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("Set DATABASE_URL before provisioning the administrator.");
  }

  const { email, password, name } = await promptForAdmin();

  if (!email || !password || !name) {
    throw new Error("Email, password, and name are required to provision the administrator.");
  }
  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }

  const passwordHash = await hash(password, 12);
  const timestamp = new Date();
  const existing = await db.orm.public.User.where({ email }).select("id").first();
  if (existing) {
    const updated = await db.orm.public.User.where({ id: existing.id }).update({
      name,
      passwordHash,
      role: "SUPER_ADMIN",
      active: true,
      updatedAt: timestamp,
    });
    if (!updated) {
      throw new Error("The existing administrator account could not be updated.");
    }
  } else {
    await db.orm.public.User.create({
      id: randomUUID(),
      email,
      name,
      passwordHash,
      role: "SUPER_ADMIN",
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }
  console.log(`Administrator account provisioned for ${email}.`);
}

main()
  .catch((error) => {
    console.error("Administrator provisioning failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.close();
  });
