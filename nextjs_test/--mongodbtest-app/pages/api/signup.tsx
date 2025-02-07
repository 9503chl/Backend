import { connectDB } from "@/util/database";
import { NextApiRequest, NextApiResponse } from "next";

export default async function Signup(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === 'POST') {
        const db = (await connectDB).db("forum");
        
        // 이메일 중복 체크
        const existingUser = await db.collection('user').findOne({ email: req.body.email });
        if(existingUser) {
            return res.status(400).json({ message: '이미 존재하는 이메일입니다.' });
        }

        // 필수 입력값 체크
        if(req.body.name && req.body.email && req.body.password) {
            try {
                const result = await db.collection('post').insertOne(req.body);
                return res.status(200).redirect(302, '/');
            } catch(error) {
                return res.status(500).json({ message: '회원가입 실패' });
            }
        }
        return res.status(400).json({ message: '모든 항목을 입력해주세요.' });
    }
}
