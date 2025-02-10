import { connectDB } from "@/util/database";
import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
      let hash = await bcrypt.hash(req.body?.password, 10);
      req.body.password = hash;

      const qr = require('qrcode');
      const qrCode = await qr.toDataURL(req.body.email);
      req.body.qrCode = qrCode;

      let db = (await connectDB).db('forum');
      await db.collection('user_cred').insertOne(req.body);
      res.status(200).json('성공');
  }
}; 