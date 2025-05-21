import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function Edit(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        if (!req.body.title || !req.body.content) {
            return res.status(400).json({ message: '제목과 내용을 모두 입력해주세요' });
        }

        try {
            const db = (await connectDB).db("forum");
            let result = await db.collection('post').updateOne(
                {_id: new ObjectId(req.body._id)},
                {$set: { title: req.body.title, content: req.body.content }}
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: '수정할 게시글을 찾을 수 없습니다' });
            }

            return res.status(200).redirect(302, '/list');
        } catch (error) {
            console.error('게시글 수정 중 오류 발생:', error);
            return res.status(500).json({ message: '게시글 수정에 실패했습니다' });
        }
    }
}