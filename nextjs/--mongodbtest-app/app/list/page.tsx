import { connectDB } from "@/util/database";
import Listitem from "./Listitem";

export const dynamic = 'force-dynamic'

export default async function List() {
  const db = (await connectDB).db("forum");
  const result = await db.collection("post").find().toArray();

    return (
      <div className="list-bg">
          <Listitem result={result} />
      </div>
    )
  } 