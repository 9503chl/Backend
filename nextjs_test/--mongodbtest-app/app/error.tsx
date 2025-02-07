'use client'

export default function Error({ error, reset}: { error: Error, reset: () => void }) {
    return (
        <div>
            <div>에러가 발생했습니다.</div>
            <button onClick={()=>{reset()}}>다시 시도</button>
        </div>
    )
}