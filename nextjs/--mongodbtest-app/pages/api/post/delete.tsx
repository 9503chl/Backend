import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function Delete(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === 'DELETE') {
        const db = (await connectDB).db("forum");
        const result = await db.collection('post').deleteOne({_id: new ObjectId(JSON.parse(req.body)._id)});
        let session = await getServerSession(req, res, authOptions as any);
        
        if(result.deletedCount === 1 && JSON.parse(req.body).author === (session as any)?.user?.email) {
            return res.status(200).json('삭제완료');
        } else {
            return res.status(500).json('삭제 실패');
        }
    }
}
