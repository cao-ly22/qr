const form = document.getElementById('customerForm');
const statusEl = document.getElementById('status');
const submitButton = form.querySelector('button[type="submit"]');
const invitationCanvas = document.getElementById('invitationCanvas');
const invitationCanvasNew = document.getElementById('invitationCanvasNew');
const invitationCtx = invitationCanvas.getContext('2d');
const invitationCtxNew = invitationCanvasNew.getContext('2d');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('Đang xử lý và gửi email...', false);
  submitButton.disabled = true;

  const fullName = form.fullName.value.trim();
  const gender = form.gender.value;
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();

  await buildInvitationImage(fullName, gender, email, phone);
  await buildInvitationImageNew(fullName, gender, email, phone);

  try {
    const invitationImage = invitationCanvas.toDataURL('image/png');
    const invitationImageNew = invitationCanvasNew.toDataURL('image/png');

    const response = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, gender, email, phone, invitationImage, invitationImageNew })
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
      // Tính toán tỷ lệ để fit ảnh vào canvas mà không bị nén
      const imgAspectRatio = template.width / template.height;
      const canvasAspectRatio = width / height;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgAspectRatio > canvasAspectRatio) {
        // Ảnh rộng hơn canvas
        drawWidth = width;
        drawHeight = width / imgAspectRatio;
        offsetX = 0;
        offsetY = (height - drawHeight) / 2;
      } else {
        // Ảnh cao hơn canvas
        drawHeight = height;
        drawWidth = height * imgAspectRatio;
        offsetX = (width - drawWidth) / 2;
        offsetY = 0;
      }

      invitationCtx.drawImage(template, offsetX, offsetY, drawWidth, drawHeight);
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

      invitationCtx.font = 'bold 48px Inter, Arial, sans-serif';
      invitationCtx.fillStyle = '#0f172a';
      invitationCtx.shadowColor = 'rgba(0,0,0,0.8)';
      invitationCtx.shadowBlur = 12;
      invitationCtx.shadowOffsetX = 3;
      invitationCtx.shadowOffsetY = 3;
      invitationCtx.fillText(`${fullName || 'Quý khách'}`, 70, 200); // Tăng từ 170 lên 200
      invitationCtx.shadowBlur = 0;
      invitationCtx.shadowOffsetX = 0;
      invitationCtx.shadowOffsetY = 0;
      invitationCtx.font = '20px Inter, Arial, sans-serif';
      invitationCtx.fillStyle = '#334155';
      invitationCtx.fillText(`Giới tính: ${gender || '-'}`, 70, 260); // Tăng từ 210 lên 260
      invitationCtx.fillText(`Email: ${email || '-'}`, 70, 300); // Tăng từ 250 lên 300
      invitationCtx.fillText(`Số điện thoại: ${phone || '-'}`, 70, 340); // Tăng từ 290 lên 340

      resolve();
    };

    template.src = 'thumoi.jpg';
  });
}

function buildInvitationImageNew(fullName, gender, email, phone) {
  const width = invitationCanvasNew.width;
  const height = invitationCanvasNew.height;
  const ctx = invitationCtxNew;
  ctx.clearRect(0, 0, width, height);

  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // White overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(30, 30, width - 60, height - 60);

  // Decorative elements
  ctx.fillStyle = '#667eea';
  ctx.fillRect(30, 30, width - 60, 8);
  ctx.fillRect(30, height - 38, width - 60, 8);

  // Title
  ctx.fillStyle = '#1a202c';
  ctx.font = 'bold 60px Inter, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('THƯ MỜI', width / 2, 150);

  // Subtitle
  ctx.fillStyle = '#4a5568';
  ctx.font = '30px Inter, Arial, sans-serif';
  ctx.fillText('Sự kiện đặc biệt dành cho bạn', width / 2, 200);

  // Main content
  ctx.fillStyle = '#2d3748';
  ctx.font = 'bold 48px Inter, Arial, sans-serif';
  ctx.fillText('Kính mời', width / 2, 280);

  ctx.font = 'bold 60px Inter, Arial, sans-serif';
  ctx.fillStyle = '#667eea';
  ctx.fillText(fullName || 'Quý khách hàng', width / 2, 350);

  // Details
  ctx.textAlign = 'left';
  ctx.fillStyle = '#4a5568';
  ctx.font = '28px Inter, Arial, sans-serif';
  ctx.fillText('Giới tính: ' + gender, 80, 420);
  ctx.fillText('Email: ' + email, 80, 470);
  ctx.fillText('Điện thoại: ' + phone, 80, 520);

  // Footer
  ctx.textAlign = 'center';
  ctx.fillStyle = '#667eea';
  ctx.font = 'bold 32px Inter, Arial, sans-serif';
  ctx.fillText('Chúng tôi rất mong được đón tiếp quý khách!', width / 2, 600);

  ctx.fillStyle = '#718096';
  ctx.font = '24px Inter, Arial, sans-serif';
  ctx.fillText('Hẹn gặp bạn tại sự kiện sắp tới', width / 2, 640);
}
