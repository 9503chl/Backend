import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // JSON Web Token을 사용하여 세션 저장
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.sub; // 유저 ID 추가
      }
      return session;
    },
  },
});