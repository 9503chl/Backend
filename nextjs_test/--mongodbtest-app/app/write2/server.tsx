'use server'

import { connectDB } from '@/util/database'
import { revalidatePath } from 'next/cache'

async function getData() {
  let db = (await connectDB).db('forum')
  let result = await db.collection('post').find().toArray()
  return result
}

//3. 서버기능만들었음 
async function handleSubmit(formData: FormData) {
 
  let db = (await connectDB).db('forum')
  await db.collection('post').insertOne({title : formData.get('title')})
  revalidatePath('/list')
}

export { getData, handleSubmit }