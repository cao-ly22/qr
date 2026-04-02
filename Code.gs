function doGet() {
  return HtmlService.createHtmlOutputFromFile('form')
    .setTitle('Đăng ký khách hàng')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function sendEmailWithAttachments(fullName, gender, email, phone, invitationDataUrl, qrDataUrl) {
  if (!email || email.indexOf('@') === -1) {
    throw new Error('Email không hợp lệ.');
  }

  var subject = 'Thư mời của chúng tôi';
  var body = 'Xin chào ' + fullName + ',\n\n' +
    'Cảm ơn bạn đã đăng ký. Trong email này, bạn nhận được giấy mời và mã QR mã hóa thông tin của bạn.\n\n' +
    'Họ và tên: ' + fullName + '\n' +
    'Giới tính: ' + gender + '\n' +
    'Số điện thoại: ' + phone + '\n' +
    'Email: ' + email + '\n\n' +
    'Trân trọng,\nĐội ngũ hỗ trợ.';

  var invitationBlob = dataUrlToBlob_(invitationDataUrl, 'giay_moi.png');
  var qrBlob = dataUrlToBlob_(qrDataUrl, 'qr_code.png');

  GmailApp.sendEmail(email, subject, body, {
    attachments: [invitationBlob, qrBlob],
    name: 'Hệ thống đăng ký'
  });

  return 'Đã gửi email xác nhận đến: ' + email;
}

function dataUrlToBlob_(dataUrl, filename) {
  var parts = dataUrl.split(',');
  var matches = parts[0].match(/data:(.*?);base64/);
  var contentType = matches ? matches[1] : 'image/png';
  var raw = Utilities.base64Decode(parts[1]);
  return Utilities.newBlob(raw, contentType, filename);
}
