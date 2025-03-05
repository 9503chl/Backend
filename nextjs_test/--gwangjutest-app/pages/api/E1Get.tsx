import { connectDB, disconnectDB } from '@/util/database';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '허용되지 않는 메소드입니다.' });
  }

  try {
    const db = await connectDB('gwangju');
    const user = await db.collection('account').findOne({
      email: req.query.email
    });

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    const response = {
      status: "success", 
      code: 200,
      data: user
    };

    await disconnectDB();

    return res.status(200).json(response);
  } catch (error) {
    console.error('에러 발생:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
}
