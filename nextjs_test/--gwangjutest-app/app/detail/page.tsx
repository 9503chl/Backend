'use client'
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSession } from 'next-auth/react';

interface UserInfo {
  email: string;
  user_id: string;
  student_id: string;
  name: string;
}

export default function DetailPage() {
  const { data: session, status } = useSession();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (!session?.user?.email) {
          throw Error('세션 정보가 없습니다.');
        }
          
        const response = await fetch(`/api/detail?email=${session.user.email}`); 
        
        if (!response.ok) {
          throw Error('사용자 정보를 가져오는데 실패했습니다.');
        }
        const data = await response.json();
        setUserInfo(data);
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      }
    };

    if (session?.user?.email) {
      fetchUserInfo();
    }
  }, [session]);

  if (status === "loading") {
    return <div>로딩중...</div>;
  }

  if (!session) {
    return <div>로그인이 필요합니다.</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!userInfo) {
    return <div>로딩중...</div>;
  }

  const qrData = JSON.stringify({
    user_id: userInfo.user_id,
    student_id: userInfo.student_id
  });

  return (
    <div>
      <h1>사용자 정보</h1>
      
      <div>
        <p><strong>이메일:</strong> {userInfo.email}</p>
        <p><strong>이름:</strong> {userInfo.user_id}</p>
        <p><strong>학번:</strong> {userInfo.student_id}</p>
      </div>

      <div>
        <h2>QR 코드 <button onClick={() => {
          const svg = document.querySelector('svg');
          if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const img = new Image();
              img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const pngFile = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.download = 'qr-code.png';
                downloadLink.href = pngFile;
                downloadLink.click();
              };
              img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
            }
          }
        }}>
          다운로드
        </button></h2>
        <div>
          <QRCodeSVG value={qrData} size={256} />  
        </div> 
      </div>
    </div>
  );
}
