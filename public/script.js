const form = document.getElementById('customerForm');
const statusEl = document.getElementById('status');
const submitButton = form.querySelector('button[type="submit"]');
const invitationCanvas = document.getElementById('invitationCanvas');
const qrCanvas = document.getElementById('qrCanvas');
const invitationCtx = invitationCanvas.getContext('2d');
const qrCtx = qrCanvas.getContext('2d');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('Đang xử lý và gửi email...', false);
  submitButton.disabled = true;

  const fullName = form.fullName.value.trim();
  const gender = form.gender.value;
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();
  const payloadText = `Họ và tên: ${fullName}\nGiới tính: ${gender}\nEmail: ${email}\nSố điện thoại: ${phone}`;

  buildInvitationImage(fullName, gender, email, phone);

  try {
    await buildQrCode(payloadText);
    const invitationImage = invitationCanvas.toDataURL('image/png');
    const qrImage = qrCanvas.toDataURL('image/png');

    const response = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, gender, email, phone, invitationImage, qrImage })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Không gửi được email.');
    }

    setStatus(result.message || 'Email đã gửi thành công!', true);
  } catch (error) {
    setStatus('Lỗi: ' + error.message, false);
  } finally {
    submitButton.disabled = false;
  }
});

function setStatus(message, success) {
  statusEl.textContent = message;
  statusEl.classList.remove('hidden');
  statusEl.style.borderColor = success ? '#22c55e' : '#cbd5e1';
  statusEl.style.background = success ? '#ecfdf5' : '#f8fafc';
  statusEl.style.color = success ? '#166534' : '#0f172a';
}

function buildInvitationImage(fullName, gender, email, phone) {
  const width = invitationCanvas.width;
  const height = invitationCanvas.height;
  invitationCtx.clearRect(0, 0, width, height);

  invitationCtx.fillStyle = '#1e3a8a';
  invitationCtx.fillRect(0, 0, width, height);

  invitationCtx.fillStyle = '#f8fafc';
  invitationCtx.fillRect(40, 40, width - 80, height - 80);

  invitationCtx.fillStyle = '#0f172a';
  invitationCtx.font = 'bold 42px Inter, Arial, sans-serif';
  invitationCtx.fillText('GIẤY MỜI THAM DỰ', 70, 110);

  invitationCtx.font = '24px Inter, Arial, sans-serif';
  invitationCtx.fillStyle = '#475569';
  invitationCtx.fillText('Xin kính mời:', 70, 170);

  invitationCtx.font = 'bold 32px Inter, Arial, sans-serif';
  invitationCtx.fillStyle = '#0f172a';
  invitationCtx.fillText(fullName || 'Khách hàng thân mến', 70, 220);

  invitationCtx.font = '20px Inter, Arial, sans-serif';
  invitationCtx.fillStyle = '#334155';
  invitationCtx.fillText('Giới tính: ' + gender, 70, 270);
  invitationCtx.fillText('Email: ' + email, 70, 310);
  invitationCtx.fillText('Số điện thoại: ' + phone, 70, 350);

  invitationCtx.fillStyle = '#2563eb';
  invitationCtx.fillText('Sự hiện diện của quý khách là niềm vinh dự đối với chúng tôi!', 70, 430);
}

function buildQrCode(text) {
  qrCtx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
  return QRCode.toCanvas(qrCanvas, text, {
    width: qrCanvas.width - 20,
    margin: 10,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    }
  });
}
