/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, ConfigOption, OptionType, ActivityLog } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Settings, FileSpreadsheet, Plus, Trash2, Edit2, ShieldAlert, Check, PlusCircle, Search, RefreshCw, KeyRound } from 'lucide-react';
import { getLogs, resolvePhotoUrl } from '../lib/googleSheets';

interface AdminPanelProps {
  currentUser: User;
  users: User[];
  configOptions: ConfigOption[];
  onAddUser: (u: User) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onAddConfigOption: (opt: ConfigOption) => Promise<void>;
  onDeleteConfigOption: (id: string) => Promise<void>;
}

export default function AdminPanel({
  currentUser,
  users,
  configOptions,
  onAddUser,
  onDeleteUser,
  onAddConfigOption,
  onDeleteConfigOption
}: AdminPanelProps) {
  const [adminTab, setAdminTab] = useState<'users' | 'configs' | 'logs'>('users');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  
  // User Manager State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserForm, setNewUserForm] = useState<Partial<User>>({
    Email: '',
    FullName: '',
    Role: 'STUDENT',
    StudentID: '',
    Major: '',
    Advisor: '',
    CoAdvisor: '',
    ThesisTitle: ''
  });

  // Config Manager State
  const [newConfigType, setNewConfigType] = useState<OptionType>('ADVISOR');
  const [newConfigValue, setNewConfigValue] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');

  // Fetch log history on mount or tab change
  useEffect(() => {
    setLogs(getLogs());
  }, [adminTab]);

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editingUser.Email || !editingUser.FullName) return;
    await onAddUser(editingUser);
    setEditingUser(null);
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.Email || !newUserForm.FullName) return;

    const formattedUser: User = {
      UserID: newUserForm.Role === 'STUDENT' ? `STUDENT-${Date.now()}` : `ADVISOR-${Date.now()}`,
      Email: newUserForm.Email,
      FullName: newUserForm.FullName,
      Role: newUserForm.Role as any,
      StudentID: newUserForm.StudentID,
      Major: newUserForm.Major,
      Advisor: newUserForm.Advisor,
      CoAdvisor: newUserForm.CoAdvisor,
      ThesisTitle: newUserForm.ThesisTitle
    };

    await onAddUser(formattedUser);
    setShowAddUserModal(false);
    // Reset
    setNewUserForm({
      Email: '',
      FullName: '',
      Role: 'STUDENT',
      StudentID: '',
      Major: '',
      Advisor: '',
      CoAdvisor: '',
      ThesisTitle: ''
    });
  };

  const handleAddConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valToSave = newConfigValue.trim();
    if (newConfigType === 'COURSE') {
      if (!courseCode.trim() || !courseTitle.trim()) return;
      valToSave = `${courseCode.trim()}: ${courseTitle.trim()}`;
    } else {
      if (!valToSave) return;
    }

    const newOpt: ConfigOption = {
      id: `cfg-${Date.now()}`,
      OptionType: newConfigType,
      OptionValue: valToSave
    };

    await onAddConfigOption(newOpt);
    setNewConfigValue('');
    setCourseCode('');
    setCourseTitle('');
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setAdminTab('users')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-all duration-200 cursor-pointer ${
            adminTab === 'users' ? 'border-tu-red text-tu-red font-bold' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Users size={16} />
          User Account Management
        </button>
        <button
          onClick={() => setAdminTab('configs')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-all duration-200 cursor-pointer ${
            adminTab === 'configs' ? 'border-tu-red text-tu-red font-bold' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Settings size={16} />
          Dropdown Option Parameters
        </button>
        <button
          onClick={() => setAdminTab('logs')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-all duration-200 cursor-pointer ${
            adminTab === 'logs' ? 'border-tu-red text-tu-red font-bold' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ShieldAlert size={16} />
          System Audit & Activity Logs
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ------------------------------------------------------------- */}
        {/* TAB 1: USER ACCOUNT MANAGER */}
        {/* ------------------------------------------------------------- */}
        {adminTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-gray-800">PhD Students & Advisors List</h3>
                <p className="text-xs text-gray-400">Add, modify, or remove user accounts to simulate logins in real-time.</p>
              </div>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-tu-red hover:bg-tu-red-hover text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <PlusCircle size={14} />
                Add New User
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-100">
                      <th className="p-4">Photo</th>
                      <th className="p-4">Full Name</th>
                      <th className="p-4">Registered Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Student/Advisor ID</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {users.map((user) => (
                      <tr key={user.UserID} className="hover:bg-gray-50/50 transition duration-150">
                        <td className="p-4">
                          <img
                            src={resolvePhotoUrl(user.PhotoURL)}
                            alt={user.FullName}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                        </td>
                        <td className="p-4">
                          <span className="font-semibold block text-gray-900">{user.FullName}</span>
                          {user.Role === 'STUDENT' && (
                            <div className="text-[10px] text-gray-400 space-y-0.5 mt-0.5">
                              <div><span className="font-bold text-gray-500">Advisor:</span> {user.Advisor || 'Not Assigned'}</div>
                              <div><span className="font-bold text-gray-500">Co-Advisor:</span> {user.CoAdvisor || 'Not Assigned'}</div>
                            </div>
                          )}
                        </td>
                        <td className="p-4 font-mono">{user.Email}</td>
                        <td className="p-4 font-mono">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            user.Role === 'STUDENT'
                              ? 'bg-blue-50 text-blue-700'
                              : user.Role === 'ADVISOR'
                              ? 'bg-amber-50 text-amber-700'
                              : user.Role === 'CO_ADVISOR'
                              ? 'bg-purple-50 text-purple-700'
                              : user.Role === 'SUPER_ADVISOR'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-red-50 text-red-700'
                          }`}>
                            {user.Role}
                          </span>
                        </td>
                        <td className="p-4 font-mono">{user.StudentID || 'N/A'}</td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center items-center gap-1">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="Edit User / Pair Advisors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => onDeleteUser(user.UserID)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              title="Delete User Account"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ADD USER MODAL */}
            {showAddUserModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <h3 className="font-bold text-gray-900 text-sm">Add New Student or Faculty Account</h3>
                    <button onClick={() => setShowAddUserModal(false)} className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer">×</button>
                  </div>

                  <form onSubmit={handleAddUserSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-gray-500 block mb-1">Role</label>
                        <select
                          value={newUserForm.Role}
                          onChange={e => setNewUserForm({ ...newUserForm, Role: e.target.value as any })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                        >
                          <option value="STUDENT">STUDENT (นักศึกษา)</option>
                          <option value="ADVISOR">ADVISOR (อาจารย์ที่ปรึกษาหลัก)</option>
                          <option value="CO_ADVISOR">CO_ADVISOR (อาจารย์ที่ปรึกษาร่วม)</option>
                          <option value="SUPER_ADVISOR">SUPER_ADVISOR (อาจารย์ผู้ดูแลหลักหลักสูตร)</option>
                          <option value="ADMIN">ADMIN (แอดมินระบบ)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-gray-500 block mb-1">
                          ID Number (Student/Staff) {newUserForm.Role === 'STUDENT' && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="text"
                          required={newUserForm.Role === 'STUDENT'}
                          value={newUserForm.StudentID || ''}
                          onChange={e => setNewUserForm({ ...newUserForm, StudentID: e.target.value })}
                          placeholder={newUserForm.Role === 'STUDENT' ? "e.g., 6601010024" : "e.g., STAFF-123 (Optional)"}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-gray-500 block mb-1">Full Name (including titles)</label>
                      <input
                        type="text"
                        required
                        value={newUserForm.FullName}
                        onChange={e => setNewUserForm({ ...newUserForm, FullName: e.target.value })}
                        placeholder="e.g., Assoc. Prof. Dr. Sarah Smith"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-gray-500 block mb-1">User Email Address</label>
                      <input
                        type="email"
                        required
                        value={newUserForm.Email}
                        onChange={e => setNewUserForm({ ...newUserForm, Email: e.target.value })}
                        placeholder="student@tu.ac.th"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                      />
                    </div>

                    {newUserForm.Role === 'STUDENT' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold text-gray-500 block mb-1">Major Advisor</label>
                          <select
                            value={newUserForm.Advisor}
                            onChange={e => setNewUserForm({ ...newUserForm, Advisor: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                          >
                            <option value="">Select Advisor...</option>
                            {configOptions.filter(c => c.OptionType.trim() === 'ADVISOR').map(c => (
                              <option key={c.id} value={c.OptionValue}>{c.OptionValue}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold text-gray-500 block mb-1">Co-Advisor</label>
                          <select
                            value={newUserForm.CoAdvisor}
                            onChange={e => setNewUserForm({ ...newUserForm, CoAdvisor: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                          >
                            <option value="">Select Co-Advisor...</option>
                            {configOptions.filter(c => c.OptionType.trim() === 'CO_ADVISOR').map(c => (
                              <option key={c.id} value={c.OptionValue}>{c.OptionValue}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowAddUserModal(false)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-tu-red hover:bg-tu-red-hover text-white rounded-xl font-semibold cursor-pointer"
                      >
                        Register Account
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* EDIT USER / PAIR ADVISORS MODAL */}
            {editingUser && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <h3 className="font-bold text-gray-900 text-sm">Edit User Profile / Pair Advisors</h3>
                    <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer">×</button>
                  </div>

                  <form onSubmit={handleEditUserSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-gray-500 block mb-1">Role</label>
                        <select
                          value={editingUser.Role}
                          onChange={e => setEditingUser({ ...editingUser, Role: e.target.value as any })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                        >
                          <option value="STUDENT">STUDENT (นักศึกษา)</option>
                          <option value="ADVISOR">ADVISOR (อาจารย์ที่ปรึกษาหลัก)</option>
                          <option value="CO_ADVISOR">CO_ADVISOR (อาจารย์ที่ปรึกษาร่วม)</option>
                          <option value="SUPER_ADVISOR">SUPER_ADVISOR (อาจารย์ผู้ดูแลหลักหลักสูตร)</option>
                          <option value="ADMIN">ADMIN (แอดมินระบบ)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-gray-500 block mb-1">
                          ID Number (Student/Staff) {editingUser.Role === 'STUDENT' && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="text"
                          required={editingUser.Role === 'STUDENT'}
                          value={editingUser.StudentID || ''}
                          onChange={e => setEditingUser({ ...editingUser, StudentID: e.target.value })}
                          placeholder={editingUser.Role === 'STUDENT' ? "e.g., 6601010024" : "e.g., STAFF-123 (Optional)"}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-gray-500 block mb-1">Full Name (including titles)</label>
                      <input
                        type="text"
                        required
                        value={editingUser.FullName}
                        onChange={e => setEditingUser({ ...editingUser, FullName: e.target.value })}
                        placeholder="e.g., Assoc. Prof. Dr. Sarah Smith"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-gray-500 block mb-1">User Email Address</label>
                      <input
                        type="email"
                        required
                        value={editingUser.Email}
                        onChange={e => setEditingUser({ ...editingUser, Email: e.target.value })}
                        placeholder="student@tu.ac.th"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                      />
                    </div>

                    {editingUser.Role === 'STUDENT' && (
                      <div className="grid grid-cols-2 gap-3 bg-red-50/50 p-3 rounded-xl border border-red-100">
                        <div className="col-span-2 text-[10px] font-bold text-tu-red uppercase tracking-wide mb-1">
                          🎓 Advisor Mapping (การจับคู่อาจารย์ที่ปรึกษา)
                        </div>
                        <div>
                          <label className="font-semibold text-gray-600 block mb-1">Major Advisor</label>
                          <select
                            value={editingUser.Advisor || ''}
                            onChange={e => setEditingUser({ ...editingUser, Advisor: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-medium"
                          >
                            <option value="">Select Major Advisor...</option>
                            {/* Option 1: From configs */}
                            {configOptions.filter(c => c.OptionType.trim() === 'ADVISOR').map(c => (
                              <option key={c.id} value={c.OptionValue}>{c.OptionValue}</option>
                            ))}
                            {/* Option 2: From advisors users */}
                            {users.filter(u => u.Role === 'ADVISOR' || u.Role === 'SUPER_ADVISOR').map(u => (
                              <option key={u.UserID} value={u.FullName}>{u.FullName}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold text-gray-600 block mb-1">Co-Advisor</label>
                          <select
                            value={editingUser.CoAdvisor || ''}
                            onChange={e => setEditingUser({ ...editingUser, CoAdvisor: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-medium"
                          >
                            <option value="">Select Co-Advisor...</option>
                            {/* Option 1: From configs */}
                            {configOptions.filter(c => c.OptionType.trim() === 'CO_ADVISOR').map(c => (
                              <option key={c.id} value={c.OptionValue}>{c.OptionValue}</option>
                            ))}
                            {/* Option 2: From co-advisor users */}
                            {users.filter(u => u.Role === 'CO_ADVISOR').map(u => (
                              <option key={u.UserID} value={u.FullName}>{u.FullName}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="font-semibold text-gray-600 block mb-1">Thesis Title (Draft)</label>
                          <input
                            type="text"
                            value={editingUser.ThesisTitle || ''}
                            onChange={e => setEditingUser({ ...editingUser, ThesisTitle: e.target.value })}
                            placeholder="e.g., Efficacy of Mindfulness-Based Tele-Nursing Intervention..."
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-tu-red hover:bg-tu-red-hover text-white rounded-xl font-semibold cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: SYSTEM CONFIGURATION MANAGER */}
        {/* ------------------------------------------------------------- */}
        {adminTab === 'configs' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Form to add Option */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                <PlusCircle size={16} className="text-tu-red" />
                Add New Dropdown Option
              </h3>

              <form onSubmit={handleAddConfigSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-gray-500 block mb-1">Option Parameter Type</label>
                  <select
                    value={newConfigType}
                    onChange={e => {
                      const val = e.target.value as OptionType;
                      setNewConfigType(val);
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  >
                    <option value="ADVISOR">Major Advisor (ADVISOR)</option>
                    <option value="CO_ADVISOR">Co-Advisor (CO_ADVISOR)</option>
                    <option value="CERT_CATEGORY">Certificate Category (CERT_CATEGORY)</option>
                    <option value="DEGREE">Degree Major Program (DEGREE)</option>
                    <option value="COURSE">Standard Courses (COURSE)</option>
                  </select>
                </div>

                {newConfigType === 'COURSE' ? (
                  <>
                    <div>
                      <label className="font-semibold text-gray-500 block mb-1">Course Code</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., NS802"
                        value={courseCode}
                        onChange={e => setCourseCode(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-500 block mb-1">Course Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Advanced Gerontology"
                        value={courseTitle}
                        onChange={e => setCourseTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="font-semibold text-gray-500 block mb-1">Option Value Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Assoc. Prof. Dr. Helen Carter"
                      value={newConfigValue}
                      onChange={e => setNewConfigValue(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 bg-tu-red hover:bg-tu-red-hover text-white rounded-xl font-bold transition cursor-pointer"
                >
                  Add Option (Sync to Google Sheets)
                </button>
              </form>
            </div>

            {/* List current Configs by type */}
            <div className="md:col-span-2 space-y-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <h3 className="text-sm font-bold text-gray-800">Current System Dropdown Parameters</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['ADVISOR', 'CO_ADVISOR', 'CERT_CATEGORY', 'DEGREE', 'COURSE'].map((type) => (
                  <div key={type} className="border border-gray-100 p-3.5 rounded-xl bg-gray-50/50 space-y-2 max-h-60 overflow-y-auto">
                    <span className="text-[10px] font-mono font-bold text-tu-red tracking-wider uppercase block border-b border-gray-100 pb-1">
                      {type}
                    </span>
                    <ul className="space-y-1.5">
                      {configOptions
                        .filter(c => c.OptionType.trim() === type)
                        .map((opt) => (
                          <li key={opt.id} className="text-xs flex items-center justify-between text-gray-700 bg-white px-2 py-1.5 rounded-lg border border-gray-100/50">
                            <span className="truncate">{opt.OptionValue}</span>
                            <button
                              onClick={() => onDeleteConfigOption(opt.id)}
                              className="text-gray-300 hover:text-red-500 transition ml-2 cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: SYSTEM AUDIT LOGS TIMELINE */}
        {/* ------------------------------------------------------------- */}
        {adminTab === 'logs' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs"
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-800">System Security Audit Log</h3>
                <p className="text-xs text-gray-400">Real-time automated logging of authentication sessions and Google Sheets synchronization updates.</p>
              </div>
              <button
                onClick={() => setLogs(getLogs())}
                className="flex items-center gap-1 text-xs text-tu-red hover:underline font-semibold cursor-pointer"
              >
                <RefreshCw size={12} />
                Refresh Logs
              </button>
            </div>

            <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
              {logs.map((log) => (
                <div key={log.LogID} className="flex items-start gap-3 p-3 bg-gray-50/70 border border-gray-100 rounded-xl text-xs">
                  <div className={`p-1 rounded-full text-white mt-0.5 ${
                    log.Action === 'LOGIN' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}>
                    <KeyRound size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-gray-800">{log.Action}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{log.Timestamp}</span>
                    </div>
                    <p className="text-gray-600 mt-1">{log.Details}</p>
                    <span className="text-[9px] font-mono text-gray-400">Executed by: {log.UserID}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
