import { useEffect, useState } from "react"
import { ObjectId } from "mongodb"
import { getSession, signIn, signOut } from "next-auth/react"
import LoginoutBtn from "./loginBtn"
import Comment from "./detail/[id]/comment"

export default function Component() {
    const [session, setSession] = useState(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
}