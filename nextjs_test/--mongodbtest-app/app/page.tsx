import Image from "next/image";
import styles from "./page.module.css";
import { connectDB } from "@/util/database";
import { MongoClient } from "mongodb";

export default async function Home() {
  //대신 이렇게 불러오는 코드는 서버에서만 하자
  const db = (await connectDB).db("forum");
  const result = await db.collection("post").find().toArray();

  return (
    <div>
      <h1>id : {result[0]._id.toString()}</h1>
      <h1>title : {result[0].title}</h1>
      <h1>content : {result[0].content}</h1>
    </div>
  );
}
