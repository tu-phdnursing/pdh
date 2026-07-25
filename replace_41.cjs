const fs = require('fs');
let content = fs.readFileSync('src/components/EditPortfolio.tsx', 'utf8');
const startMatch = `            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">4.1 Courses Completed</h3>`;
const endMatch = `    )}
            </div>

            {/* 4.2 Key Learning from Coursework */}`;

const startIndex = content.indexOf(startMatch);
const endIndex = content.indexOf(endMatch);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find start or end match");
  process.exit(1);
}

const replacement = `            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">4.1 Courses Completed</h3>
              </div>

              {isReadOnly ? (
      <ReadOnlyTable 
        data={(formData.programCourses || []).filter(c => c.status === 'Completed').map(pc => ({
          semester: pc.semester,
          code: pc.code,
          title: pc.title,
          credits: pc.credits,
          grade: formData.completedCourses?.find(cc => cc.code === pc.code)?.grade || ''
        }))} 
        columns={[
          { header: 'Semester / Year', key: 'semester' },
          { header: 'Course Code', key: 'code' },
          { header: 'Course Title', key: 'title' },
          { header: 'Grade', key: 'grade' },
          { header: 'Credits', key: 'credits' }
        ]} 
      />
    ) : (
      <div className="space-y-3">
        {(formData.programCourses || []).filter(c => c.status === 'Completed').length === 0 ? (
          <div className="p-4 bg-gray-50 text-center rounded-xl border border-gray-100 text-gray-400 text-xs italic">
            ไม่มีรายวิชาที่เรียนจบ (No completed courses in Program of Study).
          </div>
        ) : (
          (formData.programCourses || []).filter(c => c.status === 'Completed').map((course, idx) => {
            const existingCC = (formData.completedCourses || []).find(cc => cc.code === course.code) || { grade: '' };
            
            return (
              <div key={idx} className="p-3 bg-white rounded-xl border border-gray-200 relative grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                 <div className="sm:col-span-2">
                   <label className="text-[9px] font-bold text-gray-400 block mb-0.5">Semester/Year</label>
                   <div className="px-2 py-1.5 bg-gray-50 border border-gray-100 rounded text-xs text-gray-600 truncate">{course.semester || '-'}</div>
                 </div>
                 
                 <div className="sm:col-span-2">
                   <label className="text-[9px] font-bold text-gray-400 block mb-0.5">Course Code</label>
                   <div className="px-2 py-1.5 bg-gray-50 border border-gray-100 rounded text-xs font-mono font-bold text-gray-600">{course.code || '-'}</div>
                 </div>
                 
                 <div className="sm:col-span-5">
                   <label className="text-[9px] font-bold text-gray-400 block mb-0.5">Course Title</label>
                   <div className="px-2 py-1.5 bg-gray-50 border border-gray-100 rounded text-xs text-gray-600 truncate">{course.title || '-'}</div>
                 </div>
                 
                 <div className="sm:col-span-1">
                   <label className="text-[9px] font-bold text-gray-400 block mb-0.5">Credits</label>
                   <div className="px-2 py-1.5 bg-gray-50 border border-gray-100 rounded text-xs text-center font-mono text-gray-600">{course.credits || '-'}</div>
                 </div>
                 
                 <div className="sm:col-span-2">
                   <label className="text-[9px] font-bold text-tu-red block mb-0.5">Grade <span className="text-red-500">*</span></label>
                   <input
                     type="text"
                     value={existingCC.grade || ''}
                     placeholder="e.g. A, B+"
                     onChange={(e) => {
                       const val = e.target.value;
                       let updated = [...(formData.completedCourses || [])];
                       const ccIdx = updated.findIndex(cc => cc.code === course.code);
                       if (ccIdx !== -1) {
                         updated[ccIdx].grade = val;
                       } else {
                         updated.push({
                           code: course.code,
                           title: course.title,
                           semester: course.semester,
                           credits: course.credits,
                           grade: val
                         });
                       }
                       setFormData({ ...formData, completedCourses: updated });
                     }}
                     className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-xs font-bold text-center focus:outline-tu-red"
                   />
                 </div>
              </div>
            );
          })
        )}
      </div>
`;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync('src/components/EditPortfolio.tsx', content);
console.log("Replaced successfully");
