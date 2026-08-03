const fs = require('fs');
let content = fs.readFileSync('src/components/EditPortfolio.tsx', 'utf8');

const helpers = `
const ReadOnlyTable = ({ data, columns }: { data: any[], columns: { header: string, key: string, render?: (val: any) => React.ReactNode }[] }) => {
  if (!data || data.length === 0) return <div className="text-xs text-gray-500 italic">No data provided.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-600 text-xs border-b border-gray-200">
          <tr>
            {columns.map((col, i) => <th key={i} className="py-2.5 px-4 font-bold">{col.header}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.map((row, i) => (
            <tr key={i} className="text-xs text-gray-800">
              {columns.map((col, j) => (
                <td key={j} className="py-2.5 px-4">{col.render ? col.render(row) : (row[col.key] || '-')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ReadOnlyText = ({ label, text }: { label?: string, text: string }) => (
  <div className="mb-4">
    {label && <h4 className="text-xs font-bold text-gray-500 mb-1">{label}</h4>}
    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-800 whitespace-pre-wrap">{text || '-'}</div>
  </div>
);

export default function EditPortfolio`;

content = content.replace('export default function EditPortfolio', helpers);
fs.writeFileSync('src/components/EditPortfolio.tsx', content);
console.log("Helpers injected.");
