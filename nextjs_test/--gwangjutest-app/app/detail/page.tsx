'use client'
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface UserInfo {
  email: string;
  user_id: string;
  student_id: string;
  name: string;
}

export default function DetailPage({
  searchParams
}: {
  searchParams: { email: string }
}) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`/api/user?email=${searchParams.email}`);
        if (!response.ok) {
          throw new Error('사용자 정보를 가져오는데 실패했습니다.');
        }
        const data = await response.json();
        setUserInfo(data);
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      }
    };

    if (searchParams.email) {
      fetchUserInfo();
    }
  }, [searchParams.email]);

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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">사용자 정보</h1>
      
      <div className="mb-4">
        <p><strong>이메일:</strong> {userInfo.email}</p>
        <p><strong>이름:</strong> {userInfo.name}</p>
        <p><strong>학번:</strong> {userInfo.student_id}</p>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">QR 코드</h2>
        <div className="p-4 bg-white inline-block rounded-lg shadow-md">
          <QRCodeSVG value={qrData} size={256} />
        </div>
      </div>
    </div>
  );
}
