import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  let name = '최'
  return (
    <div>
      <div>
        <h4 className="title">쿠팡후레시</h4>
        <p className="title-sub">by dev {name}</p>
      </div>
    </div>
  )
}
