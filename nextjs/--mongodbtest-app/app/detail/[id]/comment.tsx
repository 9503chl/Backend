'use client'

import { useEffect, useState } from "react";
import { ObjectId } from "mongodb";

interface CommentProps {
  _id: ObjectId | undefined;
}

export default function Comment({ _id }: CommentProps) {
    let [data, setData] = useState([])
    useEffect(() =>{
        fetch(`/api/comment/list?id=${_id}`, { method: 'GET' })
        .then((r)=>{
            return r.json()
        })
        .then((result)=>{
            setData(result)
        })
    }, [])

    let [comment, setComment] = useState('')
    return (
        <div>
            <div>댓글 목록</div>
            {
                data.length > 0 ?
                data.map((a: any)=>{
                    return <div key={a._id}>{a.author} : {a.content}</div>
                })
                :
                <div>댓글이 없습니다.</div>
            }

            <input onChange={(e)=>{setComment(e.target.value) }} />
        <button onClick={()=>{
            fetch('/api/post/comment', {
                method: 'POST',
                body: JSON.stringify({
                    comment: comment,
                    id: _id
                }),
            })
        }}>댓글 전송</button>
        </div>
    )
}