import { connectDB } from '@/util/database';
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';

export default async function handleLogin(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await connectDB("gwangju");
    const accountData = await db.collection('account').findOne({
      email: req.body.email,
    });

    if (accountData?.password && await bcrypt.compare(req.body.password, accountData.password)) {
      const session = {
        user: {
          id: accountData?._id,
          email: accountData?.email,
          name: accountData?.name
        },
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      return res.status(200).json({ session });

    } else {
      res.status(401).json({ error: '이메일 또는 비밀번호가 일치하지 않습니다.' });
    }
  } catch (error) {
    console.error('로그인 에러:', error);
    res.status(500).json({ error: '로그인 중 오류가 발생했습니다.' });
  }
};
