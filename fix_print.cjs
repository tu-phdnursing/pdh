const fs = require('fs');
const content = fs.readFileSync('src/components/PrintReport.tsx', 'utf8');

const targetStart = `          {/* 5.3 Dissertation Progress Record */}`;
const targetEnd = `          {/* 5.4 Meetings with Advisor / Committee */}`;

const startIndex = content.indexOf(targetStart);
if (startIndex === -1) {
  console.log("Could not find targetStart");
  process.exit(1);
}

const endIndex = content.indexOf(targetEnd, startIndex);
if (endIndex === -1) {
  console.log("Could not find targetEnd");
  process.exit(1);
}

const replacement = `          {/* 5.3 Dissertation Progress Record */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-tu-red">5.3 Dissertation Progress Record</h3>
            {portfolioData.dissertationProgress && portfolioData.dissertationProgress.length > 0 ? (
              <table className="w-full text-left text-[11px] border border-gray-200">
                <thead>
                  <tr className="bg-gray-50 font-bold border-b border-gray-200">
                    <th className="p-2">Planned Activity</th>
                    <th className="p-2">Target Date</th>
                    <th className="p-2">Progress Outcome</th>
                    <th className="p-2">Obstacles (If any)</th>
                    <th className="p-2">Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {portfolioData.dissertationProgress.map((prog, i) => {
                    let files = [];
                    if (Array.isArray(prog.evidence)) {
                      files = prog.evidence.map(f => typeof f === 'string' ? { name: 'Attachment', url: f } : f);
                    } else if (typeof prog.evidence === 'string') {
                      if (prog.evidence.trim().startsWith('[')) {
                        try { files = JSON.parse(prog.evidence); } catch(e) { files = [{ name: 'Attachment', url: prog.evidence }]; }
                      } else if (prog.evidence.trim()) {
                        files = [{ name: 'Attachment', url: prog.evidence }];
                      }
                    }
                    return (
                      <tr key={i} className="align-top">
                        <td className="p-2 font-bold text-gray-800">{prog.activity}</td>
                        <td className="p-2 font-mono text-gray-600">{prog.date}</td>
                        <td className="p-2 text-gray-600">
                          {prog.progress === 'Completed' && <span className="text-green-600 font-semibold">{prog.progress}</span>}
                          {prog.progress === 'In progress' && <span className="text-blue-600 font-semibold">{prog.progress}</span>}
                          {prog.progress === 'Postponed' && <span className="text-orange-600 font-semibold">{prog.progress}</span>}
                          {prog.progress === 'Not started' && <span className="text-gray-500 font-semibold">{prog.progress}</span>}
                          {!['Completed', 'In progress', 'Postponed', 'Not started'].includes(prog.progress) && <span>{prog.progress}</span>}
                        </td>
                        <td className="p-2 text-gray-600">{prog.obstacles || '-'}</td>
                        <td className="p-2">
                          {files.length > 0 ? (
                            <ul className="list-disc pl-3 text-[10px] space-y-1">
                              {files.map((f, j) => (
                                <li key={j}>
                                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-tu-red hover:underline">
                                    {f.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-400 text-[10px] italic">No evidence</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-gray-400 italic">No progress rows recorded.</p>
            )}
          </div>

`;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync('src/components/PrintReport.tsx', newContent);
console.log("Done");
