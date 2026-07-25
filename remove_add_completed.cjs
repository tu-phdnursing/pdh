const fs = require('fs');
let content = fs.readFileSync('src/components/EditPortfolio.tsx', 'utf8');
const oldText = `  const addCompletedCourse = () => {
    setFormData({
      ...formData,
      completedCourses: [...formData.completedCourses, { code: '', title: '', semester: '', credits: '', grade: '' }]
    });
  };`;
content = content.replace(oldText, '');
fs.writeFileSync('src/components/EditPortfolio.tsx', content);
