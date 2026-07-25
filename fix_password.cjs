const fs = require('fs');

let content = fs.readFileSync('src/components/StudentInformation.tsx', 'utf8');

const targetInput = `                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    value={profileForm.Password || ''}
                    onChange={e => setProfileForm({ ...profileForm, Password: e.target.value })}
                    placeholder="Enter password (e.g., 1234)"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm disabled:opacity-75 focus:outline-tu-red font-mono"
                  />`;

const replaceInput = `                  <input
                    type="password"
                    disabled={!isEditingProfile}
                    value={profileForm.Password || ''}
                    onChange={e => setProfileForm({ ...profileForm, Password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm disabled:opacity-75 focus:outline-tu-red font-mono"
                  />`;

content = content.replace(targetInput, replaceInput);

fs.writeFileSync('src/components/StudentInformation.tsx', content);
