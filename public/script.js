const form = document.getElementById('customerForm');
const statusEl = document.getElementById('status');
const submitButton = form.querySelector('button[type="submit"]');
const invitationCanvas = document.getElementById('invitationCanvas');
const invitationCtx = invitationCanvas.getContext('2d');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('Đang xử lý và gửi email...', false);
  submitButton.disabled = true;

  const fullName = form.fullName.value.trim();
  const gender = form.gender.value;
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();

  await buildInvitationImage(fullName, gender, email, phone);

  try {
    const invitationImage = invitationCanvas.toDataURL('image/png');

    const response = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, gender, email, phone, invitationImage })
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

  const template = new Image();
  template.crossOrigin = 'anonymous';

  return new Promise((resolve) => {
    template.onload = () => {
      invitationCtx.drawImage(template, 0, 0, width, height);

      invitationCtx.fillStyle = '#ffffff';
      invitationCtx.font = 'bold 32px Inter, Arial, sans-serif';
      invitationCtx.textAlign = 'left';
      invitationCtx.fillText(`Trân trọng kính mời: ${fullName || 'Quý khách'}`, 60, 250);

      invitationCtx.font = '22px Inter, Arial, sans-serif';
      invitationCtx.fillStyle = '#f8fafc';
      invitationCtx.fillText(`Họ và tên: ${fullName || '-'}`, 60, 300);
      invitationCtx.fillText(`Giới tính: ${gender || '-'}`, 60, 340);
      invitationCtx.fillText(`Email: ${email || '-'}`, 60, 380);
      invitationCtx.fillText(`Số điện thoại: ${phone || '-'}`, 60, 420);

      resolve();
    };

    template.onerror = () => {
      invitationCtx.fillStyle = '#1e3a8a';
      invitationCtx.fillRect(0, 0, width, height);
      invitationCtx.fillStyle = '#f8fafc';
      invitationCtx.fillRect(40, 40, width - 80, height - 80);

      invitationCtx.fillStyle = '#0f172a';
      invitationCtx.font = 'bold 42px Inter, Arial, sans-serif';
      invitationCtx.fillText('GIẤY MỜI THAM DỰ', 70, 110);

      invitationCtx.font = '24px Inter, Arial, sans-serif';
      invitationCtx.fillStyle = '#475569';
      invitationCtx.fillText(`Trân trọng kính mời: ${fullName || 'Quý khách'}`, 70, 170);
      invitationCtx.font = '20px Inter, Arial, sans-serif';
      invitationCtx.fillStyle = '#334155';
      invitationCtx.fillText(`Giới tính: ${gender || '-'}`, 70, 210);
      invitationCtx.fillText(`Email: ${email || '-'}`, 70, 250);
      invitationCtx.fillText(`Số điện thoại: ${phone || '-'}`, 70, 290);

      resolve();
    };

    template.src = 'thumoi.jpg';
  });
}
