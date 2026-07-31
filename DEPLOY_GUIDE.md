# 🚀 Hướng dẫn Deploy SAH-TECH Drone Logistics lên Public miễn phí

## Kiến trúc tổng thể

```
┌─────────────────────────────┐      ┌──────────────────────────────┐
│   Giao diện người dùng      │      │   SAH Dashboard (Staff)      │
│   Render.com (Static Site)  │      │   Render.com (Static Site)   │
│   https://sah-user.onrender.com │  │   https://sah-dash.onrender.com │
└──────────┬──────────────────┘      └──────────┬───────────────────┘
           │                                    │
           └──────────┬─────────────────────────┘
                      │ REST API + WebSocket
                      ▼
           ┌─────────────────────────┐
           │   Backend Server        │
           │   Render.com (Web)      │
           │   https://sah-api.onrender.com │
           │   + MongoDB Atlas Free  │
           └─────────────────────────┘
```

## 📋 Chuẩn bị tài khoản (miễn phí)

| Dịch vụ | Link | Mục đích |
|---------|------|----------|
| **Render.com** | https://render.com | Host backend + 2 frontend |
| **MongoDB Atlas** | https://www.mongodb.com/atlas | Database miễn phí 512MB |

---

## Bước 1: Tạo Database MongoDB Atlas Free

### 1.1 Đăng ký MongoDB Atlas
1. Vào https://www.mongodb.com/cloud/atlas/register
2. Đăng ký bằng Google hoặc email
3. Chọn **M0 Sandbox (Free)** cluster

### 1.2 Tạo Cluster
1. Click **"Create"** → chọn **M0 Sandbox** (Free forever)
2. Chọn Cloud Provider: **AWS** (hoặc GCP/Azure)
3. Chọn Region: **Singapore** (gần Việt Nam nhất, ping thấp)
4. Click **"Create Cluster"** (mất 2-3 phút)

### 1.3 Cấu hình Database Access
1. Trong tab **Database Access** → **"Add New Database User"**
2. Username: `sah_admin`
3. Password: `SAHTech2024!` (hoặc tự tạo, **nhớ lưu lại**)
4. Role: `Read and Write to Any Database`
5. Click **"Add User"**

### 1.4 Cấu hình Network Access
1. Trong tab **Network Access** → **"Add IP Address"**
2. Chọn **"Allow Access from Anywhere"** (0.0.0.0/0)
3. Click **"Confirm"**

### 1.5 Lấy Connection String
1. Trong cluster, click **"Connect"** → **"Connect your application"**
2. Copy connection string:
   ```
   mongodb+srv://sah_admin:<password>@cluster0.xxxxx.mongodb.net/sah_tech?retryWrites=true&w=majority
   ```
   Thay `<password>` bằng mật khẩu bạn đã tạo.

---

## Bước 2: Deploy Backend lên Render.com

### 2.1 Đăng ký Render
1. Vào https://dashboard.render.com/register
2. Đăng ký bằng GitHub (dễ nhất, kết nối kho chứa code)

### 2.2 Tạo Backend Web Service
1. Click **"New +"** → **"Web Service"**
2. **Connect repository**: Chọn `TS205312/Demo-dashboard-1`
3. Cấu hình:
   ```
   Name: sah-tech-backend
   Environment: Node
   Region: Singapore
   Branch: master
   Build Command: cd backend && npm install
   Start Command: cd backend && node server.js
   Plan: Free
   ```

4. **Thêm Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | `mongodb+srv://sah_admin:SAHTech2024!@cluster0.xxxxx.mongodb.net/sah_tech?retryWrites=true&w=majority` (thay bằng link của bạn) |
   | `NODE_VERSION` | `22` |
   | `CORS_ORIGINS` | `https://sah-user.onrender.com,https://sah-dash.onrender.com` |

5. Click **"Create Web Service"** (mất 5-10 phút build lần đầu)

### 2.3 Lưu URL Backend
Sau khi deploy xong, Render sẽ cho URL dạng:
```
https://sah-tech-backend.onrender.com
```
**📝 Ghi lại URL này**, cần dùng ở bước 3 và 4.

