# 📱 Hướng Dẫn Chạy Demo MVP — Fitness Battle

> Dành cho thành viên **không chuyên IT**. Chỉ cần làm theo từng bước.

---

## 🔧 Bước 1: Cài đặt phần mềm cần thiết

### 1.1. Cài Node.js (nếu chưa có)

1. Mở trình duyệt (Chrome / Edge / Firefox)
2. Truy cập: **https://nodejs.org**
3. Nhấn nút **LTS** (màu xanh lớn) để tải về
4. Sau khi tải xong → **nháy đúp** vào file vừa tải
5. Cứ nhấn **Next → Next → Install** (không cần thay đổi gì)
6. Đợi cài xong → nhấn **Finish**

### 1.2. Kiểm tra đã cài đúng

1. Nhấn phím **`Windows + R`** (phím Windows + phím R cùng lúc)
2. Gõ: `cmd` → nhấn **Enter**
3. Trong cửa sổ đen, gõ:

```
node -v
```

4. Nhấn **Enter**
5. Nếu hiện dòng dạng `v20.x.x` hoặc `v22.x.x` → **đã cài thành công!**
6. Gõ tiếp:

```
npm -v
```

7. Nhấn **Enter** → nếu hiện số dạng `10.x.x` hoặc `11.x.x` → **OK!**

---

## 📂 Bước 2: Mở project trên máy

### 2.1. Tải project về (nếu chưa có)

Liên hệ người quản lý để nhận folder **"Demo MVP"**.

### 2.2. Mở project bằng VS Code

1. Mở **VS Code** (Visual Studio Code)
2. Nhấn **File** → **Open Folder**
3. Tìm và chọn folder **"Demo MVP"** → nhấn **Select Folder**
4. Chờ VS Code tải xong (vài giây)

---

## ▶️ Bước 3: Chạy Demo

### 3.1. Mở Terminal trong VS Code

Trong VS Code, nhấn tổ hợp phím:

**`Ctrl + Shift + `** (phím Ctrl + Shift + dấu `)

*(Dấu ` nằm ở góc trái bàn phím, trên phím Tab)*

Một cửa sổ terminal màu đen sẽ xuất hiện ở dưới cùng VS Code.

### 3.2. Cài đặt thư viện (chỉ làm 1 lần đầu tiên)

Trong terminal, gõ:

```
npm install
```

Nhấn **Enter** và đợi... (khoảng 1-2 phút). Khi thấy dòng chữ kết thúc bằng số packages → **xong!**

### 3.3. Chạy Demo

```
npm run dev
```

Nhấn **Enter** → đợi khoảng **5-10 giây**.

Khi thấy dòng màu xanh:

```
VITE ready in xxx ms
➜ Local: http://localhost:5173/
```

### 3.4. Mở trên trình duyệt

1. **Nhấn giữ phím Ctrl** rồi **click chuột trái** vào link:
   `http://localhost:5173/`
2. Hoặc copy link, mở Chrome/Edge, dán vào thanh địa chỉ, nhấn **Enter**

**→ Demo đang chạy!**

---

## 🚀 Luồng sử dụng Demo

### Bước 1: Màn hình Chào mừng (Welcome Screen)
Khi mở app lần đầu, bạn sẽ thấy màn hình chào mừng với:
- Logo **Fitness Battle**
- 3 tính năng chính: Battle 1v1, AI Coach, Bảng Xếp Hạng
- Nhấn **"Tạo tài khoản mới"** (hoặc **"Đăng nhập"** nếu đã có tài khoản)

### Bước 2: Đăng ký tài khoản
- Nhập **Tên chiến binh** (VD: Minh Đạt)
- Nhập **Email** (VD: minh.dat@email.com)
- Nhập **Mật khẩu** (ít nhất 6 ký tự)
- Nhấn **Tiếp tục**

### Bước 3: Chọn Avatar
- Chọn 1 trong 6 avatar có sẵn
- Nhấn **"Vào Đấu Trường"**
- → Sau khi đăng ký, app sẽ hiển thị **Trang chủ** với tên của bạn phía trên

