const fs = require('fs');
let content = fs.readFileSync('src/components/StudentProgressDashboard.tsx', 'utf8');

const interfaceTarget = `interface StudentProgressDashboardProps {
  students: User[];
}`;
const interfaceReplace = `interface StudentProgressDashboardProps {
  students: User[];
  onSelectStudent?: (student: User) => void;
}`;

content = content.replace(interfaceTarget, interfaceReplace);

const fnTarget = `export default function StudentProgressDashboard({ students }: StudentProgressDashboardProps) {`;
const fnReplace = `export default function StudentProgressDashboard({ students, onSelectStudent }: StudentProgressDashboardProps) {`;

content = content.replace(fnTarget, fnReplace);

const rowTarget = `<tr key={stud.UserID} className="hover:bg-red-50/20 transition-colors">`;
const rowReplace = `<tr key={stud.UserID} className="hover:bg-red-50/20 transition-colors cursor-pointer" onClick={() => onSelectStudent && onSelectStudent(stud)}>`;

content = content.replace(rowTarget, rowReplace);

fs.writeFileSync('src/components/StudentProgressDashboard.tsx', content);
console.log("Done");
