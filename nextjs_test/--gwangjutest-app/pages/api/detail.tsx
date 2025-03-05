import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB, disconnectDB } from '@/util/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '허용되지 않는 메소드입니다.' });
  }

  const { email } = req.query;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: '이메일이 필요합니다.' });
  }

  try {
    const db = await connectDB('gwangju');
    const user = await db.collection('account').findOne({
      email: email
    });

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    return res.status(200).json(user);

  } catch (error) {
    console.error('사용자 정보 조회 중 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  } finally {
    await disconnectDB();
  }
}
