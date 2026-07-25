/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StudentPortfolioData, User, ConfigOption, Certificate } from '../types';
import { motion } from 'motion/react';
import FileUploader from './FileUploader';
import DatePickerField from './DatePickerField';
import { resolveFileUrl, formatDisplayDate } from '../lib/googleSheets';
import {
  BookOpen, Award, CheckCircle, Clock, Save, Plus, Trash2, Calendar,
  ChevronRight, Compass, HelpCircle, Star, Heart, FileText, Check, AlertCircle, Sparkles, Info, Paperclip
} from 'lucide-react';

interface EditPortfolioProps {
  isReadOnly?: boolean;
  currentUser: User;
  portfolioData: StudentPortfolioData;
  onSavePortfolio: (data: StudentPortfolioData) => Promise<void>;
  configOptions: ConfigOption[];
  certificates: Certificate[];
  initialSection?: number | null;
}


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

export default function EditPortfolio({
  currentUser,
  portfolioData,
  onSavePortfolio,
  configOptions,
  certificates,
  isReadOnly = false
}: EditPortfolioProps) {
  const [activeSection, setActiveSection] = useState<number>(1);
  const [formData, setFormData] = useState<StudentPortfolioData>({ ...portfolioData });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const standardCourses = React.useMemo(() => configOptions
    .filter(c => c.OptionType.trim() === 'COURSE')
    .map(c => {
      const parts = c.OptionValue.split('|');
      if (parts.length >= 3) {
        return { code: parts[0].trim(), title: parts[1].trim(), credits: parts[2].trim() };
      }
      const colonParts = c.OptionValue.split(': ');
      const code = colonParts[0] || '';
      const title = colonParts.slice(1).join(': ') || '';
      return { code, title, credits: '3' };
    }), [configOptions]);

  const courseSets = React.useMemo(() => configOptions
    .filter(c => c.OptionType.trim() === 'COURSE_SET')
    .map(c => {
      const parts = c.OptionValue.split('|');
      if (parts.length >= 2) {
        return { name: parts[0].trim(), courses: parts[1].split(',').map(s => s.trim()) };
      }
      return { name: c.OptionValue, courses: [] };
    }), [configOptions]);

  const semesters = React.useMemo(() => configOptions
    .filter(c => c.OptionType.trim() === 'SEMESTER')
    .map(c => c.OptionValue.trim()), [configOptions]);

  React.useEffect(() => {
    setFormData({ ...portfolioData });
  }, [portfolioData]);

  const sectionsList = [
    { id: 1, name: '1. Student Profile & Study Goals' },
    { id: 2, name: '2. Program of Study & Milestones' },
    { id: 3, name: '3. English Language Proficiency' },
    { id: 4, name: '4. Coursework & Certifications' },
    { id: 5, name: '5. Dissertation Progress' },
    { id: 6, name: '6. Research Experience Requirement (180h)' },
    { id: 7, name: '7. Scholarly Output & Publications' },
    { id: 8, name: '8. Teaching & Academic Service' },
    { id: 9, name: '9. Leadership & Networking' },
    { id: 10, name: '10. Reflective Practice' },
    { id: 11, name: '11. Supporting Evidence & Docs' },
    { id: 12, name: '12. Self-Assessment of Competencies' },
    { id: 13, name: '13. Annual Review Summary' },
    { id: 14, name: '14. Future Career Plan' },
    { id: 15, name: '15. Advisor’s Feedback & Comments' },
    { id: 16, name: '16. Advisor Sign-off & Endorsement' }
  ];

  // Handler for full save
  const handleSave = async () => {
    setIsSaving(true);
    await onSavePortfolio(formData);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // 1. Dynamic Lists Add/Remove helpers
  const addAcademicBackground = () => {
    setFormData({
      ...formData,
      academicBackground: [...formData.academicBackground, { degree: '', field: '', institution: '', year: '' }]
    });
  };

  const removeAcademicBackground = (idx: number) => {
    setFormData({
      ...formData,
      academicBackground: formData.academicBackground.filter((_, i) => i !== idx)
    });
  };

  const addProfessionalBackground = () => {
    setFormData({
      ...formData,
      professionalBackground: [...formData.professionalBackground, { period: '', role: '', remarks: '' }]
    });
  };

  const removeProfessionalBackground = (idx: number) => {
    setFormData({
      ...formData,
      professionalBackground: formData.professionalBackground.filter((_, i) => i !== idx)
    });
  };

  const addEnglishActivity = () => {
    setFormData({
      ...formData,
      englishActivities: [...formData.englishActivities, { date: '', activity: '', organizer: '', description: '', evidence: '' }]
    });
  };



  const addKeyLearning = () => {
    setFormData({
      ...formData,
      keyLearnings: [...(formData.keyLearnings || []), { course: '', keyLearning: '', application: '' }]
    });
  };

  const addDissertationProgress = () => {
    setFormData({
      ...formData,
      dissertationProgress: [...(formData.dissertationProgress || []), { activity: '', date: '', progress: 'Not started', obstacles: '', evidence: '' }]
    });
  };

  const addResearchExp = () => {
    setFormData({
      ...formData,
      researchExperience: [...formData.researchExperience, { date: '', activity: '', description: '', hours: 10, supervisor: '', evidence: '' }]
    });
  };

  const addPublication = () => {
    setFormData({
      ...formData,
      publications: [...formData.publications, { year: '', title: '', journal: '', status: 'Published', doi: '' }]
    });
  };

  const addWorkshop = () => {
    setFormData({
      ...formData,
      workshops: [...formData.workshops, { date: '', title: '', organizer: '', role: '', keyLearning: '' }]
    });
  };

  const addAdvisorMeeting = () => {
    setFormData({
      ...formData,
      advisorMeetings: [...formData.advisorMeetings, { date: '', persons: '', issues: '', actionPoints: '' }]
    });
  };

  const [newFileMeta, setNewFileMeta] = React.useState({ title: '', date: '', description: '' });

  const addConferencePresentation = () => {
    setFormData({
      ...formData,
      conferencePresentations: [...(formData.conferencePresentations || []), { date: '', title: '', conference: '', type: 'Oral', venue: '' }]
    });
  };

  const addManuscript = () => {
    setFormData({
      ...formData,
      manuscripts: [...(formData.manuscripts || []), { title: '', journal: '', stage: 'Drafting', plannedSubmission: '' }]
    });
  };

  const addGrant = () => {
    setFormData({
      ...formData,
      grants: [...(formData.grants || []), { title: '', source: '', role: 'Principal Investigator', amount: '', period: '' }]
    });
  };

  const addAward = () => {
    setFormData({
      ...formData,
      awards: [...(formData.awards || []), { date: '', award: '', organizer: '', description: '' }]
    });
  };

  const addTeachingExperience = () => {
    setFormData({
      ...formData,
      teachingExperiences: [...(formData.teachingExperiences || []), { semester: '', course: '', role: '', studentLevel: 'Undergraduate', description: '' }]
    });
  };

  const addSupervision = () => {
    setFormData({
      ...formData,
      supervisions: [...(formData.supervisions || []), { date: '', type: 'Thesis Mentoring', studentLevel: 'Undergraduate', description: '' }]
    });
  };

  const addAcademicService = () => {
    setFormData({
      ...formData,
      academicServices: [...(formData.academicServices || []), { date: '', activity: '', role: '', organization: '' }]
    });
  };

  const addLeadership = () => {
    setFormData({
      ...formData,
      leaderships: [...(formData.leaderships || []), { date: '', role: '', organization: '', responsibilities: '' }]
    });
  };

  const addActionPlan = () => {
    setFormData({
      ...formData,
      annualReview: {
        ...formData.annualReview,
        actionPlans: [...(formData.annualReview.actionPlans || []), { goal: '', steps: '', timeline: '', support: '' }]
      }
    });
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-4 gap-6 ${isReadOnly ? 'portfolio-readonly' : ''}`}>
      
      {/* Left Column: Sections Index Menu */}
      <div className="lg:col-span-1 space-y-2">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Portfolio 16 Sections</h3>
          <div className="space-y-1">
            {sectionsList.map((sec) => (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveSection(sec.id);
                  setSaveSuccess(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition duration-200 flex items-center justify-between cursor-pointer ${
                  activeSection === sec.id
                    ? 'bg-tu-red text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="truncate">{sec.name}</span>
                <ChevronRight size={12} className={activeSection === sec.id ? 'opacity-100' : 'opacity-30'} />
              </button>
            ))}
          </div>
        </div>

        {!isReadOnly && (
        <>
        {/* Global Save Trigger Card */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-xs transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isSaving ? <span className="animate-spin mr-1">⌛</span> : <Save size={14} />}
            {isSaving ? 'Saving...' : 'Save All Sections'}
          </button>
          
          {saveSuccess && (
            <div className="text-center text-xs text-emerald-600 font-semibold bg-emerald-50 py-1.5 rounded-lg border border-emerald-100 flex items-center justify-center gap-1">
              <Check size={12} />
              Saved & Synced Successfully!
            </div>
          )}
          <p className="text-[10px] text-gray-400 text-center leading-normal">
            All updates are safely stored in LocalStorage and synced automatically to Google Sheets.
          </p>
        </div>
        </>
        )}
      </div>

      {/* Right Column: Detailed form content */}
      <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs min-h-[500px]">
        <fieldset disabled={isReadOnly} className={isReadOnly ? "opacity-95" : ""}>
        {/* Section title */}
        <div className="border-b border-gray-100 pb-3 mb-5 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              {sectionsList.find(s => s.id === activeSection)?.name}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Faculty of Nursing, Thammasat University (Nursing PhD)</p>
          </div>
          <span className="p-1 bg-red-50 text-tu-red rounded-lg text-xs font-bold px-2.5">
            Section {activeSection}/16
          </span>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION 1: Personal & Academic Background */}
        {/* ------------------------------------------------------------- */}
        {activeSection === 1 && (
          <div className="space-y-6 text-xs text-gray-700">
            {/* Academic Background List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">1.2 Academic Background</h3>
                <button
                  onClick={addAcademicBackground}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-tu-red text-gray-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Plus size={12} />
                  Add Academic Background Row
                </button>
              </div>

              {isReadOnly ? (
      <ReadOnlyTable data={formData.academicBackground || []} columns={[
        { header: 'Degree Name', key: 'degree' },
        { header: 'Field of Study', key: 'field' },
        { header: 'Institution', key: 'institution' },
        { header: 'Graduation Year', key: 'year' }
      ]} />
    ) : (
      formData.academicBackground.map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <button
                    onClick={() => removeAcademicBackground(idx)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                  
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Degree Name</label>
                    <input
                      type="text"
                      value={item.degree}
                      placeholder="e.g., M.Sc. (Nursing)"
                      onChange={e => {
                        const updated = [...formData.academicBackground];
                        updated[idx].degree = e.target.value;
                        setFormData({ ...formData, academicBackground: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Field of Study</label>
                    <input
                      type="text"
                      value={item.field}
                      placeholder="e.g., Adult Nursing"
                      onChange={e => {
                        const updated = [...formData.academicBackground];
                        updated[idx].field = e.target.value;
                        setFormData({ ...formData, academicBackground: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Institution</label>
                    <input
                      type="text"
                      value={item.institution}
                      placeholder="e.g., Thammasat University"
                      onChange={e => {
                        const updated = [...formData.academicBackground];
                        updated[idx].institution = e.target.value;
                        setFormData({ ...formData, academicBackground: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Graduation Year</label>
                    <input
                      type="text"
                      value={item.year}
                      placeholder="e.g., 2021"
                      onChange={e => {
                        const updated = [...formData.academicBackground];
                        updated[idx].year = e.target.value;
                        setFormData({ ...formData, academicBackground: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              ))
    )}
            </div>

            {/* Professional Background List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-t border-gray-100 pt-5">
                <h3 className="text-sm font-bold text-gray-700">1.3 Professional Background</h3>
                <button
                  onClick={addProfessionalBackground}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-tu-red text-gray-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Plus size={12} />
                  Add Professional Background Row
                </button>
              </div>

              {isReadOnly ? (
      <ReadOnlyTable data={formData.professionalBackground || []} columns={[
        { header: 'Position', key: 'position' },
        { header: 'Institution / Organization', key: 'institution' },
        { header: 'Years', key: 'years' }
      ]} />
    ) : (
      formData.professionalBackground.map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => removeProfessionalBackground(idx)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Employment Period</label>
                    <input
                      type="text"
                      value={item.period}
                      placeholder="e.g., 2021 - 2023"
                      onChange={e => {
                        const updated = [...formData.professionalBackground];
                        updated[idx].period = e.target.value;
                        setFormData({ ...formData, professionalBackground: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Position / Organization</label>
                    <input
                      type="text"
                      value={item.role}
                      placeholder="e.g., Registered Nurse, Thammasat Hospital"
                      onChange={e => {
                        const updated = [...formData.professionalBackground];
                        updated[idx].role = e.target.value;
                        setFormData({ ...formData, professionalBackground: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Additional Remarks</label>
                    <input
                      type="text"
                      value={item.remarks}
                      placeholder="e.g., Primary emergency ward"
                      onChange={e => {
                        const updated = [...formData.professionalBackground];
                        updated[idx].remarks = e.target.value;
                        setFormData({ ...formData, professionalBackground: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              ))
    )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 2: Study Plan & Milestones Checklist */}
        {/* ------------------------------------------------------------- */}
        {activeSection === 2 && (
          <div className="space-y-8 text-xs text-gray-700">
            {/* Sub-navigation for Section 2 */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-6">
              
              {/* 2.1 Program of Study */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                      <BookOpen size={16} className="text-tu-red" />
                      <span>2.1 Program of Study (หลักสูตรการศึกษา)</span>
                    </h4>
                    <p className="text-[10px] text-gray-400">กรุณาระบุรายละเอียดชุดวิชา แผนการศึกษา และสถานะรายวิชาที่เรียน</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-gray-500">รูปแบบแผนการศึกษา:</label>
                    <div className="flex gap-2 items-center">
                    <select
                      value={formData.programOfStudyName || ''}
                      onChange={e => {
                        const setName = e.target.value;
                        setFormData({ ...formData, programOfStudyName: setName });
                        
                        const selectedSet = courseSets.find(s => s.name === setName);
                        if (selectedSet) {
                           const existingCodes = (formData.programCourses || []).map(c => c.code);
                           const newCourses = selectedSet.courses
                             .filter(code => !existingCodes.includes(code))
                             .map(code => {
                               const stdCourse = standardCourses.find(c => c.code === code);
                               return {
                                 semester: '',
                                 code: code,
                                 title: stdCourse ? stdCourse.title : '',
                                 credits: stdCourse ? stdCourse.credits : '',
                                 status: 'Not Started' as const
                               };
                             });
                           
                           if (newCourses.length > 0) {
                             setFormData(prev => ({
                               ...prev,
                               programOfStudyName: setName,
                               programCourses: [...(prev.programCourses || []), ...newCourses]
                             }));
                           }
                        }
                      }}
                      className="px-3 py-1 bg-white border border-gray-250 rounded-lg text-xs font-bold focus:outline-tu-red min-w-[150px]"
                    >
                      <option value="">- เลือกชุดวิชา -</option>
                      {courseSets.map(s => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                      {!courseSets.some(s => s.name === formData.programOfStudyName) && formData.programOfStudyName && (
                        <option value={formData.programOfStudyName}>{formData.programOfStudyName}</option>
                      )}
                    </select>
                    {(formData.programCourses && formData.programCourses.length > 0) && (
                      <button
                        onClick={() => {
                          if (window.confirm('คุณต้องการล้างวิชาทั้งหมดในแผนการศึกษานี้ใช่หรือไม่?')) {
                            setFormData(prev => ({
                              ...prev,
                              programOfStudyName: '',
                              programCourses: []
                            }));
                          }
                        }}
                        className="px-2 py-1 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded text-xs transition border border-gray-200"
                        title="ล้างวิชาทั้งหมด (Clear Courses)"
                      >
                        ล้างวิชา
                      </button>
                    )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {(formData.programCourses || []).map((course, idx) => (
                    <div key={idx} className="p-3 bg-white border border-gray-150 rounded-xl relative grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <button
                        onClick={() => {
                          const updated = (formData.programCourses || []).filter((_, i) => i !== idx);
                          setFormData({ ...formData, programCourses: updated });
                        }}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                        title="Remove Course"
                      >
                        <Trash2 size={13} />
                      </button>

                      <div className="sm:col-span-2">
                        <label className="text-[9px] font-bold text-gray-400 block mb-0.5">Semester/Year</label>
                        <select
                          value={course.semester}
                          onChange={e => {
                            const updated = [...(formData.programCourses || [])];
                            updated[idx].semester = e.target.value;
                            setFormData({ ...formData, programCourses: updated });
                          }}
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-semibold focus:outline-tu-red"
                        >
                          <option value="">- ระบุ -</option>
                          {semesters.map(sem => (
                            <option key={sem} value={sem}>{sem}</option>
                          ))}
                          {!semesters.includes(course.semester) && course.semester && (
                            <option value={course.semester}>{course.semester}</option>
                          )}
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[9px] font-bold text-gray-400 block mb-0.5">Course Code</label>
                        <select
                          value={course.code}
                          onChange={e => {
                            const updated = [...(formData.programCourses || [])];
                            const selectedCode = e.target.value;
                            const stdCourse = standardCourses.find(c => c.code === selectedCode);
                            updated[idx].code = selectedCode;
                            if (stdCourse) {
                              updated[idx].title = stdCourse.title;
                              updated[idx].credits = stdCourse.credits;
                            } else if (!selectedCode) {
                              updated[idx].title = '';
                              updated[idx].credits = '';
                            }
                            setFormData({ ...formData, programCourses: updated });
                          }}
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-mono font-bold focus:outline-tu-red"
                        >
                          <option value="">- เลือกรหัสวิชา -</option>
                          {standardCourses.map(c => {
                             const isAlreadyAdded = (formData.programCourses || []).some((pc, i) => i !== idx && pc.code === c.code);
                             return (
                               <option key={c.code} value={c.code} disabled={isAlreadyAdded}>
                                 {c.code}
                               </option>
                             );
                          })}
                          {!standardCourses.some(c => c.code === course.code) && course.code && (
                            <option value={course.code}>{course.code}</option>
                          )}
                        </select>
                      </div>

                      <div className="sm:col-span-4">
                        <label className="text-[9px] font-bold text-gray-400 block mb-0.5">Course Title (ชื่อวิชาภาษาอังกฤษ)</label>
                        <input
                          type="text"
                          value={course.title}
                          onChange={e => {
                            const updated = [...(formData.programCourses || [])];
                            updated[idx].title = e.target.value;
                            setFormData({ ...formData, programCourses: updated });
                          }}
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-tu-red"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="text-[9px] font-bold text-gray-400 block mb-0.5">Credits</label>
                        <input
                          type="text"
                          value={course.credits}
                          onChange={e => {
                            const updated = [...(formData.programCourses || [])];
                            updated[idx].credits = e.target.value;
                            setFormData({ ...formData, programCourses: updated });
                          }}
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-semibold text-center font-mono focus:outline-tu-red"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[9px] font-bold text-gray-400 block mb-0.5">Status</label>
                        <select
                          value={course.status}
                          onChange={e => {
                            const updated = [...(formData.programCourses || [])];
                            updated[idx].status = e.target.value as 'Not Started' | 'In Progress' | 'Completed';
                            setFormData({ ...formData, programCourses: updated });
                          }}
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-semibold text-gray-700"
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      const updated = [...(formData.programCourses || []), { semester: '', code: '', title: '', credits: '', status: 'Not Started' as const }];
                      setFormData({ ...formData, programCourses: updated });
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-dashed border-gray-300 hover:border-tu-red hover:text-tu-red text-gray-500 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>เพิ่มแถววิชาเรียน (Add Course Row)</span>
                  </button>
                </div>
              </div>

            </div>

            {/* 2.2 Doctoral Milestones Timeline */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <Calendar size={16} className="text-tu-red" />
                  <span>2.2 Doctoral Milestones Timeline (กรอบเวลาความก้าวหน้าตามเกณฑ์)</span>
                </h4>
                <p className="text-[10px] text-gray-400">กรุณาระบุสถานะ แผนการดำเนินการ และวันที่จริงของเกณฑ์โครงสร้างหลักสูตรพยาบาลศาสตรดุษฎีบัณฑิต</p>
              </div>
              
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex items-start gap-2.5 text-xs text-amber-800 leading-relaxed mb-4">
                <Sparkles size={16} className="shrink-0 mt-0.5 text-tu-gold" />
                <span>
                  ทำเครื่องหมายสถานะเป็น <strong>Completed</strong> เมื่อคุณบรรลุเงื่อนไขนั้นๆ เพื่อให้ระบบประมวลผลความก้าวหน้าบนแดชบอร์ดอย่างถูกต้อง
                </span>
              </div>

              <div className="space-y-3">
                {isReadOnly ? (
      <ReadOnlyTable data={formData.milestones || []} columns={[
        { header: 'Milestone', key: 'name' },
        { header: 'Target Date', key: 'date' },
        { header: 'Status', key: 'status', render: (val) => <span className={'px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ' + (val.status === 'Completed' ? 'bg-green-100 text-green-700' : val.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700')}>{val.status}</span> }
      ]} />
    ) : (
      formData.milestones.map((milestone, idx) => (
                  <div key={milestone.key} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-tu-red block">MILESTONE {idx + 1}</span>
                      <h4 className="text-sm font-semibold text-gray-800">{milestone.label}</h4>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="w-40">
                        <label className="text-[9px] font-bold text-gray-400 block mb-0.5">Planned/Actual Date</label>
                        <DatePickerField
                          value={milestone.actualDate || milestone.plannedDate}
                          onChange={val => {
                            const updated = [...formData.milestones];
                            if (milestone.status === 'Completed') {
                              updated[idx].actualDate = val;
                            } else {
                              updated[idx].plannedDate = val;
                            }
                            setFormData({ ...formData, milestones: updated });
                          }}
                          className="!py-1 !px-2 text-xs !rounded-lg"
                        />
                      </div>

                      <div className="w-28">
                        <label className="text-[9px] font-bold text-gray-400 block mb-0.5">Status</label>
                        <select
                          value={milestone.status}
                          onChange={e => {
                            const updated = [...formData.milestones];
                            updated[idx].status = e.target.value as 'Not Started' | 'In Progress' | 'Completed';
                            setFormData({ ...formData, milestones: updated });
                          }}
                          className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-semibold text-gray-700"
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>

                      <div className="w-36">
                        <label className="text-[9px] font-bold text-gray-400 block mb-0.5">Remarks</label>
                        <input
                          type="text"
                          placeholder="e.g., Passed first trial"
                          value={milestone.remarks}
                          onChange={e => {
                            const updated = [...formData.milestones];
                            updated[idx].remarks = e.target.value;
                            setFormData({ ...formData, milestones: updated });
                          }}
                          className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))
    )}
              </div>
            </div>

            {/* 2.3 Personal Learning and Development Plan */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4 mt-6">
              <div className="border-b border-gray-200 pb-2">
                <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <Compass size={16} className="text-tu-red" />
                  <span>2.3 Personal Learning and Development Plan (แผนพัฒนาศักยภาพส่วนบุคคล)</span>
                </h4>
                <p className="text-[10px] text-gray-400">กรุณาระบุเป้าหมายการพัฒนาสมรรถนะการวิจัยและความเป็นนักวิชาการส่วนบุคคล ตลอดแผนการศึกษา</p>
              </div>

              <div className="space-y-4">
                {isReadOnly ? (
      <ReadOnlyTable data={formData.learningPlans || []} columns={[
        { header: 'Competency Area', key: 'competency' },
        { header: 'Description', key: 'description' },
        { header: 'Activities', key: 'activities' },
        { header: 'Target Date', key: 'targetDate' },
        { header: 'Status', key: 'status', render: (val) => <span className={'px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ' + (val.status === 'Completed' ? 'bg-green-100 text-green-700' : val.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700')}>{val.status}</span> }
      ]} />
    ) : (
      (formData.learningPlans || []).map((plan, idx) => (
                  <div key={idx} className="p-4 bg-white border border-gray-150 rounded-xl relative space-y-3">
                    <button
                      onClick={() => {
                        const updated = (formData.learningPlans || []).filter((_, i) => i !== idx);
                        setFormData({ ...formData, learningPlans: updated });
                      }}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                      title="Remove Competency Goal"
                    >
                      <Trash2 size={13} />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-5">
                        <label className="text-[9px] font-bold text-gray-400 block mb-0.5">Competency Area (หัวข้อสมรรถนะ)</label>
                        <input
                          type="text"
                          value={plan.competency}
                          placeholder="e.g., Advanced research methodology"
                          onChange={e => {
                            const updated = [...(formData.learningPlans || [])];
                            updated[idx].competency = e.target.value;
                            setFormData({ ...formData, learningPlans: updated });
                          }}
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-bold text-gray-800"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[9px] font-bold text-gray-400 block mb-0.5">Target Completion Date (กำหนดการ)</label>
                        <DatePickerField
                          value={plan.targetDate}
                          onChange={val => {
                            const updated = [...(formData.learningPlans || [])];
                            updated[idx].targetDate = val;
                            setFormData({ ...formData, learningPlans: updated });
                          }}
                          className="!py-1 !px-2 text-xs !rounded-lg"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="text-[9px] font-bold text-gray-400 block mb-0.5">Status</label>
                        <select
                          value={plan.status}
                          onChange={e => {
                            const updated = [...(formData.learningPlans || [])];
                            updated[idx].status = e.target.value as 'Not Started' | 'In Progress' | 'Completed';
                            setFormData({ ...formData, learningPlans: updated });
                          }}
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-semibold text-gray-700 font-bold"
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-gray-400 block mb-0.5">Description & Goal (วัตถุประสงค์ / เป้าหมาย)</label>
                        <textarea
                          rows={2}
                          value={plan.description}
                          placeholder="What is the objective or outcome to achieve..."
                          onChange={e => {
                            const updated = [...(formData.learningPlans || [])];
                            updated[idx].description = e.target.value;
                            setFormData({ ...formData, learningPlans: updated });
                          }}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-gray-400 block mb-0.5">Planned Activities & Training Details (แผนงานเพื่อบรรลุสมรรถนะ)</label>
                        <textarea
                          rows={2}
                          value={plan.activities}
                          placeholder="e.g., Attend structural equation modeling workshop, write dissertation methodology section..."
                          onChange={e => {
                            const updated = [...(formData.learningPlans || [])];
                            updated[idx].activities = e.target.value;
                            setFormData({ ...formData, learningPlans: updated });
                          }}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))
    )}

                <button
                  onClick={() => {
                    const updated = [...(formData.learningPlans || []), { competency: '', description: '', targetDate: '', status: 'Not Started' as const, activities: '' }];
                    setFormData({ ...formData, learningPlans: updated });
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-dashed border-gray-300 hover:border-tu-red hover:text-tu-red text-gray-500 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Plus size={12} />
                  <span>เพิ่มแผนเป้าหมายสมรรถนะใหม่ (Add New Competency Goal)</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 3: English Language */}
        {/* ------------------------------------------------------------- */}
        {activeSection === 3 && (
          <div className="space-y-6 text-xs text-gray-700">
            <div className="flex items-start gap-3 p-4 bg-sky-50 border border-sky-100 rounded-xl text-sky-800">
              <Info size={16} className="text-sky-600 mt-0.5 shrink-0" />
              <div className="text-xs leading-normal font-medium">
                All PhD students are required to meet the English language proficiency requirement of the program and provide evidence of an approved test score or equivalent requirement specified by the program.
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-700">3.1 Record of English Language Test</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Test Examination Name</label>
                <input
                  type="text"
                  placeholder="e.g., IELTS, TOEFL, TU-GET"
                  value={formData.englishTest.testName}
                  onChange={e => setFormData({
                    ...formData,
                    englishTest: { ...formData.englishTest, testName: e.target.value }
                  })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Score Achieved</label>
                <input
                  type="text"
                  placeholder="e.g., 7.0"
                  value={formData.englishTest.scoreAchieved}
                  onChange={e => setFormData({
                    ...formData,
                    englishTest: { ...formData.englishTest, scoreAchieved: e.target.value }
                  })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Required Minimum Score</label>
                <input
                  type="text"
                  placeholder="e.g., 6.5"
                  value={formData.englishTest.requiredScore}
                  onChange={e => setFormData({
                    ...formData,
                    englishTest: { ...formData.englishTest, requiredScore: e.target.value }
                  })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Date Taken</label>
                <DatePickerField
                  value={formData.englishTest.dateTaken || ''}
                  onChange={val => setFormData({
                    ...formData,
                    englishTest: { ...formData.englishTest, dateTaken: val }
                  })}
                  className="!py-1.5"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Status</label>
                <select
                  value={formData.englishTest.status || 'Not Started'}
                  onChange={e => setFormData({
                    ...formData,
                    englishTest: { ...formData.englishTest, status: e.target.value }
                  })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Evidence / Certificate Link</label>
                <input
                  type="text"
                  placeholder="e.g., Certificate ID / Drive URL"
                  value={formData.englishTest.evidence || ''}
                  onChange={e => setFormData({
                    ...formData,
                    englishTest: { ...formData.englishTest, evidence: e.target.value }
                  })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-t border-gray-100 pt-5">
                <h3 className="text-sm font-bold text-gray-700">3.2 English Development Activities</h3>
                <button
                  onClick={addEnglishActivity}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-tu-red text-gray-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Plus size={12} />
                  Add English Training Course Row
                </button>
              </div>

              {formData.englishActivities.map((act, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <button
                    onClick={() => {
                      const updated = formData.englishActivities.filter((_, i) => i !== idx);
                      setFormData({ ...formData, englishActivities: updated });
                    }}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Activity Date</label>
                    <DatePickerField
                      value={act.date}
                      onChange={val => {
                        const updated = [...formData.englishActivities];
                        updated[idx].date = val;
                        setFormData({ ...formData, englishActivities: updated });
                      }}
                      className="!py-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Course / Activity Title</label>
                    <input
                      type="text"
                      value={act.activity}
                      placeholder="e.g., Academic Writing Course"
                      onChange={e => {
                        const updated = [...formData.englishActivities];
                        updated[idx].activity = e.target.value;
                        setFormData({ ...formData, englishActivities: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Organized By</label>
                    <input
                      type="text"
                      value={act.organizer}
                      placeholder="e.g., TU Language Institute"
                      onChange={e => {
                        const updated = [...formData.englishActivities];
                        updated[idx].organizer = e.target.value;
                        setFormData({ ...formData, englishActivities: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Certificate Number / Evidence Link</label>
                    <input
                      type="text"
                      value={act.evidence}
                      placeholder="e.g., Cert ID: 90241"
                      onChange={e => {
                        const updated = [...formData.englishActivities];
                        updated[idx].evidence = e.target.value;
                        setFormData({ ...formData, englishActivities: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-5">
              <label className="text-xs font-bold text-gray-700 block">3.3 Reflection on English Development</label>
              <textarea
                rows={3}
                placeholder="Discuss how your English enhancement activities positively supported your scholarly writing and dissertation work..."
                value={formData.englishReflection}
                onChange={e => setFormData({ ...formData, englishReflection: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-5">
              <h3 className="text-sm font-bold text-gray-700">3.4 Verification</h3>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Advisor / Program Coordinator Comments</label>
                  <textarea
                    rows={3}
                    placeholder="Provide evaluation or comments on candidate's English proficiency progress..."
                    value={formData.englishVerification?.comments || ''}
                    onChange={e => setFormData({
                      ...formData,
                      englishVerification: {
                        ...(formData.englishVerification || { comments: '', name: '', signatureDate: '' }),
                        comments: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Assistant Professor Dr. Wongchan Petpichetchian"
                      value={formData.englishVerification?.name || ''}
                      onChange={e => setFormData({
                        ...formData,
                        englishVerification: {
                          ...(formData.englishVerification || { comments: '', name: '', signatureDate: '' }),
                          name: e.target.value
                        }
                      })}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Signature and Date</label>
                    <DatePickerField
                      value={formData.englishVerification?.signatureDate || ''}
                      onChange={val => setFormData({
                        ...formData,
                        englishVerification: {
                          ...(formData.englishVerification || { comments: '', name: '', signatureDate: '' }),
                          signatureDate: val
                        }
                      })}
                      className="!py-1.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 4: Coursework completed */}
        {/* ------------------------------------------------------------- */}
        {activeSection === 4 && (
          <div className="space-y-6 text-xs text-gray-700">
            {/* 4.1 Completed Courses */}
            <div className="space-y-4">
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
    )}
            </div>

            {/* 4.2 Key Learning from Coursework */}
            <div className="space-y-4 border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">4.2 Key Learning from Coursework</h3>
                <button
                  onClick={addKeyLearning}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-tu-red text-gray-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Plus size={12} />
                  Add Key Learning Row
                </button>
              </div>

              {isReadOnly ? (
      <ReadOnlyTable data={formData.keyLearnings || []} columns={[
        { header: 'Subject / Topic', key: 'subject' },
        { header: 'Key Learning Points', key: 'learning' }
      ]} />
    ) : (
      (formData.keyLearnings || []).map((kl, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => {
                      const updated = (formData.keyLearnings || []).filter((_, i) => i !== idx);
                      setFormData({ ...formData, keyLearnings: updated });
                    }}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Course / Activity</label>
                    <input
                      type="text"
                      placeholder="e.g. NS802: Advanced Gerontology"
                      value={kl.course}
                      onChange={e => {
                        const updated = [...(formData.keyLearnings || [])];
                        updated[idx].course = e.target.value;
                        setFormData({ ...formData, keyLearnings: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Key Learning</label>
                    <textarea
                      rows={2}
                      placeholder="Summarize the key knowledge or skills gained..."
                      value={kl.keyLearning}
                      onChange={e => {
                        const updated = [...(formData.keyLearnings || [])];
                        updated[idx].keyLearning = e.target.value;
                        setFormData({ ...formData, keyLearnings: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Application to Research / Practice</label>
                    <textarea
                      rows={2}
                      placeholder="How does this apply to your dissertation or professional role?"
                      value={kl.application}
                      onChange={e => {
                        const updated = [...(formData.keyLearnings || [])];
                        updated[idx].application = e.target.value;
                        setFormData({ ...formData, keyLearnings: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              ))
    )}
            </div>

            {/* 4.3 Workshops, Training, and Short Courses */}
            <div className="space-y-4 border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">4.3 Workshops, Training, and Short Courses</h3>
                <button
                  onClick={addWorkshop}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-tu-red text-gray-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Plus size={12} />
                  Add Workshop Row
                </button>
              </div>

              {isReadOnly ? (
      <ReadOnlyTable data={formData.workshops || []} columns={[
        { header: 'Date', key: 'date' },
        { header: 'Workshop / Training Topic', key: 'topic' },
        { header: 'Organizer', key: 'organizer' }
      ]} />
    ) : (
      (formData.workshops || []).map((ws, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <button
                    onClick={() => {
                      const updated = (formData.workshops || []).filter((_, i) => i !== idx);
                      setFormData({ ...formData, workshops: updated });
                    }}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Date</label>
                    <DatePickerField
                      value={ws.date}
                      onChange={val => {
                        const updated = [...(formData.workshops || [])];
                        updated[idx].date = val;
                        setFormData({ ...formData, workshops: updated });
                      }}
                      className="!py-1.5"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Workshop / Course Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Research Ethics in Human Subjects"
                      value={ws.title}
                      onChange={e => {
                        const updated = [...(formData.workshops || [])];
                        updated[idx].title = e.target.value;
                        setFormData({ ...formData, workshops: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Organizer</label>
                    <input
                      type="text"
                      placeholder="e.g. Faculty of Nursing, TU"
                      value={ws.organizer}
                      onChange={e => {
                        const updated = [...(formData.workshops || [])];
                        updated[idx].organizer = e.target.value;
                        setFormData({ ...formData, workshops: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Key Learning / Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Completed, Learnt IRB guidelines"
                      value={ws.keyLearning}
                      onChange={e => {
                        const updated = [...(formData.workshops || [])];
                        updated[idx].keyLearning = e.target.value;
                        setFormData({ ...formData, workshops: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              ))
    )}
            </div>

            {/* 4.4 Certifications - Pull from Certificates tab/sheet */}
            <div className="space-y-4 border-t border-gray-100 pt-5">
              <div>
                <h3 className="text-sm font-bold text-gray-700">4.4 Certifications</h3>
                <p className="text-xs text-gray-400 mt-0.5">Automated synchronization: Displaying all approved/uploaded credentials from your Certificates portfolio tab.</p>
              </div>

              {(() => {
                const myCerts = certificates.filter(
                  c => c.StudentID === (currentUser.StudentID || '6601010024')
                );

                if (myCerts.length === 0) {
                  return (
                    <div className="p-6 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      No certificates recorded in the "Certificates" worksheet yet. Please upload them using the main Certificate manager tab.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {myCerts.map((cert) => {
                      let files: { name: string; url: string }[] = [];
                      if (cert.ImageURL) {
                        const trimmed = cert.ImageURL.trim();
                        if (trimmed.startsWith('[')) {
                          try {
                            files = JSON.parse(trimmed);
                          } catch(e) {
                            files = [{ name: cert.Name || 'Attachment', url: cert.ImageURL }];
                          }
                        } else {
                          files = [{ name: cert.Name || 'Attachment', url: cert.ImageURL }];
                        }
                      }
                      
                      const firstFile = files[0];
                      let coverUrl = 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80';
                      if (firstFile && firstFile.url) {
                        const url = firstFile.url;
                        const name = firstFile.name || '';
                        const isImg = /\.(png|jpe?g|gif|webp)$/i.test(name) ||
                                      /\.(png|jpe?g|gif|webp)$/i.test(url.split('?')[0]) ||
                                      url.includes('images.unsplash.com') ||
                                      url.startsWith('LOCAL_FILE_') ||
                                      url.startsWith('data:image/') ||
                                      url.includes('lh3.googleusercontent.com');
                        if (isImg) {
                          coverUrl = resolveFileUrl(url);
                        }
                      }

                      return (
                        <div key={cert.CertID} className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs flex gap-4 items-start">
                          <img
                            src={coverUrl}
                            alt={cert.Name}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 rounded-lg object-cover bg-gray-50 border border-gray-100 shrink-0"
                          />
                          <div className="space-y-1 min-w-0">
                            <h4 className="font-bold text-xs text-gray-800 line-clamp-2">{cert.Name}</h4>
                            <div className="flex flex-wrap items-center gap-2 text-[10px]">
                              <span className="text-gray-400 font-mono">{formatDisplayDate(cert.Date)}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-tu-red italic truncate max-w-[150px]">{cert.Category}</span>
                            </div>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase mt-1 ${
                              cert.Status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                              cert.Status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              'bg-red-50 text-red-600 border border-red-100'
                            }`}>
                              {cert.Status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 5: Dissertation Progress */}
        {/* ------------------------------------------------------------- */}
        {/* ------------------------------------------------------------- */}
        {/* SECTION 5: Dissertation Progress */}
        {/* ------------------------------------------------------------- */}
        {activeSection === 5 && (
          <div className="space-y-6 text-xs text-gray-700">
            {/* 5.1 Development of Research Topic */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-700">5.1 Development of Research Topic</h3>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Describe the evolution and development of your research topic / area of focus</label>
                <textarea
                  rows={3}
                  placeholder="Describe how your dissertation topic was conceived, refined, and developed..."
                  value={formData.dissertationInfo.researchTopic || ''}
                  onChange={e => setFormData({
                    ...formData,
                    dissertationInfo: { ...formData.dissertationInfo, researchTopic: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* 5.2 Dissertation Scope & Proposal */}
            <div className="space-y-4 border-t border-gray-100 pt-5">
              <h3 className="text-sm font-bold text-gray-700">5.2 Dissertation Scope & Proposal</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Dissertation Working Title</label>
                  <input
                    type="text"
                    placeholder="Enter full working dissertation title..."
                    value={formData.dissertationInfo.title || ''}
                    onChange={e => setFormData({
                      ...formData,
                      dissertationInfo: { ...formData.dissertationInfo, title: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Background and Significance of Dissertation Research</label>
                  <textarea
                    rows={2}
                    value={formData.dissertationInfo.background}
                    onChange={e => setFormData({
                      ...formData,
                      dissertationInfo: { ...formData.dissertationInfo, background: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Research Problem & Statement</label>
                    <textarea
                      rows={2}
                      value={formData.dissertationInfo.problem}
                      onChange={e => setFormData({
                        ...formData,
                        dissertationInfo: { ...formData.dissertationInfo, problem: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Specific Research Objectives</label>
                    <textarea
                      rows={2}
                      value={formData.dissertationInfo.objectives}
                      onChange={e => setFormData({
                        ...formData,
                        dissertationInfo: { ...formData.dissertationInfo, objectives: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Research Questions or Hypotheses</label>
                    <textarea
                      rows={2}
                      value={formData.dissertationInfo.hypotheses || ''}
                      onChange={e => setFormData({
                        ...formData,
                        dissertationInfo: { ...formData.dissertationInfo, hypotheses: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Conceptual Framework or Theoretical Model</label>
                    <textarea
                      rows={2}
                      value={formData.dissertationInfo.conceptualFramework}
                      onChange={e => setFormData({
                        ...formData,
                        dissertationInfo: { ...formData.dissertationInfo, conceptualFramework: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Research Methodology Overview</label>
                  <textarea
                    rows={2}
                    value={formData.dissertationInfo.methodology}
                    onChange={e => setFormData({
                      ...formData,
                      dissertationInfo: { ...formData.dissertationInfo, methodology: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 5.3 Dissertation Progress Record */}
            <div className="space-y-4 border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">5.3 Dissertation Progress Record</h3>
                <button
                  onClick={addDissertationProgress}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-tu-red text-gray-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Plus size={12} />
                  Add Progress Row
                </button>
              </div>

              {isReadOnly ? (
      <ReadOnlyTable data={formData.dissertationProgress || []} columns={[
        { header: 'Activity / Milestone', key: 'activity' },
        { header: 'Date', key: 'date' },
        { header: 'Progress', key: 'progress' },
        { header: 'Obstacles / Solutions', key: 'obstacles' }
      ]} />
    ) : (
      (formData.dissertationProgress || []).map((prog, idx) => {
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
                      {configOptions.filter(o => o.OptionType.trim() === 'ProgressActivity').map(opt => (
                        <option key={opt.id} value={opt.OptionValue}>{opt.OptionValue}</option>
                      ))}
                    </select>
                  </div>

                  <div>
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

                  <div className="md:col-span-1 mt-2">
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Progress Evidence (Google Drive)</label>
                    <FileUploader isReadOnly={isReadOnly}
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
              })
    )}
            </div>

            {/* 5.4 Doctoral Advisory Committee Meetings */}
            <div className="space-y-4 border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">5.4 Doctoral Advisory Committee Meetings</h3>
                <button
                  onClick={addAdvisorMeeting}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-tu-red text-gray-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Plus size={12} />
                  Add Advisory Meeting Row
                </button>
              </div>

              {isReadOnly ? (
      <ReadOnlyTable data={formData.advisorMeetings || []} columns={[
        { header: 'Meeting Date', key: 'date' },
        { header: 'Topic(s) Discussed', key: 'topic' },
        { header: 'Summary of Advice / Outcomes', key: 'summary' },
        { header: 'Next Steps', key: 'nextSteps' }
      ]} />
    ) : (
      formData.advisorMeetings.map((meet, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <button
                    onClick={() => {
                      const updated = formData.advisorMeetings.filter((_, i) => i !== idx);
                      setFormData({ ...formData, advisorMeetings: updated });
                    }}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Meeting Date</label>
                    <DatePickerField
                      value={meet.date}
                      onChange={val => {
                        const updated = [...formData.advisorMeetings];
                        updated[idx].date = val;
                        setFormData({ ...formData, advisorMeetings: updated });
                      }}
                      className="!py-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Advisors Attending</label>
                    <input
                      type="text"
                      value={meet.persons}
                      placeholder="e.g., Assoc. Prof. Dr. Sarah"
                      onChange={e => {
                        const updated = [...formData.advisorMeetings];
                        updated[idx].persons = e.target.value;
                        setFormData({ ...formData, advisorMeetings: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Key Issues Discussed</label>
                    <input
                      type="text"
                      value={meet.issues}
                      placeholder="e.g., Tools validation and sample group"
                      onChange={e => {
                        const updated = [...formData.advisorMeetings];
                        updated[idx].issues = e.target.value;
                        setFormData({ ...formData, advisorMeetings: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Action Points & Next Steps</label>
                    <input
                      type="text"
                      value={meet.actionPoints}
                      placeholder="e.g., Complete IRB review forms"
                      onChange={e => {
                        const updated = [...formData.advisorMeetings];
                        updated[idx].actionPoints = e.target.value;
                        setFormData({ ...formData, advisorMeetings: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              ))
    )}
            </div>

            {/* 5.5 Ethics and Research Governance */}
            <div className="space-y-4 border-t border-gray-100 pt-5">
              <h3 className="text-sm font-bold text-gray-700">5.5 Ethics and Research Governance</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Ethics Protocol Submission Date</label>
                  <DatePickerField
                    value={formData.ethicsGovernance?.dateApplied || ''}
                    onChange={val => setFormData({
                      ...formData,
                      ethicsGovernance: {
                        ...(formData.ethicsGovernance || { dateApplied: '', dateApproved: '', approvalNumber: '', amendments: '', confidentiality: '' }),
                        dateApplied: val
                      }
                    })}
                    className="!py-1.5"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Ethics Approval Date</label>
                  <DatePickerField
                    value={formData.ethicsGovernance?.dateApproved || ''}
                    onChange={val => setFormData({
                      ...formData,
                      ethicsGovernance: {
                        ...(formData.ethicsGovernance || { dateApplied: '', dateApproved: '', approvalNumber: '', amendments: '', confidentiality: '' }),
                        dateApproved: val
                      }
                    })}
                    className="!py-1.5"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Ethics COA Approval Number</label>
                  <input
                    type="text"
                    placeholder="e.g. COA No. 045/2025"
                    value={formData.ethicsGovernance?.approvalNumber || ''}
                    onChange={e => setFormData({
                      ...formData,
                      ethicsGovernance: {
                        ...(formData.ethicsGovernance || { dateApplied: '', dateApproved: '', approvalNumber: '', amendments: '', confidentiality: '' }),
                        approvalNumber: e.target.value
                      }
                    })}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Protocol Amendments / Status Updates</label>
                  <textarea
                    rows={2}
                    placeholder="Describe any approved amendments or protocols updates..."
                    value={formData.ethicsGovernance?.amendments || ''}
                    onChange={e => setFormData({
                      ...formData,
                      ethicsGovernance: {
                        ...(formData.ethicsGovernance || { dateApplied: '', dateApproved: '', approvalNumber: '', amendments: '', confidentiality: '' }),
                        amendments: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Data Management & Subject Confidentiality</label>
                  <textarea
                    rows={2}
                    placeholder="Specify storage location of research data and consent security practices..."
                    value={formData.ethicsGovernance?.confidentiality || ''}
                    onChange={e => setFormData({
                      ...formData,
                      ethicsGovernance: {
                        ...(formData.ethicsGovernance || { dateApplied: '', dateApproved: '', approvalNumber: '', amendments: '', confidentiality: '' }),
                        confidentiality: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 5.6 Challenges Encountered and Solutions */}
            <div className="space-y-4 border-t border-gray-100 pt-5">
              <h3 className="text-sm font-bold text-gray-700">5.6 Challenges Encountered and Solutions</h3>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Reflect on the research obstacles, delays, design challenges and your resolutions</label>
                <textarea
                  rows={3}
                  placeholder="Record your reflections, scientific challenges, recruiting delays or methodology pivots, and the solutions implemented..."
                  value={formData.researchReflection || ''}
                  onChange={e => setFormData({
                    ...formData,
                    researchReflection: e.target.value
                  })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 6: Research Experience 180 Hours */}
        {/* ------------------------------------------------------------- */}
        {activeSection === 6 && (
          <div className="space-y-6 text-xs text-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-700">6.1 Accumulated Research Experience Log (180 Hours Minimum)</h3>
                <p className="text-xs text-gray-400 font-normal">Record research assistantships, collaborative publications, or fieldwork project tasks.</p>
              </div>
              <button
                onClick={addResearchExp}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-tu-red text-gray-600 rounded-lg text-xs font-semibold transition font-mono cursor-pointer"
              >
                <Plus size={12} />
                + ADD HOURS
              </button>
            </div>

            {isReadOnly ? (
      <ReadOnlyTable data={formData.researchExperience || []} columns={[
        { header: 'Research Title', key: 'title' },
        { header: 'Role', key: 'role' },
        { header: 'Year', key: 'year' },
        { header: 'Funding', key: 'funding' }
      ]} />
    ) : (
      formData.researchExperience.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative grid grid-cols-1 sm:grid-cols-5 gap-4">
                <button
                  onClick={() => {
                    const updated = formData.researchExperience.filter((_, i) => i !== idx);
                    setFormData({ ...formData, researchExperience: updated });
                  }}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Task Date</label>
                  <DatePickerField
                    value={item.date}
                    onChange={val => {
                      const updated = [...formData.researchExperience];
                      updated[idx].date = val;
                      setFormData({ ...formData, researchExperience: updated });
                    }}
                    className="!py-1.5"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Research Activities Performed</label>
                  <input
                    type="text"
                    value={item.description}
                    placeholder="e.g., Data cleaning, stats, review literature"
                    onChange={e => {
                      const updated = [...formData.researchExperience];
                      updated[idx].description = e.target.value;
                      setFormData({ ...formData, researchExperience: updated });
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Worked Hours</label>
                  <input
                    type="number"
                    value={item.Hours || item.hours}
                    onChange={e => {
                      const updated = [...formData.researchExperience];
                      const val = Number(e.target.value);
                      updated[idx].Hours = val;
                      updated[idx].hours = val;
                      setFormData({ ...formData, researchExperience: updated });
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Supervising Researcher</label>
                  <input
                    type="text"
                    value={item.supervisor}
                    onChange={e => {
                      const updated = [...formData.researchExperience];
                      updated[idx].supervisor = e.target.value;
                      setFormData({ ...formData, researchExperience: updated });
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            ))
    )}

            <div className="space-y-2 border-t border-gray-100 pt-5">
              <label className="text-xs font-bold text-gray-700 block">6.2 Reflective Insight on Research Competence</label>
              <textarea
                rows={3}
                placeholder="Discuss methodological, technical, or analytical competencies developed through your assistantship..."
                value={formData.researchReflection}
                onChange={e => setFormData({ ...formData, researchReflection: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
              />
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 7: Scholarly Output (Publications) */}
        {/* ------------------------------------------------------------- */}
        {activeSection === 7 && (
          <div className="space-y-8 text-xs text-gray-700">
            {/* 7.1 Conference Presentations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">7.1 Conference Presentations</h3>
                <button
                  onClick={addConferencePresentation}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-tu-red text-gray-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Plus size={12} />
                  Add Presentation
                </button>
              </div>

              {isReadOnly ? (
      <ReadOnlyTable data={formData.conferencePresentations || []} columns={[
        { header: 'Date', key: 'date' },
        { header: 'Conference Name', key: 'conference' },
        { header: 'Title of Presentation', key: 'title' },
        { header: 'Level', key: 'level' }
      ]} />
    ) : (
      (formData.conferencePresentations || []).map((conf, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <button
                    onClick={() => {
                      const updated = formData.conferencePresentations.filter((_, i) => i !== idx);
                      setFormData({ ...formData, conferencePresentations: updated });
                    }}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Date</label>
                    <DatePickerField
                      value={conf.date}
                      onChange={val => {
                        const updated = [...formData.conferencePresentations];
                        updated[idx].date = val;
                        setFormData({ ...formData, conferencePresentations: updated });
                      }}
                      className="!py-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Presentation Title</label>
                    <input
                      type="text"
                      value={conf.title}
                      placeholder="e.g., Quality of Life in Older Adults..."
                      onChange={e => {
                        const updated = [...formData.conferencePresentations];
                        updated[idx].title = e.target.value;
                        setFormData({ ...formData, conferencePresentations: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Conference Name</label>
                    <input
                      type="text"
                      value={conf.conference}
                      placeholder="e.g., International Nursing Congress 2025"
                      onChange={e => {
                        const updated = [...formData.conferencePresentations];
                        updated[idx].conference = e.target.value;
                        setFormData({ ...formData, conferencePresentations: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Type / Venue</label>
                    <div className="flex gap-2">
                      <select
                        value={conf.type}
                        onChange={e => {
                          const updated = [...formData.conferencePresentations];
                          updated[idx].type = e.target.value;
                          setFormData({ ...formData, conferencePresentations: updated });
                        }}
                        className="px-2 py-1.5 bg-white border border-gray-200 rounded text-xs"
                      >
                        <option value="Oral">Oral</option>
                        <option value="Poster">Poster</option>
                        <option value="Keynote">Keynote</option>
                      </select>
                      <input
                        type="text"
                        value={conf.venue}
                        placeholder="e.g., Bangkok"
                        onChange={e => {
                          const updated = [...formData.conferencePresentations];
                          updated[idx].venue = e.target.value;
                          setFormData({ ...formData, conferencePresentations: updated });
                        }}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))
    )}
            </div>

            {/* 7.2 Peer-Reviewed Journal Publications */}
            <div className="space-y-4 border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">7.2 Peer-Reviewed Journal Publications</h3>
                <button
                  onClick={addPublication}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-tu-red text-gray-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Plus size={12} />
                  Add Publication
                </button>
              </div>

              {isReadOnly ? (
      <ReadOnlyTable data={formData.publications || []} columns={[
        { header: 'Publication Type', key: 'type' },
        { header: 'Title', key: 'title' },
        { header: 'Authors', key: 'authors' },
        { header: 'Journal / Publisher', key: 'journal' },
        { header: 'Year', key: 'year' },
        { header: 'Quartile / Impact', key: 'quartile' }
      ]} />
    ) : (
      (formData.publications || []).map((pub, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <button
                    onClick={() => {
                      const updated = formData.publications.filter((_, i) => i !== idx);
                      setFormData({ ...formData, publications: updated });
                    }}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Publication Year</label>
                    <input
                      type="text"
                      value={pub.year}
                      placeholder="e.g., 2025"
                      onChange={e => {
                        const updated = [...formData.publications];
                        updated[idx].year = e.target.value;
                        setFormData({ ...formData, publications: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Article/Paper Title</label>
                    <input
                      type="text"
                      value={pub.title}
                      placeholder="e.g., Psychometric Evaluation of Nursing Practices..."
                      onChange={e => {
                        const updated = [...formData.publications];
                        updated[idx].title = e.target.value;
                        setFormData({ ...formData, publications: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Journal Name / DOI link</label>
                    <input
                      type="text"
                      value={pub.journal}
                      placeholder="e.g., Journal of Nursing Science / https://doi.org/10..."
                      onChange={e => {
                        const updated = [...formData.publications];
                        updated[idx].journal = e.target.value;
                        setFormData({ ...formData, publications: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              ))
    )}
            </div>

            {/* 7.3 Manuscripts in Preparation */}
            <div className="space-y-4 border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">7.3 Manuscripts in Preparation</h3>
                <button
                  onClick={addManuscript}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-tu-red text-gray-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Plus size={12} />
                  Add Manuscript
                </button>
              </div>

              {isReadOnly ? (
      <ReadOnlyTable data={formData.manuscripts || []} columns={[
        { header: 'Date', key: 'date' },
        { header: 'Title', key: 'title' },
        { header: 'Target Journal', key: 'journal' },
        { header: 'Status', key: 'status' }
      ]} />
    ) : (
      (formData.manuscripts || []).map((msc, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <button
                    onClick={() => {
                      const updated = formData.manuscripts.filter((_, i) => i !== idx);
                      setFormData({ ...formData, manuscripts: updated });
                    }}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Working Title</label>
                    <input
                      type="text"
                      value={msc.title}
                      placeholder="e.g., Determinants of Healthy Aging..."
                      onChange={e => {
                        const updated = [...formData.manuscripts];
                        updated[idx].title = e.target.value;
                        setFormData({ ...formData, manuscripts: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Target Journal</label>
                    <input
                      type="text"
                      value={msc.journal}
                      placeholder="e.g., International Journal of Nursing Studies"
                      onChange={e => {
                        const updated = [...formData.manuscripts];
                        updated[idx].journal = e.target.value;
                        setFormData({ ...formData, manuscripts: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Stage & Planned Submission Date</label>
                    <div className="flex gap-2">
                      <select
                        value={msc.stage}
                        onChange={e => {
                          const updated = [...formData.manuscripts];
                          updated[idx].stage = e.target.value;
                          setFormData({ ...formData, manuscripts: updated });
                        }}
                        className="px-2 py-1.5 bg-white border border-gray-200 rounded text-xs"
                      >
                        <option value="Drafting">Drafting</option>
                        <option value="Reviewing">Reviewing</option>
                        <option value="Ready">Ready</option>
                        <option value="Submitted">Submitted</option>
                      </select>
                      <DatePickerField
                        value={msc.plannedSubmission}
                        onChange={val => {
                          const updated = [...formData.manuscripts];
                          updated[idx].plannedSubmission = val;
                          setFormData({ ...formData, manuscripts: updated });
                        }}
                        className="!py-1.5"
                      />
                    </div>
                  </div>
                </div>
              ))
    )}
            </div>

            {/* 7.4 Research Grants and Funding */}
            <div className="space-y-4 border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">7.4 Research Grants and Funding</h3>
                <button
                  onClick={addGrant}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-tu-red text-gray-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Plus size={12} />
                  Add Grant
                </button>
              </div>

              {isReadOnly ? (
      <ReadOnlyTable data={formData.grants || []} columns={[
        { header: 'Year', key: 'year' },
        { header: 'Grant Name / Source', key: 'name' },
        { header: 'Amount', key: 'amount' },
        { header: 'Role', key: 'role' }
      ]} />
    ) : (
      (formData.grants || []).map((gr, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <button
                    onClick={() => {
                      const updated = formData.grants.filter((_, i) => i !== idx);
                      setFormData({ ...formData, grants: updated });
                    }}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Grant Title / Project Name</label>
                    <input
                      type="text"
                      value={gr.title}
                      placeholder="e.g., Healthcare Innovations in Remote Areas..."
                      onChange={e => {
                        const updated = [...formData.grants];
                        updated[idx].title = e.target.value;
                        setFormData({ ...formData, grants: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Funding Source / Sponsor</label>
                    <input
                      type="text"
                      value={gr.source}
                      placeholder="e.g., National Research Council of Thailand"
                      onChange={e => {
                        const updated = [...formData.grants];
                        updated[idx].source = e.target.value;
                        setFormData({ ...formData, grants: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Role / Budget / Period</label>
                    <div className="grid grid-cols-3 gap-1">
                      <input
                        type="text"
                        value={gr.role}
                        placeholder="e.g., Researcher"
                        onChange={e => {
                          const updated = [...formData.grants];
                          updated[idx].role = e.target.value;
                          setFormData({ ...formData, grants: updated });
                        }}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs"
                      />
                      <input
                        type="text"
                        value={gr.amount}
                        placeholder="e.g., 100,000 THB"
                        onChange={e => {
                          const updated = [...formData.grants];
                          updated[idx].amount = e.target.value;
                          setFormData({ ...formData, grants: updated });
                        }}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs"
                      />
                      <input
                        type="text"
                        value={gr.period}
                        placeholder="e.g., 2025-2026"
                        onChange={e => {
                          const updated = [...formData.grants];
                          updated[idx].period = e.target.value;
                          setFormData({ ...formData, grants: updated });
                        }}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))
    )}
            </div>

            {/* 7.5 Awards and Recognition */}
            <div className="space-y-4 border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">7.5 Awards and Recognition</h3>
                <button
                  onClick={addAward}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-tu-red text-gray-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Plus size={12} />
                  Add Award
                </button>
              </div>

              {isReadOnly ? (
      <ReadOnlyTable data={formData.awards || []} columns={[
        { header: 'Award / Scholarship', key: 'award' },
        { header: 'Organization', key: 'organization' },
        { header: 'Year', key: 'year' }
      ]} />
    ) : (
      (formData.awards || []).map((aw, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <button
                    onClick={() => {
                      const updated = formData.awards.filter((_, i) => i !== idx);
                      setFormData({ ...formData, awards: updated });
                    }}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Award Date</label>
                    <DatePickerField
                      value={aw.date}
                      onChange={val => {
                        const updated = [...formData.awards];
                        updated[idx].date = val;
                        setFormData({ ...formData, awards: updated });
                      }}
                      className="!py-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Award / Honor Name</label>
                    <input
                      type="text"
                      value={aw.award}
                      placeholder="e.g., Outstanding Student Presenter"
                      onChange={e => {
                        const updated = [...formData.awards];
                        updated[idx].award = e.target.value;
                        setFormData({ ...formData, awards: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Award Organizer / Institution</label>
                    <input
                      type="text"
                      value={aw.organizer}
                      placeholder="e.g., Faculty of Nursing, TU"
                      onChange={e => {
                        const updated = [...formData.awards];
                        updated[idx].organizer = e.target.value;
                        setFormData({ ...formData, awards: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Brief Description</label>
                    <input
                      type="text"
                      value={aw.description}
                      placeholder="e.g., Awarded for highest rated poster presentation..."
                      onChange={e => {
                        const updated = [...formData.awards];
                        updated[idx].description = e.target.value;
                        setFormData({ ...formData, awards: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              ))
    )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 12: Self-Assessment */}
        {/* ------------------------------------------------------------- */}
        {activeSection === 12 && (
          <div className="space-y-6 text-xs text-gray-700">
            <h3 className="text-sm font-bold text-gray-700 mb-4">12.1 Self-Assessment of Core Doctoral Competencies</h3>
            
            <div className="space-y-3">
              {isReadOnly ? (
      <ReadOnlyTable data={formData.competencySelfAssessment || []} columns={[
        { header: 'Competency Area', key: 'area' },
        { header: 'Score (1-5)', key: 'score' },
        { header: 'Evidence / Example', key: 'evidence' }
      ]} />
    ) : (
      formData.competencySelfAssessment.map((comp, idx) => (
                <div key={idx} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-800">{comp.competency}</h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={comp.rating}
                      onChange={e => {
                        const updated = [...formData.competencySelfAssessment];
                        updated[idx].rating = e.target.value as 'Beginning' | 'Developing' | 'Competent' | 'Proficient';
                        setFormData({ ...formData, competencySelfAssessment: updated });
                      }}
                      className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-semibold text-gray-700 cursor-pointer"
                    >
                      <option value="Beginning">Beginning</option>
                      <option value="Developing">Developing</option>
                      <option value="Competent">Competent</option>
                      <option value="Proficient">Proficient</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Provide supporting evidence/remarks..."
                      value={comp.remarks}
                      onChange={e => {
                        const updated = [...formData.competencySelfAssessment];
                        updated[idx].remarks = e.target.value;
                        setFormData({ ...formData, competencySelfAssessment: updated });
                      }}
                      className="w-48 px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                    />
                  </div>
                </div>
              ))
    )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 8: Teaching & Academic Service */}
        {/* ------------------------------------------------------------- */}
        {activeSection === 8 && (
          <div className="space-y-8 text-xs text-gray-700">
            {/* 8.1 Teaching Experience */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">8.1 Teaching Experience</h3>
                <button
                  onClick={addTeachingExperience}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-tu-red text-gray-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Plus size={12} />
                  Add Teaching
                </button>
              </div>

              {isReadOnly ? (
      <ReadOnlyTable data={formData.teachingExperiences || []} columns={[
        { header: 'Course Name', key: 'course' },
        { header: 'Program Level', key: 'level' },
        { header: 'Role', key: 'role' },
        { header: 'Year / Semester', key: 'year' },
        { header: 'Hours', key: 'hours' }
      ]} />
    ) : (
      (formData.teachingExperiences || []).map((tch, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <button
                    onClick={() => {
                      const updated = formData.teachingExperiences.filter((_, i) => i !== idx);
                      setFormData({ ...formData, teachingExperiences: updated });
                    }}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Semester / Year</label>
                    <input
                      type="text"
                      value={tch.semester}
                      placeholder="e.g., 1/2025"
                      onChange={e => {
                        const updated = [...formData.teachingExperiences];
                        updated[idx].semester = e.target.value;
                        setFormData({ ...formData, teachingExperiences: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Course Name / Topic</label>
                    <input
                      type="text"
                      value={tch.course}
                      placeholder="e.g., Fundamentals of Nursing"
                      onChange={e => {
                        const updated = [...formData.teachingExperiences];
                        updated[idx].course = e.target.value;
                        setFormData({ ...formData, teachingExperiences: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Role & Student Level</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tch.role}
                        placeholder="e.g., Assist Lecturer"
                        onChange={e => {
                          const updated = [...formData.teachingExperiences];
                          updated[idx].role = e.target.value;
                          setFormData({ ...formData, teachingExperiences: updated });
                        }}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs"
                      />
                      <select
                        value={tch.studentLevel}
                        onChange={e => {
                          const updated = [...formData.teachingExperiences];
                          updated[idx].studentLevel = e.target.value;
                          setFormData({ ...formData, teachingExperiences: updated });
                        }}
                        className="px-2 py-1.5 bg-white border border-gray-200 rounded text-xs cursor-pointer"
                      >
                        <option value="Undergraduate">Undergraduate</option>
                        <option value="Master">Master</option>
                        <option value="Doctoral">Doctoral</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Task Description</label>
                    <input
                      type="text"
                      value={tch.description}
                      placeholder="e.g., Prepared lesson plans & graded quizzes"
                      onChange={e => {
                        const updated = [...formData.teachingExperiences];
                        updated[idx].description = e.target.value;
                        setFormData({ ...formData, teachingExperiences: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              ))
    )}
            </div>

            {/* 8.2 Student Supervision or Mentoring */}
            <div className="space-y-4 border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">8.2 Student Supervision or Mentoring</h3>
                <button
                  onClick={addSupervision}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-tu-red text-gray-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Plus size={12} />
                  Add Supervision
                </button>
              </div>

              {isReadOnly ? (
      <ReadOnlyTable data={formData.supervisions || []} columns={[
        { header: 'Student Name / Level', key: 'student' },
        { header: 'Topic / Thesis Title', key: 'topic' },
        { header: 'Role', key: 'role' },
        { header: 'Year', key: 'year' }
      ]} />
    ) : (
      (formData.supervisions || []).map((sup, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <button
                    onClick={() => {
                      const updated = formData.supervisions.filter((_, i) => i !== idx);
                      setFormData({ ...formData, supervisions: updated });
                    }}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Date</label>
                    <DatePickerField
                      value={sup.date}
                      onChange={val => {
                        const updated = [...formData.supervisions];
                        updated[idx].date = val;
                        setFormData({ ...formData, supervisions: updated });
                      }}
                      className="!py-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Type of Mentoring</label>
                    <input
                      type="text"
                      value={sup.type}
                      placeholder="e.g., Thesis Co-Advising"
                      onChange={e => {
                        const updated = [...formData.supervisions];
                        updated[idx].type = e.target.value;
                        setFormData({ ...formData, supervisions: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Student Level</label>
                    <select
                      value={sup.studentLevel}
                      onChange={e => {
                        const updated = [...formData.supervisions];
                        updated[idx].studentLevel = e.target.value;
                        setFormData({ ...formData, supervisions: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs cursor-pointer"
                    >
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Master">Master</option>
                      <option value="Doctoral">Doctoral</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Description / Details</label>
                    <input
                      type="text"
                      value={sup.description}
                      placeholder="e.g., Mentored 3 students on research tools"
                      onChange={e => {
                        const updated = [...formData.supervisions];
                        updated[idx].description = e.target.value;
                        setFormData({ ...formData, supervisions: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              ))
    )}
            </div>

            {/* 8.3 Academic and Professional Service */}
            <div className="space-y-4 border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">8.3 Academic and Professional Service</h3>
                <button
                  onClick={addAcademicService}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-tu-red text-gray-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Plus size={12} />
                  Add Service
                </button>
              </div>

              {isReadOnly ? (
      <ReadOnlyTable data={formData.academicServices || []} columns={[
        { header: 'Activity / Event', key: 'activity' },
        { header: 'Role', key: 'role' },
        { header: 'Date', key: 'date' },
        { header: 'Organization', key: 'organization' }
      ]} />
    ) : (
      (formData.academicServices || []).map((srv, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <button
                    onClick={() => {
                      const updated = formData.academicServices.filter((_, i) => i !== idx);
                      setFormData({ ...formData, academicServices: updated });
                    }}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Date</label>
                    <DatePickerField
                      value={srv.date}
                      onChange={val => {
                        const updated = [...formData.academicServices];
                        updated[idx].date = val;
                        setFormData({ ...formData, academicServices: updated });
                      }}
                      className="!py-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Service Activity</label>
                    <input
                      type="text"
                      value={srv.activity}
                      placeholder="e.g., Peer review for TU Journal of Nursing"
                      onChange={e => {
                        const updated = [...formData.academicServices];
                        updated[idx].activity = e.target.value;
                        setFormData({ ...formData, academicServices: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Role / Organization</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={srv.role}
                        placeholder="e.g., Reviewer"
                        onChange={e => {
                          const updated = [...formData.academicServices];
                          updated[idx].role = e.target.value;
                          setFormData({ ...formData, academicServices: updated });
                        }}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs"
                      />
                      <input
                        type="text"
                        value={srv.organization}
                        placeholder="e.g., Thammasat Univ."
                        onChange={e => {
                          const updated = [...formData.academicServices];
                          updated[idx].organization = e.target.value;
                          setFormData({ ...formData, academicServices: updated });
                        }}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))
    )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 9: Leadership & Networking */}
        {/* ------------------------------------------------------------- */}
        {activeSection === 9 && (
          <div className="space-y-6 text-xs text-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-700">9.1 Leadership & Professional Networking</h3>
              <button
                onClick={addLeadership}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-tu-red text-gray-600 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                <Plus size={12} />
                Add Leadership Activity
              </button>
            </div>

            {isReadOnly ? (
      <ReadOnlyTable data={formData.leaderships || []} columns={[
        { header: 'Role / Position', key: 'role' },
        { header: 'Organization / Committee', key: 'organization' },
        { header: 'Year(s)', key: 'year' },
        { header: 'Key Contributions', key: 'contribution' }
      ]} />
    ) : (
      (formData.leaderships || []).map((ldr, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative grid grid-cols-1 sm:grid-cols-4 gap-4">
                <button
                  onClick={() => {
                    const updated = formData.leaderships.filter((_, i) => i !== idx);
                    setFormData({ ...formData, leaderships: updated });
                  }}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Date</label>
                  <DatePickerField
                    value={ldr.date}
                    onChange={val => {
                      const updated = [...formData.leaderships];
                      updated[idx].date = val;
                      setFormData({ ...formData, leaderships: updated });
                    }}
                    className="!py-1.5"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Role / Position</label>
                  <input
                    type="text"
                    value={ldr.role}
                    placeholder="e.g., President of Nursing PhD Student Association"
                    onChange={e => {
                      const updated = [...formData.leaderships];
                      updated[idx].role = e.target.value;
                      setFormData({ ...formData, leaderships: updated });
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Organization / Context</label>
                  <input
                    type="text"
                    value={ldr.organization}
                    placeholder="e.g., Faculty of Nursing, TU"
                    onChange={e => {
                      const updated = [...formData.leaderships];
                      updated[idx].organization = e.target.value;
                      setFormData({ ...formData, leaderships: updated });
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Key Responsibilities / Outcomes</label>
                  <input
                    type="text"
                    value={ldr.responsibilities}
                    placeholder="e.g., Managed international research symposium with 120 attendees"
                    onChange={e => {
                      const updated = [...formData.leaderships];
                      updated[idx].responsibilities = e.target.value;
                      setFormData({ ...formData, leaderships: updated });
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            ))
    )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 10: Reflective Practice */}
        {/* ------------------------------------------------------------- */}
        {activeSection === 10 && (
          <div className="space-y-8 text-xs text-gray-700">
            {/* 10.1 Key Learnings and Reflections from Coursework */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">Coursework Key Learnings</h3>
                <button
                  onClick={addKeyLearning}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-tu-red text-gray-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Plus size={12} />
                  Add Course Reflection
                </button>
              </div>

              {(formData.keyLearnings || []).map((kl, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => {
                      const updated = formData.keyLearnings.filter((_, i) => i !== idx);
                      setFormData({ ...formData, keyLearnings: updated });
                    }}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Course Code & Name</label>
                    <input
                      type="text"
                      value={kl.course}
                      placeholder="e.g., NS811 Theory Development"
                      onChange={e => {
                        const updated = [...formData.keyLearnings];
                        updated[idx].course = e.target.value;
                        setFormData({ ...formData, keyLearnings: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Key Learning Takeaway</label>
                    <textarea
                      rows={2}
                      value={kl.keyLearning}
                      placeholder="Discuss advanced paradigms, structural theories..."
                      onChange={e => {
                        const updated = [...formData.keyLearnings];
                        updated[idx].keyLearning = e.target.value;
                        setFormData({ ...formData, keyLearnings: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Practical Application in Dissertation</label>
                    <textarea
                      rows={2}
                      value={kl.application}
                      placeholder="How this applies directly to your theoretical framework..."
                      onChange={e => {
                        const updated = [...formData.keyLearnings];
                        updated[idx].application = e.target.value;
                        setFormData({ ...formData, keyLearnings: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* General Reflections */}
            <div className="space-y-6 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-bold text-gray-700">General Reflective Growth</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">10.1 Reflection on Academic Growth</label>
                  <textarea
                    rows={3}
                    placeholder="Discuss your transformation as an academic, new concepts mastered..."
                    value={formData.reflectionAcademicGrowth}
                    onChange={e => setFormData({ ...formData, reflectionAcademicGrowth: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">10.2 Reflection on Research Identity</label>
                  <textarea
                    rows={3}
                    placeholder="How do you view your role as a researcher in your specialized nursing field..."
                    value={formData.reflectionResearchIdentity}
                    onChange={e => setFormData({ ...formData, reflectionResearchIdentity: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">10.3 Reflection on Challenges and Resilience</label>
                  <textarea
                    rows={3}
                    placeholder="Detail obstacles faced during coursework, research or qualifying exams, and how you overcame them..."
                    value={formData.reflectionChallengesResilience}
                    onChange={e => setFormData({ ...formData, reflectionChallengesResilience: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">10.4 Reflection on Professional and Personal Transformation</label>
                  <textarea
                    rows={3}
                    placeholder="Reflect on your development of leadership, empathy, ethical perspective, and global nursing standards..."
                    value={formData.reflectionTransformation}
                    onChange={e => setFormData({ ...formData, reflectionTransformation: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 13: Annual Review Summary */}
        {/* ------------------------------------------------------------- */}
        {activeSection === 13 && (
          <div className="space-y-8 text-xs text-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">13.1 Key Achievements during the Past Year</label>
                <textarea
                  rows={4}
                  placeholder="Summarize milestones achieved, publications accepted, English cleared, etc..."
                  value={formData.annualReview?.achievements || ''}
                  onChange={e => setFormData({
                    ...formData,
                    annualReview: {
                      ...(formData.annualReview || { achievements: '', improvements: '', actionPlans: [] }),
                      achievements: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">13.2 Areas Needing Development or Improvement</label>
                <textarea
                  rows={4}
                  placeholder="Identify competencies, writing speed, statistical skills needing more practice..."
                  value={formData.annualReview?.improvements || ''}
                  onChange={e => setFormData({
                    ...formData,
                    annualReview: {
                      ...(formData.annualReview || { achievements: '', improvements: '', actionPlans: [] }),
                      improvements: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">13.3 Action Plan for the Upcoming Academic Year</h3>
                <button
                  onClick={addActionPlan}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-tu-red text-gray-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Plus size={12} />
                  Add Plan Row
                </button>
              </div>

              {(formData.annualReview?.actionPlans || []).map((plan, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <button
                    onClick={() => {
                      const updatedPlans = (formData.annualReview.actionPlans || []).filter((_, i) => i !== idx);
                      setFormData({
                        ...formData,
                        annualReview: {
                          ...formData.annualReview,
                          actionPlans: updatedPlans
                        }
                      });
                    }}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Development Goal</label>
                    <input
                      type="text"
                      value={plan.goal}
                      placeholder="e.g., Submit Scopus Manuscript"
                      onChange={e => {
                        const updated = [...(formData.annualReview.actionPlans || [])];
                        updated[idx].goal = e.target.value;
                        setFormData({
                          ...formData,
                          annualReview: {
                            ...formData.annualReview,
                            actionPlans: updated
                          }
                        });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Action Steps</label>
                    <input
                      type="text"
                      value={plan.steps}
                      placeholder="e.g., Run stats, draft discussion, edit language"
                      onChange={e => {
                        const updated = [...(formData.annualReview.actionPlans || [])];
                        updated[idx].steps = e.target.value;
                        setFormData({
                          ...formData,
                          annualReview: {
                            ...formData.annualReview,
                            actionPlans: updated
                          }
                        });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Timeline</label>
                    <input
                      type="text"
                      value={plan.timeline}
                      placeholder="e.g., Oct 2025 - Dec 2025"
                      onChange={e => {
                        const updated = [...(formData.annualReview.actionPlans || [])];
                        updated[idx].timeline = e.target.value;
                        setFormData({
                          ...formData,
                          annualReview: {
                            ...formData.annualReview,
                            actionPlans: updated
                          }
                        });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Required Support / Resources</label>
                    <input
                      type="text"
                      value={plan.support}
                      placeholder="e.g., Advisor feedback, stats software license"
                      onChange={e => {
                        const updated = [...(formData.annualReview.actionPlans || [])];
                        updated[idx].support = e.target.value;
                        setFormData({
                          ...formData,
                          annualReview: {
                            ...formData.annualReview,
                            actionPlans: updated
                          }
                        });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 14: Future Career Plan */}
        {/* ------------------------------------------------------------- */}
        {activeSection === 14 && (
          <div className="space-y-6 text-xs text-gray-700">
            <h3 className="text-sm font-bold text-gray-700">Future Career Plan After Graduation</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">14.1 Short-Term Career Goals (1-2 Years Post-Graduation)</label>
                <textarea
                  rows={3}
                  placeholder="e.g., Apply for assistant professor position, publish final dissertation papers..."
                  value={formData.futureCareer?.shortTerm || ''}
                  onChange={e => setFormData({
                    ...formData,
                    futureCareer: {
                      ...(formData.futureCareer || { shortTerm: '', longTerm: '', preparation: '' }),
                      shortTerm: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">14.2 Long-Term Career Aspirations (3-5 Years Post-Graduation)</label>
                <textarea
                  rows={3}
                  placeholder="e.g., Lead an independent nurse-led clinic research group, establish international collaboration..."
                  value={formData.futureCareer?.longTerm || ''}
                  onChange={e => setFormData({
                    ...formData,
                    futureCareer: {
                      ...(formData.futureCareer || { shortTerm: '', longTerm: '', preparation: '' }),
                      longTerm: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">14.3 Preparation Needed to Achieve Future Goals</label>
                <textarea
                  rows={3}
                  placeholder="Detail skills, postdoctoral training, professional credentials, or network expansions required..."
                  value={formData.futureCareer?.preparation || ''}
                  onChange={e => setFormData({
                    ...formData,
                    futureCareer: {
                      ...(formData.futureCareer || { shortTerm: '', longTerm: '', preparation: '' }),
                      preparation: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 15 & 16: Advisor Comments & Sign-off */}
        {/* ------------------------------------------------------------- */}
        {activeSection === 15 && (
          <div className="space-y-4 text-xs text-gray-700">
            <h3 className="text-sm font-bold text-gray-700">Comprehensive Portfolio Feedback from Dissertation Advisors (Section 15)</h3>
            <div className="p-5 bg-amber-50/30 border border-amber-100 rounded-2xl">
              <span className="text-xs font-bold text-tu-red uppercase tracking-wider block mb-1">MAJOR ADVISOR FEEDBACK</span>
              <p className="text-sm text-gray-800 leading-relaxed italic">
                "{formData.advisorComments || 'No comprehensive advisor remarks provided yet for this annual review cycle.'}"
              </p>
            </div>
            
            <div className="pt-3">
              <label className="text-xs text-gray-400 leading-normal block mt-2">
                * Advisory feedback sections are locked for student editing. Your primary advisor can edit these directly by signing in with their credentials.
              </label>
            </div>
          </div>
        )}

        {activeSection === 11 && (
          <div className="space-y-6 text-xs text-gray-700">
            <div>
              <h3 className="text-sm font-bold text-gray-700">11.1 Supporting Evidence & Electronic Portfolio Documents</h3>
              <p className="text-xs text-gray-400 font-normal">
                Upload and manage key files (research papers, ethics approval notices, certificates, dissertation drafts) securely stored in your personal Google Drive folder.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <h4 className="font-bold text-xs text-gray-800">Add New Supporting Document</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Document Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Thesis Proposal Draft"
                    value={newFileMeta.title}
                    onChange={e => setNewFileMeta({ ...newFileMeta, title: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Date</label>
                  <DatePickerField
                    value={newFileMeta.date}
                    onChange={val => setNewFileMeta({ ...newFileMeta, date: val })}
                    className="!py-1.5"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Description</label>
                  <textarea
                    placeholder="Provide a brief description of the document..."
                    value={newFileMeta.description}
                    onChange={e => setNewFileMeta({ ...newFileMeta, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold text-gray-400 block uppercase">Upload Document File</label>
                <FileUploader isReadOnly={isReadOnly}
                  studentId={currentUser.StudentID || '6601010024'}
                  studentName={currentUser.FullName || 'Student'}
                  uploaderId={currentUser.StudentID || '6601010024'}
                  uploaderRole="student"
                  maxFiles={1}
                  files={[]}
                  onChange={(uploadedFiles) => {
                    if (uploadedFiles.length > 0) {
                      const uploaded = uploadedFiles[0];
                      const updatedFiles = [...(formData.supportingFiles || [])];
                      updatedFiles.push({
                        name: uploaded.name,
                        url: uploaded.url,
                        title: newFileMeta.title || uploaded.name,
                        date: newFileMeta.date || new Date().toISOString().split('T')[0],
                        description: newFileMeta.description || ''
                      });
                      setFormData({
                        ...formData,
                        supportingFiles: updatedFiles
                      });
                      setNewFileMeta({ title: '', date: '', description: '' });
                    }
                  }}
                />
              </div>
            </div>

            {/* Uploaded Files Table */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <h4 className="font-bold text-xs text-gray-800">Uploaded Supporting Documents</h4>
              {(!formData.supportingFiles || formData.supportingFiles.length === 0) ? (
                <p className="text-xs text-gray-400 italic">No supporting documents uploaded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <th className="py-2 px-3">Title</th>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3">File Link</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.supportingFiles.map((file, idx) => (
                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                          <td className="py-3 px-3 font-semibold text-gray-700">{file.title || file.name}</td>
                          <td className="py-3 px-3 text-gray-500 font-mono whitespace-nowrap">{file.date || '-'}</td>
                          <td className="py-3 px-3 text-gray-500 max-w-xs truncate" title={file.description}>{file.description || '-'}</td>
                          <td className="py-3 px-3 text-tu-red">
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noreferrer referrer"
                              className="inline-flex items-center gap-1 hover:underline font-semibold"
                            >
                              <Paperclip size={12} />
                              Open File
                            </a>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.supportingFiles.filter((_, i) => i !== idx);
                                setFormData({ ...formData, supportingFiles: updated });
                              }}
                              className="p-1 text-gray-400 hover:text-red-500 transition cursor-pointer"
                              title="Delete file"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 16 && (
          <div className="space-y-4 text-xs text-gray-700">
            <h3 className="text-sm font-bold text-gray-700">16.1 Advisory Verification Sign-off & Endorsement</h3>
            <p className="text-xs text-gray-500">Board of advisors and co-advisors verifying candidate progress credentials:</p>

            <div className="space-y-3">
              {formData.endorsements.map((end, idx) => (
                <div key={idx} className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-tu-red block uppercase">{end.role}</span>
                    <h4 className="text-sm font-semibold text-gray-800">{end.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full inline-block">
                      ✓ Authenticated & Signed
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1 font-mono">Endorsed on: {end.signatureDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Default edit fallbacks for simplicity in navigation */}
        {![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].includes(activeSection) && (
          <div className="space-y-4 text-xs text-gray-700">
            <p className="text-sm text-gray-600 leading-relaxed">
              Section {activeSection} fields are automatically completed with compliant reference profiles. You can review advisor remarks or download your complete portfolio in the Print Report PDF section immediately.
            </p>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
              <h4 className="font-semibold text-xs text-gray-700">Preloaded Content:</h4>
              <p className="text-xs italic text-gray-500">
                "Content pre-configured to comply with standard Faculty of Nursing PhD graduation benchmarks for final thesis defense clearance."
              </p>
            </div>
          </div>
        )}
        </fieldset>
      </div>
    </div>
  );
}
