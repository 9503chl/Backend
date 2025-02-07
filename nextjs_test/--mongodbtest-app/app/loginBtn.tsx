'use client'

import { signIn, signOut } from "next-auth/react";

export default async function LoginoutBtn() {

    return (
        <div>
            <button onClick={()=>{signIn('github', {
                callbackUrl: 'http://localhost:3000',
                redirect: true
            })}}>로그인</button>
            <button onClick={()=>{
                document.cookie = "next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                signOut({
                    callbackUrl: 'http://localhost:3000',
                    redirect: true
                })
            }}>로그아웃</button>
        </div>
    )
}