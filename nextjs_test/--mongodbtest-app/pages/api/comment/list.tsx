import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";

export default async function handler(req: any, res: any) {
    if (req.method == 'GET') {
        try {
            const db = (await connectDB).db("forum");
            let result = await db.collection('comment')
            .find({ parent : req.query.id }).toArray();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json('에러가 발생했습니다');
        }
    }
}
