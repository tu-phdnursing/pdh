const fs = require('fs');
const content = fs.readFileSync('src/components/EditPortfolio.tsx', 'utf8');

const target = `                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Target Date / Period</label>
                    <input
                      type="text"
                      placeholder="e.g. June - Aug 2025"
                      value={prog.date}
                      onChange={e => {
                        const updated = [...(formData.dissertationProgress || [])];
                        updated[idx].date = e.target.value;
                        setFormData({ ...formData, dissertationProgress: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>`;
                  
const replacement = `                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Target Date / Period</label>
                    <input
                      type="month"
                      value={prog.date}
                      onChange={e => {
                        const updated = [...(formData.dissertationProgress || [])];
                        updated[idx].date = e.target.value;
                        setFormData({ ...formData, dissertationProgress: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>`;
                  
const newContent = content.replace(target, replacement);
fs.writeFileSync('src/components/EditPortfolio.tsx', newContent);
console.log("Done");
