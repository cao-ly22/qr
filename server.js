require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

app.use(express.json({ limit: '25mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/send', async (req, res) => {
  try {
    const { fullName, gender, email, phone, invitationImage, qrImage } = req.body;

    if (!fullName || !gender || !email || !phone) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ họ tên, giới tính, email và số điện thoại.' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Email không hợp lệ.' });
    }

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailHost = process.env.EMAIL_HOST || (emailUser?.endsWith('@gmail.com') ? 'smtp.gmail.com' : undefined);
    const emailPort = Number(process.env.EMAIL_PORT || (emailHost === 'smtp.gmail.com' ? 587 : 587));
    const emailSecure = process.env.EMAIL_SECURE === 'true' || emailPort === 465;
    const emailFrom = process.env.EMAIL_FROM || 'taichinhdfs@gmail.com';

    const missing = [];
    if (!emailUser) missing.push('EMAIL_USER');
    if (!emailPass) missing.push('EMAIL_PASS');
    if (!emailHost) missing.push('EMAIL_HOST');

    if (missing.length > 0) {
      return res.status(500).json({
        error: `SMTP chưa cấu hình. Thiếu biến: ${missing.join(', ')}. Đặt EMAIL_USER, EMAIL_PASS và nếu không dùng Gmail thì thêm EMAIL_HOST. ` +
          `Bạn có thể dùng EMAIL_FROM để gửi từ địa chỉ khác.`
      });
    }

    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailSecure,
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    const info = await transporter.sendMail({
      from: emailFrom,
      to: email,
      subject: 'Thư mời tham dự sự kiện',
      text: generatePlainText(fullName, gender, phone, email),
      html: generateHtml(fullName, gender, phone, email),
      attachments: [
        createAttachment(invitationImage, 'giay_moi.png'),
        createAttachment(qrImage, 'qr_code.png')
      ]
    });

    return res.json({ message: 'Email đã gửi thành công tới ' + email, messageId: info.messageId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Lỗi gửi email: ' + (error.message || error) });
  }
});

function createAttachment(dataUrl, filename) {
  const parts = dataUrl.split(',');
  const meta = parts[0];
  const base64 = parts[1];
  return {
    filename,
    content: Buffer.from(base64, 'base64'),
    contentType: meta.match(/data:(.*);base64/)?.[1] || 'image/png'
  };
}

function generatePlainText(fullName, gender, phone, email) {
  return `Xin chào ${fullName},\n\nCảm ơn bạn đã gửi thông tin. Đây là giấy mời và mã QR đã được tạo cho bạn.\n\nThông tin của bạn:\n- Họ và tên: ${fullName}\n- Giới tính: ${gender}\n- Email: ${email}\n- Số điện thoại: ${phone}\n\nTrân trọng.`;
}

function generateHtml(fullName, gender, phone, email) {
  return `<p>Xin chào <strong>${fullName}</strong>,</p>
    <p>Cảm ơn bạn đã gửi thông tin. Dưới đây là dữ liệu đã nhận:</p>
    <ul>
      <li>Họ và tên: ${fullName}</li>
      <li>Giới tính: ${gender}</li>
      <li>Email: ${email}</li>
      <li>Số điện thoại: ${phone}</li>
    </ul>
    <p>Đính kèm email này có giấy mời và mã QR của bạn.</p>
    <p>Trân trọng,</p>
    <p>Đội ngũ hỗ trợ</p>`;
}

app.listen(port, host, () => {
  console.log(`Ứng dụng đang chạy tại http://localhost:${port}`);
  if (host !== '127.0.0.1' && host !== 'localhost') {
    console.log(`Lắng nghe trên ${host}:${port} (có thể truy cập từ xa nếu mạng và firewall cho phép)`);
  }
});
