const fs = require('fs');
let content = fs.readFileSync('src/components/EditPortfolio.tsx', 'utf8');

content = content.replace(
  "<span>ข้อ 2.2 Doctoral Milestones Timeline (กรอบเวลาความก้าวหน้าตามเกณฑ์)</span>",
  "<span>2.2 Doctoral Milestones Timeline (กรอบเวลาความก้าวหน้าตามเกณฑ์)</span>"
);

content = content.replace(
  "<span>ข้อ 2.3 Personal Learning and Development Plan (แผนพัฒนาศักยภาพส่วนบุคคล)</span>",
  "<span>2.3 Personal Learning and Development Plan (แผนพัฒนาศักยภาพส่วนบุคคล)</span>"
);

fs.writeFileSync('src/components/EditPortfolio.tsx', content);
console.log('Fixed headers successfully');
