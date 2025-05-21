import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/util/database';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest,res: NextApiResponse) 
{
    if (req.method !== 'POST') {
      return res.status(405).json({ error: '허용되지 않는 메소드입니다.' });
    }

    try {
      const { email, password } = req.body;

      // 이메일 유효성 검사
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: '유효한 이메일을 입력해주세요.' });
      }

      // 비밀번호 유효성 검사 
      if (!password || password.length < 6) {
        return res.status(400).json({ error: '비밀번호는 최소 6자 이상이어야 합니다.' });
      }

      // DB 연결 및 이메일 중복 확인
      const db = await connectDB("gwangju");
      const existingUser = await db.collection("account").findOne({
          email: email
      });


      if (existingUser) {
        return res.status(400).json({ error: '이미 등록된 이메일입니다.' });
      }

      // 비밀번호 해시화
      const hashedPassword = await bcrypt.hash(password, 10);

      // 랜덤 user_id 생성 (6자리)
      const user_id = Math.floor(100000 + Math.random() * 900000).toString();
      
      // 랜덤 student_id 생성 (8자리)
      const student_id = Math.floor(10000000 + Math.random() * 90000000).toString();

      // 사용자 생성
      const result = await db.collection("account").insertOne({
        email,
        password: hashedPassword,
        user_id,
        student_id
      });


      res.status(200).json({ message: '회원가입이 완료되었습니다.', user: result });
    } catch (error) {
      console.error('회원가입 에러:', error);
      res.status(500).json({ error: '회원가입 처리 중 오류가 발생했습니다.' });
    }
}
