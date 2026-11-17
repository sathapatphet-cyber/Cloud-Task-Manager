Cloud Task Manager
ระบบจัดการรายการงานออนไลน์ด้วย AWS Cloud
รายวิชา: CS446 / IT332 – Cloud Computing
ระดับโปรเจกต์: Level 3 (Full-stack / CRUD)
รายละเอียดโปรเจกต์
Cloud Task Manager เป็นเว็บไซต์สำหรับจัดการรายการงานออนไลน์ ผู้ใช้สามารถเพิ่ม ดู แก้ไข เปลี่ยนสถานะ และลบรายการงานได้ โดยใช้บริการ AWS ในการทำงานและจัดเก็บข้อมูล
AWS Services ที่ใช้
Amazon S3 – จัดเก็บและแสดงหน้าเว็บไซต์
Amazon API Gateway – รับคำขอจากเว็บไซต์
AWS Lambda – ประมวลผลคำสั่งด้วย Python
Amazon DynamoDB – จัดเก็บข้อมูลรายการงาน
การทำงานของระบบ
ผู้ใช้ → S3 Website → API Gateway → Lambda → DynamoDB
ขั้นตอนติดตั้ง
สร้าง DynamoDB Table ชื่อ Tasks โดยใช้ taskId (String) เป็น Partition Key
สร้าง Lambda ชื่อ TaskManagerFunction ด้วย Python 3.12 และใช้โค้ดจาก lambda_function.py
ตั้งค่า Environment Variable TABLE_NAME=Tasks และกำหนดสิทธิ์ Lambda ให้เข้าถึง DynamoDB
สร้าง HTTP API ใน API Gateway และเชื่อมกับ Lambda โดยกำหนด Routes:
GET /tasks
POST /tasks
PUT /tasks/{taskId}
DELETE /tasks/{taskId}
ตั้งค่า CORS และเปิด Auto-deploy สำหรับ $default
สร้าง S3 Bucket และอัปโหลด index.html, style.css, script.js
แก้ API_BASE ใน script.js ให้ตรงกับ Invoke URL ของ API Gateway
เปิด Static Website Hosting และกำหนดสิทธิ์อ่านไฟล์เว็บไซต์
เปิดเว็บไซต์และทดสอบการทำงาน
ฟังก์ชัน
เพิ่มรายการงาน (Create)
แสดงรายการงาน (Read)
แก้ไขรายการงาน (Update)
เปลี่ยนสถานะงาน (Pending / Completed)
ลบรายการงาน (Delete)
เว็บไซต์
http://cloud-task-manager-bj.s3-website-us-east-1.amazonaws.com
หมายเหตุ
โปรเจกต์นี้เป็นระบบสาธิตสำหรับการศึกษา ไม่มีระบบล็อกอิน ไม่ควรใช้เก็บข้อมูลส่วนตัวหรือข้อมูลสำคัญ
