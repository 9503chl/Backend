import { connectDB } from "@/util/database";
import { AuthOptions, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: any, res: any) {

    let session = await getServerSession(req, res, authOptions as AuthOptions)

    if (req.method == 'POST' && session) {
        try {
            const db = (await connectDB).db("forum");
            let { comment} = JSON.parse(req.body);
            
            let insertData = {
                content: comment,
                author: session?.user?.email,
                parent: JSON.parse(req.body).id
            }

            let result = await db.collection('comment').insertOne(insertData);
            res.status(200).json('저장완료');
            
        } catch (error) {
            res.status(500).json('에러가 발생했습니다');
        }
    }
}
