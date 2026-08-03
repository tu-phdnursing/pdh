const fs = require('fs');
let content = fs.readFileSync('src/lib/googleSheets.ts', 'utf8');

content = content.replace(
  "if (typeof val === 'string' && /^[123]\\/\\d{4}$/.test(val)) {",
  "if (typeof val === 'string' && /^[123]\\\\/\\\\d{4}$/.test(val)) {"
);

fs.writeFileSync('src/lib/googleSheets.ts', content);
console.log('Fixed successfully');
