'use client'

import Link from "next/link";
import DetailLink from "./detailLink";

export default async function Listitem({result}: {result: any}) {

    return (
        <div>
            {   
            result.map((post: any, i: any) => (
              <div className="list-item" key={i}>
                <Link prefetch={false} href={`/detail/${post._id}`}><h4>{post.title}</h4></Link>
                <Link prefetch={false} href={`/edit/${post._id}`}>🏒</Link>
                <span onClick={(e) => {
                    fetch('/api/post/delete', {
                        method: 'DELETE',
                        body: JSON.stringify({_id: post._id}),
                    }).then((r)=>{
                        if(r.status == 200) {
                          return r.json()
                        } else {
                          //서버가 에러코드전송시 실행할코드
                        }
                      })
                      .then((result)=>{ 
                            if (e.target instanceof HTMLElement && e.target.parentElement) {
                                e.target.parentElement.style.opacity = '0';
                                setTimeout(() => {
                                    if (e.target instanceof HTMLElement && e.target.parentElement) {
                                        if (e.target.parentElement) {
                                            e.target.parentElement.style.display = 'none';
                                        }
                                }
                                }, 1000);
                            }
                                               
                      }).catch((error)=>{
                        //인터넷문제 등으로 실패시 실행할코드
                        console.log(error)
                      })

                    // fetch('/api/post/delete?id=' + post._id, {
                    //     method: 'DELETE',
                    //     body: JSON.stringify({_id: post._id}),
                    // }).then((r)=>{
                    //     if(r.status == 200) {
                    //       return r.json()
                    //     } else {
                    //       //서버가 에러코드전송시 실행할코드
                    //     }
                    //   })
                    //   .then((result)=>{ 
                    //         if (e.target instanceof HTMLElement && e.target.parentElement) {
                    //             e.target.parentElement.style.opacity = '0';
                    //             setTimeout(() => {
                    //                 if (e.target instanceof HTMLElement && e.target.parentElement) {
                    //                     if (e.target.parentElement) {
                    //                         e.target.parentElement.style.display = 'none';
                    //                     }
                    //             }
                    //             }, 1000);
                    //         }
                                               
                    //   }).catch((error)=>{
                    //     //인터넷문제 등으로 실패시 실행할코드
                    //     console.log(error)
                    //   })
                }}>🗑</span>
                <p>{post.content}</p>
                <DetailLink id={post._id} />
              </div>
            ))
          }
        </div>
    )
}