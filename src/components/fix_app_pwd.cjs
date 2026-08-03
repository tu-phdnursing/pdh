const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `      Email: regEmail.toLowerCase().trim(),
      Password: regPassword.trim(),`;
const replace = `      Email: regEmail.toLowerCase().trim(),`;

content = content.replace(target, replace);
fs.writeFileSync('src/App.tsx', content);
