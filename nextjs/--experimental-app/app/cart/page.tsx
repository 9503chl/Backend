import {age, name} from "./data";

export default function Cart() {
    let 장바구니  = ['Tomatoes', 'Pasta' , 'Coconut']
  return (
    <div>
      <h4 className="title">Cart</h4>

      {장바구니.map((a, i) => {
        return (
          <CartItem name={a} />
        )
      })}

      <Banner name="현대카드" />
      <Banner name="삼성카드" />
      <Banner name="신한카드" />

      <Button name="버튼" color="red" />   
      <Button name="버튼" color="blue" />
    </div>
  )
}

//컴포넌트 만들기 --> 그냥 만들어두면 서버 컴포넌트가 됨.
//장점 : 로딩 속도가 빠름.
//단점 : 자바스크립트 기능 넣기 불가능.
//'use client'
//대신 이 줄을 사용하면, 이 아래 컴포넌트는 클라이언트 컴포넌트가 됨.
//장점 : 자바스크립트 기능 넣기 가능.
//단점 : 로딩 속도가 느림.

function Banner(props : any) {
    return (
        <h5>{props.name}결제 행사중</h5>
    )
}

function Button(props : any) {
    return (
        <button style={{color: props.color}}>{props.name}</button>
    )
}

function CartItem(props: any) {
  return (
    <div className="cart-item">
      <p>{props.name}</p>
      <p>$40</p>
      <p>1개</p>
    </div>
  )
}
