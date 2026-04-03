require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const { appendRow } = require('./googleSheet');

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

    const emailUser = process.env.EMAIL_USER || 'taichinhdfs@gmail.com';
    const emailPass = process.env.EMAIL_PASS;
    const emailHost = process.env.EMAIL_HOST || (emailUser?.endsWith('@gmail.com') ? 'smtp.gmail.com' : undefined);
    const emailPort = Number(process.env.EMAIL_PORT || (emailHost === 'smtp.gmail.com' ? 587 : 587));
    const emailSecure = process.env.EMAIL_SECURE === 'true' || emailPort === 465;
    const emailFrom = process.env.EMAIL_FROM || emailUser;

    const oauthClientId = process.env.OAUTH_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const oauthClientSecret = process.env.OAUTH_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
    const oauthRefreshToken = process.env.OAUTH_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN;
    const oauthRedirectUri = process.env.OAUTH_REDIRECT_URI || 'https://developers.google.com/oauthplayground';
    const useOAuth2 = Boolean(oauthClientId && oauthClientSecret && oauthRefreshToken);

    const googleSheetId = process.env.GOOGLE_SHEET_ID;
    const googleServiceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let googleServiceAccountPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    if (googleServiceAccountPrivateKey) {
      googleServiceAccountPrivateKey = googleServiceAccountPrivateKey.replace(/\\n/g, '\n');
    }

    const missing = [];
    if (!emailUser) missing.push('EMAIL_USER');

    if (useOAuth2) {
      if (!oauthClientId) missing.push('OAUTH_CLIENT_ID');
      if (!oauthClientSecret) missing.push('OAUTH_CLIENT_SECRET');
      if (!oauthRefreshToken) missing.push('OAUTH_REFRESH_TOKEN');
    } else {
      if (!emailPass) missing.push('EMAIL_PASS');
      if (!emailHost) missing.push('EMAIL_HOST');
    }

    if (!googleSheetId || !googleServiceAccountEmail || !googleServiceAccountPrivateKey) {
      missing.push('GOOGLE_SHEET_ID/GOOGLE_SERVICE_ACCOUNT_EMAIL/GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');
    }

    if (missing.length > 0) {
      return res.status(500).json({
        error: `SMTP/OAuth2/Google Sheets chưa cấu hình. Thiếu biến: ${missing.join(', ')}. ` +
          `Vui lòng cấu hình EMAIL_USER + xác thực SMTP hoặc OAuth2, và GOOGLE_SHEET_ID + GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY cho Google Sheets.`
      });
    }

    // Lưu dữ liệu đơn hàng vào Google Sheets trước khi gửi email
    await appendRow([new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }), fullName, gender, email, phone]);

    let transporter;
    if (useOAuth2) {
      const oauth2Client = new google.auth.OAuth2(oauthClientId, oauthClientSecret, oauthRedirectUri);
      oauth2Client.setCredentials({ refresh_token: oauthRefreshToken });
      const accessTokenResponse = await oauth2Client.getAccessToken();
      const accessToken = accessTokenResponse?.token || accessTokenResponse;
      if (!accessToken) {
        throw new Error('Không lấy được access token OAuth2.');
      }

      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: emailUser,
          clientId: oauthClientId,
          clientSecret: oauthClientSecret,
          refreshToken: oauthRefreshToken,
          accessToken
        }
      });
    } else {
      transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailSecure,
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });
    }

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
