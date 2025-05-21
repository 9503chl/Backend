import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";

interface EditProps {
    params: {
        id: string
    }
}

interface PageProps {
    params: Promise<any>
}

export default async function Edit({ params }: EditProps & PageProps) {
    const db = (await connectDB).db("forum");
    const result = await db.collection('post').findOne({_id: new ObjectId(params.id)});

    return <div className="p-20">
        <h4>글수정</h4>
        <form action="/api/post/edit" method="post">
            <input type="text" name="title" placeholder="글제목" defaultValue={result?.title} />
            <input type="text" name="content" placeholder="글내용" defaultValue={result?.content} />
            <input type="hidden" name="_id" defaultValue={result?._id.toString()} />
            <button type="submit">Post</button>
        </form>
    </div>
}