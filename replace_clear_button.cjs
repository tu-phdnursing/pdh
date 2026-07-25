const fs = require('fs');
let content = fs.readFileSync('src/components/EditPortfolio.tsx', 'utf8');

const targetStr = `                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-gray-500">รูปแบบแผนการศึกษา:</label>
                    <select`;

const replacement = `                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-gray-500">รูปแบบแผนการศึกษา:</label>
                    <div className="flex gap-2 items-center">
                    <select`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacement);
  
  const endTargetStr = `                      )}
                    </select>
                  </div>`;
  const endReplacement = `                      )}
                    </select>
                    {(formData.programCourses && formData.programCourses.length > 0) && (
                      <button
                        onClick={() => {
                          if (window.confirm('คุณต้องการล้างวิชาทั้งหมดในแผนการศึกษานี้ใช่หรือไม่?')) {
                            setFormData(prev => ({
                              ...prev,
                              programOfStudyName: '',
                              programCourses: []
                            }));
                          }
                        }}
                        className="px-2 py-1 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded text-xs transition border border-gray-200"
                        title="ล้างวิชาทั้งหมด (Clear Courses)"
                      >
                        ล้างวิชา
                      </button>
                    )}
                    </div>
                  </div>`;
  content = content.replace(endTargetStr, endReplacement);
  fs.writeFileSync('src/components/EditPortfolio.tsx', content);
  console.log('Replaced successfully');
} else {
  console.log('Target string not found');
}
