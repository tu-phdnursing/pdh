const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
if (scriptMatch) {
  fs.writeFileSync('temp.js', scriptMatch[1]);
  console.log('Script extracted to temp.js');
} else {
  console.log('No script found');
}
