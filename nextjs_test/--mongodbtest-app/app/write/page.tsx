//form 형태에 Get,Post만 가능

import { AuthOptions, getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { redirect } from "next/navigation"

export default async function Write() {

    let session = await getServerSession(authOptions as AuthOptions)
    
    if (!session) {
        redirect('/api/auth/signin')
    }

    return <div className="p-20">
        <h4>글작성</h4>
        <form action="/api/post/new" method="post">
            <input type="text" name="title" placeholder="글제목" />
            <input type="text" name="content" placeholder="글내용" />
            <button type="submit">Post</button>
        </form>
    </div>
}