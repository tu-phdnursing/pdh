const fs = require('fs');
const content = fs.readFileSync('src/components/EditPortfolio.tsx', 'utf8');

const targetStart = `              {(formData.dissertationProgress || []).map((prog, idx) => (`;
const targetEnd = `              ))}
            </div>

            {/* 5.4 Doctoral Advisory Committee Meetings */}`;

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

const replacement = `              {(formData.dissertationProgress || []).map((prog, idx) => {
                let currentFiles = [];
                if (Array.isArray(prog.evidence)) {
                  currentFiles = prog.evidence.map(f => typeof f === 'string' ? { name: 'Attachment', url: f } : f);
                } else if (typeof prog.evidence === 'string') {
                  if (prog.evidence.trim().startsWith('[')) {
                    try { currentFiles = JSON.parse(prog.evidence); } catch(e) { currentFiles = [{ name: 'Attachment', url: prog.evidence }]; }
                  } else if (prog.evidence.trim()) {
                    currentFiles = [{ name: 'Attachment', url: prog.evidence }];
                  }
                }
                currentFiles = currentFiles.filter(f => f && f.url);

                return (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      const updated = (formData.dissertationProgress || []).filter((_, i) => i !== idx);
                      setFormData({ ...formData, dissertationProgress: updated });
                    }}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition cursor-pointer z-10"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Planned Activity / Milestone</label>
                    <select
                      value={prog.activity}
                      onChange={e => {
                        const updated = [...(formData.dissertationProgress || [])];
                        updated[idx].activity = e.target.value;
                        setFormData({ ...formData, dissertationProgress: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                    >
                      <option value="">-- Select Activity --</option>
                      {configOptions.filter(o => o.OptionType === 'ProgressActivity').map(opt => (
                        <option key={opt.id} value={opt.OptionValue}>{opt.OptionValue}</option>
                      ))}
                    </select>
                  </div>

                  <div>
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
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Progress / Achievement Outcome</label>
                    <select
                      value={prog.progress}
                      onChange={e => {
                        const updated = [...(formData.dissertationProgress || [])];
                        updated[idx].progress = e.target.value;
                        setFormData({ ...formData, dissertationProgress: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    >
                      <option value="">-- Select Progress --</option>
                      <option value="Not started">Not started</option>
                      <option value="In progress">In progress</option>
                      <option value="Postponed">Postponed</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Obstacles (if any)</label>
                    <input
                      type="text"
                      placeholder="e.g. Delayed IRB approval"
                      value={prog.obstacles || ''}
                      onChange={e => {
                        const updated = [...(formData.dissertationProgress || [])];
                        updated[idx].obstacles = e.target.value;
                        setFormData({ ...formData, dissertationProgress: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>

                  <div className="md:col-span-2 mt-2">
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Progress Evidence (Google Drive)</label>
                    <FileUploader
                      label="Attach files"
                      files={currentFiles}
                      onChange={(newFiles) => {
                        const updated = [...(formData.dissertationProgress || [])];
                        updated[idx].evidence = JSON.stringify(newFiles);
                        setFormData({ ...formData, dissertationProgress: updated });
                      }}
                      studentId={currentUser.StudentID || ''}
                      studentName={currentUser.FullName || 'Student'}
                      uploaderId={currentUser.UserID}
                      uploaderRole={currentUser.Role}
                    />
                  </div>
                </div>
                );
              })}
            </div>

            {/* 5.4 Doctoral Advisory Committee Meetings */}`;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex + targetEnd.length);
fs.writeFileSync('src/components/EditPortfolio.tsx', newContent);
console.log("Done");
