import DetailBtn from "./detail/detailBtn";
import LoginButton from "./login/loginBtn";
import RegisterButton from "./register/registerBtn";

export default async function Home() {
  return (
    <div>
      <h1>광주 테스트 페이지입니다!</h1>
      <LoginButton />
      <RegisterButton />
      <DetailBtn />
    </div>
  );
}