### Bước 4: Trang Chủ — Nơi mọi thứ bắt đầu
Sau khi đăng nhập thành công, Trang chủ sẽ hiển thị:
- **Chào buổi [sáng/chiều/tối] + Tên của bạn** (dynamic theo giờ)
- Level, điểm, XP bar
- Banner "Bắt đầu thi đấu 1v1"

| Tab | Icon | Mô tả |
|-----|------|-------|
| **Trang chủ** | 🏠 | Tổng quan: streak, Battle Pass, bài tập, bạn bè, feed |
| **Battle Pass** | ⚡ | **TÍNH NĂNG TRẢ PHÍ** — 30 cấp, nhận Skin & Voucher |
| **Battle** | ⚔️ | Tìm trận, xem trận đang đấu, Quick Match |
| **Xếp hạng** | 📊 | Bảng xếp hạng toàn server |
| **Hồ sơ** | 👤 | Thông tin cá nhân, badges, thống kê |

---

## ⚔️ Luồng Demo Battle 1v1 (Kết quả trận đấu)

### Bước 1: Vào tab Battle (⚔️)
1. Chọn **bài tập** (Gym, Chạy bộ, HIIT, Đạp xe)
2. Chọn **đối thủ** (Minh Đạt Rank #1, Thu Hà Rank #2, Hoàng Nam Rank #12)
3. Nhấn **"THÁCH ĐẤU [TÊN] — 60 GIÂY"**

### Bước 2: Màn hình thi đấu (Battle Arena)
4. Kiểm tra **GPS & Micro** (đều xanh ✓)
5. Nhấn **"BẮT ĐẦU — 60 GIÂY"**

### Bước 3: 60 giây thi đấu
- Điểm của bạn và đối thủ tăng liên tục theo thời gian thực
- **Anti-Cheat AI** theo dõi GPS & Micro trong suốt trận đấu
- Ở giây thứ 15: hệ thống sẽ kiểm tra bất thường:
  - **30% khả năng**: Đối thủ bị phát hiện gian lận → Bạn thắng ngay!
  - **15% khả năng**: Bạn bị phát hiện gian lận → Trận bị hủy
  - **55% khả năng**: Không phát hiện bất thường → Trận tiếp tục đến hết 60s

### Bước 4: Màn hình Kết Quả Battle (BattleResult)
Sau khi trận kết thúc, màn hình kết quả hiển thị:

#### 🎉 Trường hợp THẮNG:
- Icon 🏆 + "Chiến thắng!"
- Điểm của bạn vs Điểm đối thủ
- **+XP** (animation đếm lên: điểm × 1.5)
- **+Điểm** (animation đếm lên: điểm × 2)
- **+Streak** 🔥 (tăng 1 ngày liên tiếp)
- **W-L** record cập nhật

#### 😤 Trường hợp THUA:
- Icon 😤 + "Thua trận"
- Điểm của bạn vs Điểm đối thủ
- **+XP** ít hơn (điểm × 0.5)
- **+Điểm** ít hơn (điểm × 0.3)
- **-Streak** (giảm 1-2 ngày)
- **W-L** record cập nhật

#### 🚫 Trường hợp GIAN LẬN:
- Icon 🚫 + "Gian lận bị phát hiện!"
- GPS không khớp Micro → Trận bị hủy
- **Không có XP/điểm**, streak không đổi
- Cảnh báo: Gian lận nhiều lần sẽ bị khóa tài khoản

### Bước 5: Sau khi xem kết quả
- Nhấn **"Đấu Lại"** → quay về màn hình chọn đối thủ
- Nhấn **"Về Trang Chủ"** → quay về Trang chủ, dữ liệu (XP, điểm, streak, W-L) đã được cập nhật

### Bước 6: Kiểm tra dữ liệu đã cập nhật
Sau khi về Trang chủ:
- **XP Bar** đã tăng theo kết quả trận đấu
- **Streak** đã thay đổi
- Vào **Hồ sơ (👤)** → kiểm tra W/L record và Level đã cập nhật

---

## 🔄 Luồng Đăng nhập lại
1. Vào **Hồ sơ** → nhấn **Đăng xuất**
2. App quay về màn hình Welcome
3. Nhấn **"Đăng nhập"** → nhập email & password đã đăng ký
4. → Vào lại Trang chủ với đầy đủ dữ liệu (tên, avatar, XP, streak, W/L)

---

## ⭐ Tính năng "bán được tiền" — Điểm nóng của Demo

### 1. Battle Pass (Tab ⚡)
Đây là tính năng mà nhóm muốn các bạn **tập trung trải nghiệm** nhất:

- **Track Free** (miễn phí): XP và Coins
- **Track Premium** (29.000đ/mùa): Ruby, Skin (Khung Neon, Rồng Lửa), Voucher từ nhãn hàng (Phúc Long, Shopee, Tiki), Hiệu ứng Pháo Hoa
- **Suất VIP giới hạn**: Chỉ 300 suất/mùa — thấy hết chỗ là phải mua ngay

### 2. Ruby Currency (💎)
- Hiển thị ở góc phải header
- Dùng để vào **Đấu Trường Titan** (20 Ruby), **Giải Đua Sức Bền** (10 Ruby), **Trận Cược Ruby** (5 Ruby)
- Thắng trận nhận Ruby, thua mất Ruby

### 3. Đấu Trường Premium (Tab ⚡ → Đấu Trường)
- **Đấu Trường Titan**: Vào cổng 20 Ruby, giải thưởng lên đến 1000 Ruby + quà vật lý
- **Giải Đua Sức Bền**: 5 vòng thi đấu liên tiếp
- **Trận Cược Ruby**: 5 Ruby vào → thắng 8 Ruby

### 4. Anti-Cheat
- GPS và Micro chỉ bật **trong thời gian trận đấu**
- Vị trí luôn được **làm mờ** — không ai theo dõi ai

---

## 🔄 Bước 4: Chạy lại lần sau

Khi muốn mở lại Demo:

1. Mở **VS Code** → **File** → **Open Folder** → chọn folder **"Demo MVP"**
2. Nhấn **`Ctrl + Shift + `**
3. Gõ `npm run dev` → nhấn **Enter**
4. Mở trình duyệt → truy cập `http://localhost:5173/`

> **Lưu ý:** Không cần chạy `npm install` lần sau — chỉ cần làm lần đầu tiên.

> **Lưu ý:** Nếu đã hoàn thành màn hình chào mừng trước đó, app sẽ nhảy thẳng vào Trang chủ. Để xem lại màn hình chào, xóa dữ liệu trình duyệt hoặc dùng chế độ ẩn danh.

---

## ❓ Nếu gặp lỗi

### Lỗi: "npm is not recognized"

→ Quay lại **Bước 1** và cài lại Node.js. Tắt VS Code và mở lại sau khi cài xong.

### Lỗi: "port 5173 is already in use"

Có người khác đang chạy Demo. Hoặc lần trước chưa tắt đúng cách.

**Cách khắc phục:**
1. Tắt cửa sổ VS Code
2. Nhấn **`Ctrl + Shift + Esc`** để mở Task Manager
3. Tìm mục **"Node.js"** → nhấn **End Task**
4. Mở lại VS Code và chạy `npm run dev`

### Lỗi: Màn hình trắng / lỗi

1. Tắt trình duyệt → mở lại
2. Hoặc nhấn **`Ctrl + Shift + R`** (hard refresh)

### Lỗi: "Cannot find module"

Quay lại terminal, gõ lại:

```
npm install
```

Nhấn **Enter** → chờ xong → gõ lại `npm run dev`

---

## 👥 Liên hệ hỗ trợ

Nếu gặp lỗi không giải quyết được, hãy chụp ảnh màn hình terminal (cửa sổ đen) và gửi cho người phụ trách kỹ thuật.

---

**Chúc các bạn trải nghiệm vui vẻ! ⚔️🔥**
