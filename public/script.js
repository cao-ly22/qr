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

      const message = `Trân trọng kính mời: ${fullName || 'Quý khách'}`;
      invitationCtx.font = 'bold 40px Inter, Arial, sans-serif';
      invitationCtx.textAlign = 'center';
      invitationCtx.textBaseline = 'middle';

      const textX = width / 2;
      const textY = 180;
      const textWidth = invitationCtx.measureText(message).width;
      const padding = 16;

      invitationCtx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      invitationCtx.fillRect(textX - textWidth / 2 - padding, textY - 30, textWidth + padding * 2, 55);

      invitationCtx.fillStyle = '#ffffff';
      invitationCtx.shadowColor = 'rgba(0,0,0,0.5)';
      invitationCtx.shadowBlur = 6;
      invitationCtx.fillText(message, textX, textY);
      invitationCtx.shadowBlur = 0;

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