---

## Bước 3: Deploy "Giao diện người dùng" lên Render

### 3.1 Tạo Static Site
1. Click **"New +"** → **"Static Site"**
2. **Connect repository**: Chọn `TS205312/Demo-dashboard-1`
3. Cấu hình:
   ```
   Name: sah-user
   Root Directory: Giao dien nguoi dung
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

4. **Thêm Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://sah-tech-backend.onrender.com/api` (URL backend + /api) |
   | `VITE_WS_URL` | `wss://sah-tech-backend.onrender.com/ws` (URL backend + /ws) |

5. **Auto-Deploy**: Chọn `Yes`
6. Click **"Create Static Site"**

### 3.2 Chờ deploy
Render sẽ build và deploy. Sau khi hoàn tất, bạn có URL:
```
https://sah-user.onrender.com
```

---

## Bước 4: Deploy "SAH Dashboard" lên Render

### 4.1 Tạo Static Site thứ 2
1. Click **"New +"** → **"Static Site"**
2. **Connect repository**: Chọn `TS205312/Demo-dashboard-1`
3. Cấu hình:
   ```
   Name: sah-dash
   Root Directory: SAH Dashboard
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

4. **Thêm Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://sah-tech-backend.onrender.com/api` (URL backend + /api) |
   | `VITE_WS_URL` | `wss://sah-tech-backend.onrender.com/ws` (URL backend + /ws) |

5. **Auto-Deploy**: Chọn `Yes`  
6. Click **"Create Static Site"**

### 4.2 Chờ deploy xong
Sau khi hoàn tất, URL Dashboard:
```
https://sah-dash.onrender.com
```

---

## Bước 5: Cập nhật CORS cho Backend

Sau khi có URL của 2 Frontend, cập nhật biến môi trường cho Backend:

1. Vào Render Dashboard → Backend Service → **Environment**
2. Sửa **CORS_ORIGINS** thành:
   ```
   https://sah-user.onrender.com,https://sah-dash.onrender.com
   ```
3. Click **"Save Changes"** và chờ service restart

---

## ✅ Kết quả sau khi deploy

| URL | Mô tả |
|-----|-------|
| **https://sah-tech-backend.onrender.com** | Backend API + WebSocket |
| **https://sah-tech-backend.onrender.com/api/health** | Health check |
| **https://sah-tech-backend.onrender.com/ws** | WebSocket |
| **https://sah-user.onrender.com** | Giao diện đặt hàng (User) |
| **https://sah-dash.onrender.com** | SAH Dashboard (Staff) |

---

## 🛠️ Cập nhật code mới

1. Code mới push lên GitHub
2. Render **tự động build lại** (auto-deploy)
3. Mất 2-3 phút để deploy xong

---

## 💰 Chi phí: HOÀN TOÀN MIỄN PHÍ

| Dịch vụ | Giới hạn Free |
|---------|---------------|
| **Render Web Service** | 750 giờ/tháng (1 service chạy 24/7 = ~720 giờ) |
| **Render Static Sites** | Không giới hạn số lượng |
| **MongoDB Atlas M0** | 512MB storage, miễn phí vĩnh viễn |
| **Domain .onrender.com** | Miễn phí, SSL tự động |

> **Lưu ý**: Render free tier sẽ sleep (tắt) service sau 15 phút không hoạt động. Khi có request mới, nó sẽ wake up mất 10-15 giây. Nếu muốn chạy 24/7 không sleep thì cần nâng cấp lên $7/tháng.

---

## 🔄 Chạy 24/7 miễn phí (Giữ backend không bao giờ sleep)

> **Vấn đề**: Render free tier sẽ **sleep** (tắt) backend sau **15 phút** không có request.
> Khi có request mới, service wake up mất **10-60 giây** (WebSocket bị ngắt).
> Static Sites (2 frontend) **không bị sleep** — chỉ backend Web Service bị ảnh hưởng.

### ✅ Giải pháp 1: Dùng Uptime Robot ping giữ backend thức (Khuyến nghị — miễn phí 100%)

