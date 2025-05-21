import { connectDB } from "@/util/database";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import NextAuth, { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcrypt';

export const authOptions = {
  providers: [

    CredentialsProvider({
      //1. 로그인페이지 폼 자동생성해주는 코드 
      name: "credentials",
      type: "credentials",
      credentials: {
        email: { label: "email", type: "text", placeholder: "이메일" },
        password: { label: "password", type: "password", placeholder: "비밀번호" },
      },

      //2. 로그인요청시 실행되는코드
      //직접 DB에서 아이디,비번 비교하고 
      //아이디,비번 맞으면 return 결과, 틀리면 return null 해야함
      async authorize(credentials: any) {
        let db = (await connectDB).db('forum');
        let user = await db.collection('user_cred').findOne({email : credentials.email})
        if (!user) {
          console.log('해당 이메일은 없음');
          return null
        }
        const pwcheck = await bcrypt.compare(credentials.password, user.password);
        if (!pwcheck) {
          console.log('비번틀림');
          return null
        }
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email
        }
      }
    }),
    GithubProvider({
      clientId: 'Ov23lijVroDkfHaApnoR',
      clientSecret: 'e8d1b02e54165d323329cdb9e4763106453c3ac5',
      allowDangerousEmailAccountLinking: true,
    })
  ],

  //3. jwt 써놔야 잘됩니다 + jwt 만료일설정
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 //30일
  },
  

  callbacks: {
    //4. jwt 만들 때 실행되는 코드 
    //user변수는 DB의 유저정보담겨있고 token.user에 뭐 저장하면 jwt에 들어갑니다.
    jwt: async ({ token, user }: { token: any, user: any }) => {
      if (user) {
        token.user = {};
        token.user.name = user.name
        token.user.email = user.email
      }
      return token;
    },
    //5. 유저 세션이 조회될 때 마다 실행되는 코드
    session: async ({ session, token }: { session: any, token: any }) => {
      session.user = token.user;  
      return session;
    },
  },

  adapter: MongoDBAdapter(connectDB),
  secret: 'ehdcns12'  
};
export default NextAuth(authOptions as AuthOptions); 