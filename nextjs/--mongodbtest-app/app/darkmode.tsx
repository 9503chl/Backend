'use client'

import { useEffect, useState } from "react"

export default function DarkMode(){

    const [theme, setTheme] = useState('light')

    useEffect(()=>{
        let cookie = ('; ' + document.cookie).split(`; darkmode=`).pop()?.split(';')[0]
        if (!cookie) {
            document.cookie = 'darkmode=light; max-age=' + (3600 * 24 * 400)
            document.documentElement.setAttribute('data-theme', 'light')
            setTheme('light')
        } else if (cookie == 'light') {
            document.documentElement.setAttribute('data-theme', 'light')
            setTheme('light') 
        } else {
            document.documentElement.setAttribute('data-theme', 'dark')
            setTheme('dark')
        }
    }, [])

  return (
    <span onClick={()=>{ 
      if (theme == 'light') {
        document.cookie = 'darkmode=dark; max-age=' + (3600 * 24 * 400)
        document.documentElement.setAttribute('data-theme', 'dark')
        setTheme('dark')
        window.location.reload()
      } else {
        document.cookie = 'darkmode=light; max-age=' + (3600 * 24 * 400) 
        document.documentElement.setAttribute('data-theme', 'light')
        setTheme('light')
        window.location.reload()
      }
    }}>
      {theme == 'light' ? '🌙' : '☀️'}
    </span>
  )
}