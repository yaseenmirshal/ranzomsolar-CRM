import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { UserRole } from "@/lib/auth/roles";
import { db } from "@/prisma/db";
import { loginSchema } from "@/lib/auth/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email address", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db.orm.public.User.where({ email: parsed.data.email }).first();
        if (!user?.active || !user.passwordHash) return null;
        if (!(await compare(parsed.data.password, user.passwordHash))) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      const id = typeof token.id === "string" ? token.id : null;
      const role = Object.values(UserRole).find((candidate) => candidate === token.role);
      if (session.user && id && role) {
        session.user.id = id;
        session.user.role = role;
      }
      return session;
    },
  },
});
