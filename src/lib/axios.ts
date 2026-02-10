// lib/axios.ts
import axios from 'axios'

export const api = axios.create({
  // baseURL: ไม่ต้องพิมพ์ URL ยาวๆ ทุกครั้ง พิมพ์แค่ '/products' ก็พอ
  baseURL: 'https://backend.codingthailand.com/v2',
  
  // timeout: ถ้ารอเกิน 10 วินาที ให้ตัดการเชื่อมต่อทันที (ป้องกันเว็บค้าง)
  timeout: 10000,
  
  // headers: บอก Server ว่าเราจะคุยกันด้วยรูปแบบ JSON นะ
  headers: {
    'Content-Type': 'application/json',
  },
})