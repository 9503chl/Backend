'use client'

import { useState } from "react";
import Image from "next/image";

import publicImg0 from "@/public/0.jpg";
import publicImg1 from "@/public/1.jpg";
import publicImg2 from "@/public/2.jpg";

import styles from "./page.module.css";


export default function List() {
    let 상품 = ['Tomatoes', 'Pasta', 'Coconut']
    let 이미지 = [publicImg0, publicImg1, publicImg2]
    //state 만들기 --> client에서만 가능
    //장점 : 안의 변수가 바뀌었을 때, 동적으로 바뀜.
    let [수량, setCount] = useState([0,0,0])

    return (
      <div>
        <h4 className="title">상품 목록</h4>
        {
          상품.map((item, index) => {
              return (
                  <div className="food" key = {index}>
                      <Image src={이미지[index]} className="food-img" alt="dog"/>
                      <h4>{item} $40</h4>
                      <span>{수량[index]}</span>
                      <button onClick={
                        () => { 
                          let copy = [...수량]
                          copy[index]++
                          setCount(copy)
                        }
                      } >+</button>
                        <button onClick={
                        () => {
                          let copy = [...수량] 
                          copy[index]--
                          setCount(copy)
                        }
                      } >-</button>
                  </div>
              )
          })
        }
      </div>
    )
  }
  