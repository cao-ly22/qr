# Web đăng ký khách hàng + email phản hồi

Ứng dụng này cho phép bạn gửi link form cho khách hàng tỉnh xa và tự động gửi email phản hồi kèm:
- giấy mời
- mã QR mã hóa thông tin khách hàng

## Nội dung trong workspace
- `server.js` - backend Node.js xử lý form và gửi email bằng `nodemailer`
- `package.json` - khai báo dependencies
- `public/index.html` - giao diện web cho khách hàng
- `public/style.css` - kiểu chữ và layout
- `public/script.js` - xử lý form, tạo ảnh giấy mời và QR code
- `render.yaml` - cấu hình deploy lên Render

## Cài đặt và chạy
1. Mở terminal trong thư mục `d:\qr`
2. Chạy:
   - `npm install`
   - `npm start`
3. Mở trình duyệt:
   - `http://localhost:3000`

## Cấu hình email
Ứng dụng hỗ trợ hai cách gửi email:

### 1. Gmail OAuth2 (khuyến nghị)
Đây là cách an toàn nhất khi dùng tài khoản Gmail.
Cần cấu hình biến môi trường:
- `EMAIL_USER` - email gửi đi (ví dụ `taichinhdfs@gmail.com`)
- `OAUTH_CLIENT_ID` - Client ID từ Google Cloud
- `OAUTH_CLIENT_SECRET` - Client Secret từ Google Cloud
- `OAUTH_REFRESH_TOKEN` - Refresh token OAuth2
- `OAUTH_REDIRECT_URI` - tùy chọn, mặc định sử dụng `https://developers.google.com/oauthplayground`
- `EMAIL_FROM` - địa chỉ hiển thị trong mục "From" (mặc định `taichinhdfs@gmail.com`)

Ví dụ `.env`:

```env
EMAIL_USER=taichinhdfs@gmail.com
OAUTH_CLIENT_ID=xxxxxx.apps.googleusercontent.com
OAUTH_CLIENT_SECRET=yyyyyy
OAUTH_REFRESH_TOKEN=zzzzzz
#OAUTH_REDIRECT_URI=https://developers.google.com/oauthplayground
EMAIL_FROM="TaichinhDFS <taichinhdfs@gmail.com>"
```

### 2. SMTP truyền thống
Nếu bạn không muốn dùng OAuth2, vẫn có thể dùng SMTP với `EMAIL_PASS`.
Cần cấu hình biến môi trường:
- `EMAIL_USER` - email gửi đi
- `EMAIL_PASS` - mật khẩu ứng dụng hoặc mật khẩu SMTP
- `EMAIL_HOST` - máy chủ SMTP (`smtp.gmail.com` với Gmail)
- `EMAIL_PORT` - cổng SMTP (`587`)
- `EMAIL_FROM` - địa chỉ hiển thị

Ví dụ `.env`:

```env
EMAIL_USER=taichinhdfs@gmail.com
EMAIL_PASS=your-smtp-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_FROM="TaichinhDFS <taichinhdfs@gmail.com>"
```

### Chạy với PowerShell
```powershell
$env:EMAIL_USER='taichinhdfs@gmail.com'
$env:OAUTH_CLIENT_ID='xxxxxx.apps.googleusercontent.com'
$env:OAUTH_CLIENT_SECRET='yyyyyy'
$env:OAUTH_REFRESH_TOKEN='zzzzzz'
$env:EMAIL_FROM='TaichinhDFS <taichinhdfs@gmail.com>'
npm install
npm start
```

## Triển khai
- Chạy local: truy cập `http://localhost:3000`.
- Khách hàng trong cùng mạng nội bộ (LAN) có thể dùng `http://<IP-máy-chủ>:3000`.
- Khách hàng tỉnh xa cần URL công khai.

### Tạo URL public nhanh
- Dùng `localtunnel`:

```powershell
npm install -g localtunnel
lt --port 3000
```

- Dùng `ngrok`:

```powershell
ngrok http 3000
```

Cả hai sẽ tạo đường dẫn public để bạn gửi cho khách.

### Deploy lên Render
1. Đẩy code lên GitHub.
2. Tạo Web Service mới trên Render.
3. Render sẽ tự nhận `render.yaml` trong thư mục gốc.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Thêm Environment Variables như sau:
   - `EMAIL_USER=taichinhdfs@gmail.com`
   - `OAUTH_CLIENT_ID=<client-id>`
   - `OAUTH_CLIENT_SECRET=<client-secret>`
   - `OAUTH_REFRESH_TOKEN=<refresh-token>`
   - `EMAIL_FROM=TaichinhDFS <taichinhdfs@gmail.com>`

Nếu bạn không dùng OAuth2 trên Render, có thể dùng SMTP truyền thống và thêm:
   - `EMAIL_PASS=<smtp-password>`
   - `EMAIL_HOST=smtp.gmail.com`
   - `EMAIL_PORT=587`

## Chức năng
- Thu thập thông tin: `Họ và tên`, `Giới tính`, `Email`, `Số điện thoại`
- Tạo preview giấy mời và QR code ngay trên web
- Gửi email phản hồi với 2 tệp đính kèm

## Lưu ý
- Nếu dùng Gmail OAuth2, bạn không cần App Password.
- Nếu dùng SMTP Gmail, vẫn cần mật khẩu ứng dụng hoặc App Password.
- Gmail yêu cầu bật xác thực 2 bước để tạo App Password.
- Nếu lỗi SMTP/OAuth2, kiểm tra lại các biến môi trường `EMAIL_USER`, `EMAIL_PASS`, `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`, `OAUTH_REFRESH_TOKEN`, `EMAIL_HOST`/`EMAIL_PORT`.


