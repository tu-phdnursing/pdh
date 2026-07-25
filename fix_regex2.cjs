const fs = require('fs');
let content = fs.readFileSync('src/lib/googleSheets.ts', 'utf8');

content = content.replace(
  "if (typeof val === 'string' && /^[123]\\/\\d{4}$/.test(val)) {",
  "if (typeof val === 'string' && (val.indexOf('/') === 1) && (val.startsWith('1/') || val.startsWith('2/') || val.startsWith('3/'))) {"
);
content = content.replace(
  "if (typeof val === 'string' && /^[123]\\\\/\\\\d{4}$/.test(val)) {",
  "if (typeof val === 'string' && (val.indexOf('/') === 1) && (val.startsWith('1/') || val.startsWith('2/') || val.startsWith('3/'))) {"
);

fs.writeFileSync('src/lib/googleSheets.ts', content);
console.log('Fixed successfully');
