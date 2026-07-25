const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const target = `      </div>
    </div>
  );
}`;

const replacement = `      </div>

      {/* Dissertation Progress (Sec 5.3) */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-50 pb-3">
          <h3 className="text-base font-semibold text-gray-900">5.3 Dissertation Progress Record</h3>
          <button onClick={() => onNavigate('edit')} className="text-xs font-semibold text-tu-red hover:underline cursor-pointer">
            View / Update Progress
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(portfolioData?.dissertationProgress || []).map((prog, idx) => (
            <div key={idx} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Planned Activity / Milestone</p>
                  <h4 className="text-sm font-semibold text-gray-800">{prog.activity}</h4>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Target Date</p>
                  <span className="text-xs font-mono font-medium text-gray-700 bg-white px-2 py-1 rounded border border-gray-200">
                    {prog.date || 'Not set'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Progress Outcome</p>
                  <span className={\`text-xs font-semibold px-2 py-1 rounded \${
                    prog.progress === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                    prog.progress === 'In progress' ? 'bg-amber-50 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }\`}>
                    {prog.progress || 'Not started'}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Obstacles</p>
                  <p className="text-xs text-gray-600 truncate" title={prog.obstacles}>{prog.obstacles || '-'}</p>
                </div>
              </div>
            </div>
          ))}
          
          {(!portfolioData?.dissertationProgress || portfolioData.dissertationProgress.length === 0) && (
            <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-100 rounded-xl">
              <p className="text-sm text-gray-500">No dissertation progress records yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/Dashboard.tsx', content);
console.log("Done");
