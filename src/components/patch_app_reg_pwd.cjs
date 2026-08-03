const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `    const newUser: User = {
      UserID: \`\${regRole}-\${Date.now()}\`,
      Email: regEmail.toLowerCase().trim(),`;
const replace = `    const newUser: User = {
      UserID: \`\${regRole}-\${Date.now()}\`,
      Email: regEmail.toLowerCase().trim(),
      Password: regPassword.trim(),`;
content = content.replace(target, replace);
fs.writeFileSync('src/App.tsx', content);
console.log("Done");
