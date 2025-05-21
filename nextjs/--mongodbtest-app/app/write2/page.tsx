import { connectDB } from "@/util/database";
import { revalidatePath } from "next/cache";
import { getData, handleSubmit } from "./server";

//1. 페이지만들었음
export default async function Write2() {
    
    let result = await getData()
    //2.폼만들었음
    return (
      <form action={handleSubmit}> 
        <input type="text" name="title" />
        <button type="submit">Submit</button>
        {
            
            result.map((item, index) => {
                return <div key={index}>글제목 : {item.title}</div>
            })
        }
      </form>
    );
  } 