**Bước 1: Tạo tài khoản UptimeRobot**
1. Vào https://uptimerobot.com → **Sign Up Free**
2. Đăng ký bằng Google/email (free 50 monitors)

**Bước 2: Tạo Monitor ping backend**
1. Click **"Add New Monitor"**
2. Cấu hình:
   ```
   Monitor Type: HTTP(S)
   Friendly Name: SAH-TECH Backend Keep-Alive
   URL (or IP): https://sah-tech-backend.onrender.com/api/health
   Monitoring Interval: 5 minutes  ← QUAN TRỌNG: phải ≤ 10 phút
   ```
3. Click **"Create Monitor"**

> Vì monitor ping mỗi 5 phút (< 15 phút timeout), backend **không bao giờ sleep** → chạy 24/7.
> Render free 750 giờ/tháng ≈ 720 giờ (30 ngày × 24h) → **vẫn trong giới hạn free!**

### ✅ Giải pháp 2: Dùng cron-job.org (Miễn phí, không cần đăng ký phức tạp)
1. Vào https://cron-job.org → **Sign Up**
2. Tạo cron job:
   - **URL**: `https://sah-tech-backend.onrender.com/api/health`
   - **Interval**: Every 5 minutes
3. Bật cron job → backend luôn thức

### ✅ Giải pháp 3: Oracle Cloud Always Free (Server 24/7 thật sự)

Nếu muốn backend chạy **24/7 hoàn toàn không cần ping**:

1. Đăng ký https://www.oracle.com/cloud/free/ (cần thẻ tín dụng để xác minh, **không bị trừ tiền**)
2. Tạo **Always Free VM**:
   - Instance: `VM.Standard.E1.1.Micro` (1 OCPU, 1GB RAM) hoặc `Ampere A1` (4 OCPU, 24GB)
   - OS: Ubuntu 22.04 LTS
3. SSH vào VM và cài đặt:
   ```bash
   # Cài Node.js 22
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt install -y nodejs git

   # Clone repo
   git clone https://github.com/TS205312/Demo-dashboard-1.git
   cd Demo-dashboard-1/backend
   npm install

   # Tạo systemd service chạy nền 24/7
   sudo tee /etc/systemd/system/sah-backend.service << 'EOF'
   [Unit]
   Description=SAH-TECH Backend
   After=network.target

   [Service]
   WorkingDirectory=/root/Demo-dashboard-1/backend
   ExecStart=/usr/bin/node server.js
   Restart=always
   Environment=MONGODB_URI=mongodb+srv://sah_admin:YOUR_PASS@cluster.mongodb.net/sah_tech
   Environment=CORS_ORIGINS=https://sah-user.onrender.com,https://sah-dash.onrender.com

   [Install]
   WantedBy=multi-user.target
   EOF

   sudo systemctl enable sah-backend
   sudo systemctl start sah-backend
   ```
4. Mở port 3001 trong Oracle Security List
5. URL backend: `http://<PUBLIC_IP>:3001`
6. Cập nhật `VITE_API_URL` và `VITE_WS_URL` trong 2 Static Sites trên Render
   → Cập nhật `CORS_ORIGINS` để include `http://<PUBLIC_IP>:3001`

> Oracle Always Free: **1 VM E1.1.Micro (1GB RAM) miễn phí vĩnh viễn** + 10GB block storage.
> Đủ chạy backend Express + MongoDB in-memory.

---

## ⚠️ Xử lý lỗi thường gặp

### 1. Lỗi "MongoDB connection refused"
- Kiểm tra lại Network Access trong MongoDB Atlas: phải là `0.0.0.0/0`
- Kiểm tra User/password đúng
- Kiểm tra `MONGODB_URI` trong Render dashboard

### 2. Lỗi CORS
- Đảm bảo `CORS_ORIGINS` trong Backend đúng URL của 2 frontend
- Không có dấu cách sau dấu phẩy
- Frontend dùng `https://` (không phải `http://`)

### 3. Trang trắng (blank page)
- Kiểm tra **Publish Directory** trong Static Site config
- Với project này: `dist`
- Vào **Logs** trong Render để xem lỗi build

---
