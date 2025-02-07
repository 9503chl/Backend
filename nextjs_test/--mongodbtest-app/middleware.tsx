import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(req: NextRequest) {

    let session = await getToken({ req : req})
   
    // if(req.nextUrl.pathname.startsWith('/write')) {
    //     if(session == null) {
    //         return NextResponse.redirect(new URL('/signin', req.url))
    //     }
    // }
   
    if (req.nextUrl.pathname.startsWith('/list')) {
        console.log(req.headers.get('sec-ch-ua-platform'))
        console.log(new Date())

        return NextResponse.next()
    }

    if (req.nextUrl.pathname.startsWith('/register')) {
        const response = NextResponse.next()
        response.cookies.set('visited', 'true')
        return response
    }
}