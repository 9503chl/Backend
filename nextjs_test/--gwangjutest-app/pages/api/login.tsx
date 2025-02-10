import { connectDB } from '@/util/database';
import { NextApiRequest, NextApiResponse } from 'next';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default async function handleLogin(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await connectDB("gwangju");
    const accountData = await db.collection('accounts').findOne({
      email: req.body.email,
      password: req.body.password
    });

    if (accountData) {
      const session = {
        user: {
          id: accountData._id,
          email: accountData.email,
          name: accountData.name
        },
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      await signIn('credentials', session);
      
      const router = useRouter();
      return session;
      router.push('/');

    } else {
      res.status(401).json({ error: '이메일 또는 비밀번호가 일치하지 않습니다.' });
    }
  } catch (error) {
    console.error('로그인 에러:', error);
    res.status(500).json({ error: '로그인 중 오류가 발생했습니다.' });
  }
};
