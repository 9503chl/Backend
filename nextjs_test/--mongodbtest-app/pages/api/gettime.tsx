import type { NextApiRequest, NextApiResponse } from "next";

export default function GetTime(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const currentTime = new Date().toLocaleString('ko-KR');
        return res.status(200).json({ currentTime: currentTime });
    }
}
