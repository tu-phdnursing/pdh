const fs = require('fs');
let content = fs.readFileSync('src/lib/googleSheets.ts', 'utf8');

const targetDoGetStart = `function doGet(e) {
  var type = e.parameter.type;
  var ss = getSpreadsheet();`;

const replaceDoGetStart = `function doGet(e) {
  var action = e.parameter.action;
  if (action === 'forgotPassword') {
    return handleForgotPassword(e.parameter.email);
  }
  if (action === 'registerEmail') {
    return handleRegisterEmail(e.parameter.email, e.parameter.password, e.parameter.name);
  }

  var type = e.parameter.type;
  var ss = getSpreadsheet();`;

content = content.replace(targetDoGetStart, replaceDoGetStart);

const targetHelpers = `function loadPortfolioFromSheets(studentId) {`;
const replaceHelpers = `function handleForgotPassword(email) {
  if (!email) return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Email missing' })).setMimeType(ContentService.MimeType.JSON);
  
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet("Users");
  if (!sheet) return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Sheet not found' })).setMimeType(ContentService.MimeType.JSON);
  
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify({ success: false })).setMimeType(ContentService.MimeType.JSON);
  
  var emailIdx = data[0].indexOf("Email");
  var pwdIdx = data[0].indexOf("Password");
  var nameIdx = data[0].indexOf("FullName");
  
  if (emailIdx === -1) return ContentService.createTextOutput(JSON.stringify({ success: false })).setMimeType(ContentService.MimeType.JSON);
  
  var foundPwd = null;
  var foundName = null;
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][emailIdx] && data[i][emailIdx].toString().trim().toLowerCase() === email.trim().toLowerCase()) {
      foundPwd = pwdIdx > -1 ? data[i][pwdIdx] : '1234';
      foundName = nameIdx > -1 ? data[i][nameIdx] : 'User';
      break;
    }
  }
  
  if (foundPwd) {
    try {
      MailApp.sendEmail({
        to: email,
        subject: "Your PhD Portfolio System Password",
        htmlBody: "Hello " + foundName + ",<br><br>Your password for the PhD Portfolio Management System is: <b>" + foundPwd + "</b><br><br>Please keep this safe.<br><br>Best regards,<br>Faculty of Nursing, Thammasat University"
      });
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    } catch(e) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: e.toString() })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false })).setMimeType(ContentService.MimeType.JSON);
}

function handleRegisterEmail(email, password, name) {
  try {
    MailApp.sendEmail({
      to: email,
      subject: "Welcome to PhD Portfolio System",
      htmlBody: "Hello " + (name || '') + ",<br><br>Welcome to the PhD Portfolio Management System!<br><br>Your account has been created successfully. You can log in using your email and the password you created.<br><br>Access the portal here: <b><a href='https://ais-pre-kukrn5jhfdbsrobmbvxguj-102252394350.asia-southeast1.run.app'>Login to Portfolio</a></b><br><br>Best regards,<br>Faculty of Nursing, Thammasat University"
    });
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: e.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function loadPortfolioFromSheets(studentId) {`;

content = content.replace(targetHelpers, replaceHelpers);

fs.writeFileSync('src/lib/googleSheets.ts', content);
console.log("Done");
