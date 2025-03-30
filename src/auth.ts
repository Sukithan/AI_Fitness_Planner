// src/auth.ts
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

// Export the auth function properly
export default handler;
export const auth = () => NextAuth(authOptions).auth;