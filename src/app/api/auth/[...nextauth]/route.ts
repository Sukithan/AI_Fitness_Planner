import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import dbConnect from '@/lib/db';
import { ApiResponse } from '@/types';


declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        console.log('Credentials:', credentials);
        console.log('Request:', req); // Add this to check the request object

        await dbConnect();
        
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            throw new Error('InvalidCredentials'); // Special error code
          }
          
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error('InvalidCredentials'); // Same error code for security
          }
          
          return { 
            id: user._id.toString(), 
            email: user.email, 
            name: user.name 
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error('InvalidCredentials');
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login?error=InvalidCredentials'
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };