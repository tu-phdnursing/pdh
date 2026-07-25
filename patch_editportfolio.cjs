const fs = require('fs');
let content = fs.readFileSync('src/components/EditPortfolio.tsx', 'utf8');

// We need to add isReadOnly={isReadOnly} to all FileUploader components
content = content.replace(/<FileUploader/g, '<FileUploader isReadOnly={isReadOnly}');

fs.writeFileSync('src/components/EditPortfolio.tsx', content);
console.log("Done");
