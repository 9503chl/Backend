'use client'

import router, { usePathname, useRouter } from "next/navigation"

export default function DetailLink(props: any) {
    let router = useRouter()
    return (
        <button onClick={() => {
            router.push(`/`)
        }}>메인페이지로 이동</button>
    )
}