// 🔥 FIX IPv6 → IPv4 (QUAN TRỌNG)
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { appendRow } = require('./googleSheet');

const app = express();
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

app.use(express.json({ limit: '25mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/send', async (req, res) => {
  try {
    const { fullName, gender, email, phone, invitationImage, invitationImageNew } = req.body;

    if (!fullName || !gender || !email || !phone) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin.' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Email không hợp lệ.' });
    }

    // ================= EMAIL CONFIG =================
    const emailUser = process.env.EMAIL_USER;
    const emailFrom = process.env.EMAIL_FROM || emailUser;

    const oauthClientId = process.env.OAUTH_CLIENT_ID;
    const oauthClientSecret = process.env.OAUTH_CLIENT_SECRET;
    const oauthRefreshToken = process.env.OAUTH_REFRESH_TOKEN;

    // ================= GOOGLE SHEETS =================
    const googleSheetId = process.env.GOOGLE_SHEET_ID;
    const googleServiceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let googleServiceAccountPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

    if (googleServiceAccountPrivateKey) {
      googleServiceAccountPrivateKey = googleServiceAccountPrivateKey.replace(/\\n/g, '\n');
    }

    // ================= CHECK ENV =================
    if (
      !emailUser ||
      !oauthClientId ||
      !oauthClientSecret ||
      !oauthRefreshToken ||
      !googleSheetId ||
      !googleServiceAccountEmail ||
      !googleServiceAccountPrivateKey
    ) {
      return res.status(500).json({
        error: 'Thiếu cấu hình ENV. Kiểm tra lại Render Environment.'
      });
    }

    // ================= SAVE TO GOOGLE SHEETS =================
    await appendRow([
      new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      fullName,
      gender,
      email,
      phone
    ]);

    // ================= CREATE OAUTH =================
    const oauth2Client = new google.auth.OAuth2(
      oauthClientId,
      oauthClientSecret,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({ refresh_token: oauthRefreshToken });

    const accessTokenResponse = await oauth2Client.getAccessToken();
    const accessToken = accessTokenResponse?.token || accessTokenResponse;

    if (!accessToken) {
      throw new Error('Không lấy được access token.');
    }

    // ================= TRANSPORTER =================
  const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  family: 4, // 🔥 THÊM DÒNG NÀY (QUAN TRỌNG NHẤT)
  auth: {
    type: 'OAuth2',
    user: emailUser,
    clientId: oauthClientId,
    clientSecret: oauthClientSecret,
    refreshToken: oauthRefreshToken,
    accessToken
  }
});
    // ================= SEND MAIL =================
    const info = await transporter.sendMail({
      from: emailFrom,
      to: email,
      subject: 'Thư mời tham dự sự kiện',
      text: generatePlainText(fullName, gender, phone, email),
      html: generateHtml(fullName, gender, phone, email),
      attachments: [
        createAttachment(invitationImage, 'giay_moi_co_dien.png'),
        createAttachment(invitationImageNew, 'giay_moi_hien_dai.png')
      ]
    });

    return res.json({
      message: 'Email đã gửi thành công tới ' + email,
      messageId: info.messageId
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Lỗi gửi email: ' + (error.message || error)
    });
  }
});

// ================= HELPER =================

function createAttachment(dataUrl, filename) {
  const parts = dataUrl.split(',');
  return {
    filename,
    content: Buffer.from(parts[1], 'base64'),
    contentType: parts[0].match(/data:(.*);base64/)?.[1] || 'image/png'
  };
}

function generatePlainText(fullName, gender, phone, email) {
  return `Xin chào ${fullName},

Cảm ơn bạn đã đăng ký.

Thông tin:
- Họ tên: ${fullName}
- Giới tính: ${gender}
- Email: ${email}
- SĐT: ${phone}

Trân trọng.`;
}

function generateHtml(fullName, gender, phone, email) {
  return `
  <p>Xin chào <strong>${fullName}</strong>,</p>
  <p>Cảm ơn bạn đã đăng ký. Thông tin của bạn:</p>
  <ul>
    <li>Họ tên: ${fullName}</li>
    <li>Giới tính: ${gender}</li>
    <li>Email: ${email}</li>
    <li>SĐT: ${phone}</li>
  </ul>
  <p>Trân trọng.</p>
  `;
}

// ================= START SERVER =================
app.listen(port, host, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});
