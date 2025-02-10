import { connectDB } from '@/util/database';

export async function checkDuplicateAndValidate(email: string, password: string) {
  try {

    const db = await connectDB("gwangju");
    const collection = db.collection('account');
    
    // 이메일 중복 확인
    const existingUser = await collection.findOne({ email: email });
    if (existingUser) {
      return {
        success: false,
        message: '이미 등록된 이메일입니다.'
      };
    }

    // 비밀번호 유효성 검사
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{12}$/;
    if (!passwordRegex.test(password)) {
      return {
        success: false,
        message: '비밀번호는 대문자와 숫자를 포함한 12자여야 합니다.'
      };
    }

    return {
      success: true,
      message: '유효한 정보입니다.'
    };

  } catch (error) {
    console.error('사용자 정보 검증 중 오류 발생:', error);
    return {
      success: false,
      message: '서버 오류가 발생했습니다.'
    };
  }
}
