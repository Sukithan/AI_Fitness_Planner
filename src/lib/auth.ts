// src/lib/auth.ts
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import NextAuth from 'next-auth';

const handler = NextAuth(authOptions);

export async function getServerSession() {
  const session = await handler.auth();
  return session;
}