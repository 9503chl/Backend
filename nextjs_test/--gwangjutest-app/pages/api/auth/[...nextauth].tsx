import { connectDB } from "@/util/database";
import NextAuth from "next-auth";
import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcrypt';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'custom',
      name: 'Custom Provider',
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const db = await connectDB('gwangju');
          const user = await db.collection('account').findOne({
            email: credentials.email
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name
          };
        } catch (error) {
          console.error('인증 에러:', error);
          return null;
        }
      }
    })
  ],
  
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일 (초 단위)
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        //session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/error'
  }
};

export default NextAuth(authOptions);