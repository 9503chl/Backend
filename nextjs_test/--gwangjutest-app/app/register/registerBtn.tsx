'use client'

import { useSession } from "next-auth/react";
import SessionProvider from "../component/SessionProvider";

function RegisterButtonContent() {
  const session = localStorage.getItem('session');
  
  return (
    <>
      {!session && (
        <button 
          onClick={() => window.location.href = '/register'} 
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          회원가입
        </button>
      )}
    </>
  );
}

export default function RegisterButton() {
  return (
    <SessionProvider>
      <RegisterButtonContent />
    </SessionProvider>
  );
}
