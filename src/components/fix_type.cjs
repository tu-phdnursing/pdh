const fs = require('fs');

let content = fs.readFileSync('src/components/AdvisorDissertationView.tsx', 'utf8');

content = content.replace(
  `const info = portfolio.dissertationInfo || {};`,
  `const info: any = portfolio.dissertationInfo || {};`
);

fs.writeFileSync('src/components/AdvisorDissertationView.tsx', content);
