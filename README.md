<<<<<<< HEAD

## Nội dung trong workspace
- `server.js` - backend Node.js xử lý form và gửi email bằng `nodemailer`
- `package.json` - khai báo dependencies
- `public/index.html` - giao diện web cho khách hàng
- `public/style.css` - kiểu chữ và layout
- `public/script.js` - xử lý form, tạo ảnh giấy mời và QR code

## Cài đặt và chạy
1. Mở terminal trong thư mục `d:\qr`
2. Chạy:
   - `npm install`
   - `npm start`
3. Mở trình duyệt:
   - `http://localhost:3000`

## Cấu hình email
Để gửi email, cần cấu hình biến môi trường SMTP.
Nếu gửi từ Gmail (`taichinhdfs@gmail.com`), bạn có thể để trống `EMAIL_HOST` và hệ thống sẽ tự dùng `smtp.gmail.com`.

Biến cần thiết:
- `EMAIL_USER` - email gửi đi (ví dụ `taichinhdfs@gmail.com`)
- `EMAIL_PASS` - mật khẩu ứng dụng (App Password)
- `EMAIL_HOST` - máy chủ SMTP (bỏ trống nếu dùng Gmail)
- `EMAIL_PORT` - cổng SMTP (`587` nếu dùng Gmail)
- `EMAIL_FROM` - địa chỉ hiển thị trong mục "From" (mặc định `taichinhdfs@gmail.com`)

Ví dụ tạo `.env`:

```env
EMAIL_USER=taichinhdfs@gmail.com
EMAIL_PASS=your-app-password
#EMAIL_HOST=smtp.gmail.com
#EMAIL_PORT=587
#EMAIL_FROM="TaichinhDFS <taichinhdfs@gmail.com>"
```

Với PowerShell, đặt biến môi trường tạm thời:

```powershell
$env:EMAIL_USER='taichinhdfs@gmail.com'
$env:EMAIL_PASS='your-app-password'
$env:EMAIL_HOST='smtp.gmail.com'
$env:EMAIL_PORT='587'
$env:EMAIL_FROM='TaichinhDFS <taichinhdfs@gmail.com>'
npm install
npm start
```

## Triển khai
- Chạy local: truy cập `http://localhost:3000` trong máy của bạn.
- Khách hàng trong cùng mạng nội bộ (LAN) có thể dùng `http://<IP-máy-chủ>:3000`.
- Khách hàng tỉnh xa cần URL công khai.

Để tạo URL công khai nhanh:
- Dùng `localtunnel`:

```powershell
npm install -g localtunnel
lt --port 3000
```

- Dùng `ngrok`:

```powershell
ngrok http 3000
```

Cả hai sẽ tạo đường dẫn public mà bạn gửi cho khách.

Nếu muốn host chính thức, triển khai lên dịch vụ Node.js như Render, Railway, Vercel hoặc Heroku.

### Render
1. Đẩy mã nguồn lên GitHub.
2. Tạo Web Service mới trên Render.
3. Render sẽ tự nhận `render.yaml` trong thư mục gốc.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Nếu Render không tự tạo biến môi trường, kiểm tra trong phần Settings của service.
7. Thêm Environment Variables vào Render (hoặc dùng dashboard):
   - `EMAIL_USER=taichinhdfs@gmail.com`
   - `EMAIL_PASS=<app-password>`
   - `EMAIL_HOST=smtp.gmail.com`
   - `EMAIL_PORT=587`
   - `EMAIL_FROM=TaichinhDFS <taichinhdfs@gmail.com>`

Tệp cấu hình `render.yaml` đã được tạo trong thư mục `d:\qr`.

## Chức năng
- Thu thập thông tin: `Họ và tên`, `Giới tính`, `Email`, `Số điện thoại`
- Tạo preview giấy mời và QR code ngay trên web
- Gửi email phản hồi với 2 tệp đính kèm

## Lưu ý
- Với Gmail, bạn phải dùng `App Password` (mật khẩu ứng dụng), không dùng mật khẩu đăng nhập Gmail bình thường.
- Gmail yêu cầu bật xác thực 2 bước và tạo App Password tại https://myaccount.google.com/apppasswords.
- Nếu dùng Google Workspace, hãy kiểm tra cài đặt bảo mật tài khoản và quyền truy cập ứng dụng SMTP.
- Nếu lỗi SMTP, kiểm tra lại `EMAIL_USER`, `EMAIL_PASS`, và đảm bảo `EMAIL_HOST`/`EMAIL_PORT` đúng.
