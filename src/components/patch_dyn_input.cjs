const fs = require('fs');
let content = fs.readFileSync('src/components/EditPortfolio.tsx', 'utf8');

const helper = `const DynamicInput = ({ 
  value, 
  onChange, 
  configType, 
  configOptions, 
  placeholder, 
  className,
  type = "text",
  rows
}: any) => {
  const options = configOptions.filter((o: any) => o.OptionType && o.OptionType.toLowerCase() === configType.toLowerCase());
  if (options.length > 0) {
    return (
      <select value={value} onChange={onChange} className={className}>
        <option value="">-- Select --</option>
        {options.map((o: any, i: number) => <option key={i} value={o.OptionValue}>{o.OptionValue}</option>)}
      </select>
    );
  }
  if (type === 'textarea') {
    return <textarea rows={rows} value={value} onChange={onChange} placeholder={placeholder} className={className} />;
  }
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={className} />;
};

export default function EditPortfolio({ currentUser, portfolioData, certificates, configOptions, onSavePortfolio, isReadOnly = false, initialSection = 1 }: EditPortfolioProps) {`;

content = content.replace(`export default function EditPortfolio({ currentUser, portfolioData, certificates, configOptions, onSavePortfolio, isReadOnly = false, initialSection = 1 }: EditPortfolioProps) {`, helper);

// Replace in Section 5
const sec5activityTarget = `<label className="text-xs font-semibold text-gray-500 block mb-1">Activity / Milestone</label>
                    <input
                      type="text"
                      placeholder="e.g. Chapter 1 Draft, Ethics Approval"
                      value={prog.activity || ''}
                      onChange={e => {
                        const updated = [...(formData.dissertationProgress || [])];
                        updated[idx].activity = e.target.value;
                        setFormData({ ...formData, dissertationProgress: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                    />`;
const sec5activityReplace = `<label className="text-xs font-semibold text-gray-500 block mb-1">Activity / Milestone</label>
                    <DynamicInput
                      configType="Activity / Milestone"
                      configOptions={configOptions}
                      type="text"
                      placeholder="e.g. Chapter 1 Draft, Ethics Approval"
                      value={prog.activity || ''}
                      onChange={(e: any) => {
                        const updated = [...(formData.dissertationProgress || [])];
                        updated[idx].activity = e.target.value;
                        setFormData({ ...formData, dissertationProgress: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                    />`;
content = content.replace(sec5activityTarget, sec5activityReplace);

const sec5progressTarget = `<select
                      value={prog.progress || ''}
                      onChange={e => {
                        const updated = [...(formData.dissertationProgress || [])];
                        updated[idx].progress = e.target.value as 'Not started' | 'In progress' | 'Postponed' | 'Completed';
                        setFormData({ ...formData, dissertationProgress: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                    >
                      <option value="">-- Select Progress --</option>
                      <option value="Not started">Not started</option>
                      <option value="In progress">In progress</option>
                      <option value="Postponed">Postponed</option>
                      <option value="Completed">Completed</option>
                    </select>`;
const sec5progressReplace = `<DynamicInput
                      configType="Progress"
                      configOptions={configOptions}
                      value={prog.progress || ''}
                      onChange={(e: any) => {
                        const updated = [...(formData.dissertationProgress || [])];
                        updated[idx].progress = e.target.value;
                        setFormData({ ...formData, dissertationProgress: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                    />
                    {configOptions.filter((o: any) => o.OptionType && o.OptionType.toLowerCase() === 'progress').length === 0 && (
                      <select
                        value={prog.progress || ''}
                        onChange={e => {
                          const updated = [...(formData.dissertationProgress || [])];
                          updated[idx].progress = e.target.value as 'Not started' | 'In progress' | 'Postponed' | 'Completed';
                          setFormData({ ...formData, dissertationProgress: updated });
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                      >
                        <option value="">-- Select Progress --</option>
                        <option value="Not started">Not started</option>
                        <option value="In progress">In progress</option>
                        <option value="Postponed">Postponed</option>
                        <option value="Completed">Completed</option>
                      </select>
                    )}`;
content = content.replace(sec5progressTarget, sec5progressReplace);

fs.writeFileSync('src/components/EditPortfolio.tsx', content);
console.log("Done");
