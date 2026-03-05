# 🗂️ ระบบจัดการงานที่ต้องทำ (Task/Project Board)

> ระบบจัดการงานที่ต้องทำ (Task/Project Board) เป็นเว็บแอปพลิเคชันที่ช่วยให้ผู้ใช้สามารถสร้าง จัดการ และติดตามสถานะของงานได้อย่างเป็นระบบ โดยใช้รูปแบบกระดานงาน (Task Board) เช่น To Do, In Progress, และ Done เพื่อเพิ่มประสิทธิภาพในการทำงานและจัดลำดับความสำคัญของงาน ✨

## 🧠 ภาพรวมโปรเจกต์

ระบบนี้ช่วยให้ผู้ใช้สามารถ:
- จัดระเบียบงานส่วนตัวอย่างเป็นระบบ
- ติดตามความคืบหน้าของงานผ่านบอร์ดแบบ Kanban
- ลากวาง (Drag & Drop) เพื่อเปลี่ยนสถานะงานได้แบบ Real-time
- ค้นหาและจัดการงานได้สะดวก
- ดูงานในรูปแบบปฏิทินรายวัน/รายเดือน
- ใช้งานได้ทั้ง Light Mode และ Dark Mode

---

## ✨ ความสามารถของระบบ (Features)

- 🔐 ระบบ Authentication (เข้าใช้งานแบบผู้ใช้คนเดียว)
- 📊 Dashboard
    - แสดงจำนวนงานแยกตามสถานะ
    - แสดงงานใกล้ครบกำหนด
    - แสดงปฏิทินเพื่อดูงานในแต่ละวัน
- 📝 เพิ่ม / แก้ไข / จัดเก็บ งาน (Task)
- 📌 แบ่งสถานะงานเป็น:
    - To Do
    - In Progress
    - Done
- 🖱️ รองรับ Drag & Drop
- 🔍 ระบบค้นหา Task
- 📅 เมนูดูปฏิทิน (Calendar View)
    - แสดงงานตามวันที่กำหนด (Due Date)
    - คลิกวันที่เพื่อดูรายการงาน
- 🌙 Dark Mode

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
**Frontend**
- Next.js (App Router)
- React
- TailwindCSS
- shadcn/ui
- @dnd-kit (Drag & Drop)  

**Backend**
- Next.js API Routes
- Prisma ORM
- Supabase (PostgreSQL)

**Deployment**
- Vercel

**Authentication**
- NextAuth.js

---

## ⚙️ Installation
```bash
git clone https://github.com/username/project-name.git
cd project-name
npm install

## 👥 สมาชิก
1. 67021130 ภัทรพล รัชนิกรเพ็ญ
2. 67021309 สลิลทิพย์ ดอกนางแย้ม
3. 67026113 ละอองดาว ทาลาว