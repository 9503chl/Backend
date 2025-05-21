'use client'

import { getSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function LoginoutBtn() {

    const [isLoggedIn, setIsLoggedIn] = useState(false)
    useEffect(()=>{
        getSession().then((session) => {
            setIsLoggedIn(!!session);
        })
    }, [])

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
            <button onClick={()=>{
                window.location.href = '/register'
            }} disabled={isLoggedIn}>회원가입</button>
        </div>
    )
}