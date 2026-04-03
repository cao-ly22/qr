const { google } = require('googleapis');

// Parse service account từ env hoặc từ JSON string
function getServiceAccount() {
  const privateKey = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  return {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID || 'send-mail-nodejs-492108',
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID || '',
    private_key: privateKey,
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID_SERVICE || '',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
  };
}

const sheetId = process.env.GOOGLE_SHEET_ID;
const serviceAccount = getServiceAccount();

const auth = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth });

async function appendRow(data) {
  try {
    // Lấy thông tin spreadsheet để tìm sheet ID
    const spreadsheetRes = await sheets.spreadsheets.get({
      spreadsheetId: sheetId
    });
    
    const sheetInfo = spreadsheetRes.data.sheets[0]; // Sheet đầu tiên
    const sheetTitle = sheetInfo.properties.title;
    
    console.log(`📋 Đang ghi vào sheet: "${sheetTitle}"`);

    // Lấy tất cả dữ liệu hiện có
    const getRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetTitle}!A:E`
    });

    // Tìm hàng trống tiếp theo
    const rows = getRes.data.values || [];
    const nextRow = rows.length + 1;

    // Ghi vào hàng tiếp theo
    const res = await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${sheetTitle}!A${nextRow}:E${nextRow}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [data]
      }
    });
    console.log(`✅ Đã ghi dữ liệu vào hàng ${nextRow}: ${data.join(' | ')}`);
    return res.data;
  } catch (err) {
    console.error('❌ Lỗi ghi Google Sheet:', err.message);
    throw err;
  }
}

module.exports = { appendRow };