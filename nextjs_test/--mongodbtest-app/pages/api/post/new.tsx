import { connectDB } from "@/util/database";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function PostNew(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === 'POST') {

        let session = await getServerSession(req, res, authOptions);

        if(session) {
            req.body.author = session.user?.email;
        }

        const db = (await connectDB).db("forum");
        if(req.body.title && req.body.content) {    
            try 
            {
                const result = await db.collection('post').insertOne(req.body);
                return res.status(200).redirect(302, '/list');
            } 
            catch (error) 
            {
                return res.status(500).json({message: '데이터 저장 실패'});
            }
        }
        return res.status(400).json({message: '데이터가 없습니다.'});
    }
}
//redirect 302 : 주소 이동 -> 완성하면 초기화면으로 돌아감.
