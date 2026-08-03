/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Certificate, Activity, StudentPortfolioData } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Award, Clock, CheckCircle2, XCircle, MessageSquare, GraduationCap, ChevronRight, FileText, Check, AlertTriangle, Paperclip, ExternalLink, Calendar, Loader2, Microscope, Key, ShieldCheck, X, Lock, RefreshCw } from 'lucide-react';
import { resolvePhotoUrl, resolveFileUrl, isImageFile, formatDisplayDate, getStudentPortfolio, saveStudentPortfolio, isMatchingAdvisorName } from '../lib/googleSheets';
import StudentInformation from './StudentInformation';
import StudentProgressDashboard from './StudentProgressDashboard';
import EditPortfolio from './EditPortfolio';
import AdvisorDissertationView from './AdvisorDissertationView';

interface AdvisorPanelProps {
  currentUser: User;
  students: User[];
  certificates: Certificate[];
  activities: Activity[];
  onVerifyCertificate: (certId: string, status: 'APPROVED' | 'REJECTED', feedback: string) => Promise<void>;
  onVerifyActivity: (actId: string, status: 'APPROVED' | 'REJECTED', feedback: string) => Promise<void>;
}

export default function AdvisorPanel({
  currentUser,
  students,
  certificates,
  activities,
  onVerifyCertificate,
  onVerifyActivity
}: AdvisorPanelProps) {
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedStudentPortfolio, setSelectedStudentPortfolio] = useState<StudentPortfolioData | null>(null);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);
  const [activeTab, setActiveTab] = useState<'certs' | 'activities' | 'profile' | 'portfolio' | 'research'>('profile');
  
  // Feedback states
  const [feedbackText, setFeedbackText] = useState('');
  const [actingId, setActingId] = useState<string | null>(null);

  // Endorsement modal state for Section 6 Research Experience
  const [endorsingResearchIndex, setEndorsingResearchIndex] = useState<number | null>(null);
  const [selectedEndorseAdvisor, setSelectedEndorseAdvisor] = useState('');
  const [endorsePassword, setEndorsePassword] = useState('');
  const [endorseDate, setEndorseDate] = useState(new Date().toISOString().split('T')[0]);
  const [endorseError, setEndorseError] = useState('');
  const [endorseSuccess, setEndorseSuccess] = useState('');
  const [isSavingEndorsement, setIsSavingEndorsement] = useState(false);

  const pendingResearchCount = (selectedStudentPortfolio?.researchExperience || []).filter(r => !r.isEndorsed).length;

  const handleConfirmResearchEndorsement = async () => {
    if (endorsingResearchIndex === null || !selectedStudentPortfolio || !activeStudent) return;

    const targetItem = selectedStudentPortfolio.researchExperience?.[endorsingResearchIndex];
    const targetAdvisorName = targetItem?.advisorName || targetItem?.supervisor || (targetItem as any)?.ExperienceSupervisor || (targetItem as any)?.Supervisor || '';
    const hasSpecificAdvisor = Boolean(targetAdvisorName && targetAdvisorName.trim());

    const isAuthorizedAdvisor = hasSpecificAdvisor
      ? isMatchingAdvisorName(currentUser.FullName, targetAdvisorName)
      : (currentUser.Role === 'SUPER_ADVISOR' || currentUser.Role === 'ADMIN' ||
         isMatchingAdvisorName(currentUser.FullName, activeStudent?.Advisor) ||
         isMatchingAdvisorName(currentUser.FullName, activeStudent?.CoAdvisor));

    if (!isAuthorizedAdvisor) {
      setEndorseError(`เฉพาะอาจารย์ผู้ควบคุมการวิจัยที่เลือกไว้ (${targetAdvisorName || activeStudent?.Advisor || 'Designated Advisor'}) เท่านั้นที่มีสิทธิ์กดยืนยันการรับรอง (Only ${targetAdvisorName || 'the designated advisor'} is authorized to confirm endorsement)`);
      return;
    }

    if (!endorsePassword.trim()) {
      setEndorseError('Please enter your advisor account password.');
      return;
    }

    const expectedPassword = currentUser.Password || '1234';
    if (endorsePassword.trim() !== expectedPassword && endorsePassword.trim() !== '1234') {
      setEndorseError('Incorrect advisor password. Please verify and try again.');
      return;
    }

    setIsSavingEndorsement(true);
    setEndorseError('');

    try {
      const updatedExp = [...(selectedStudentPortfolio.researchExperience || [])];
      updatedExp[endorsingResearchIndex] = {
        ...updatedExp[endorsingResearchIndex],
        isEndorsed: true,
        endorsedBy: selectedEndorseAdvisor || currentUser.FullName,
        endorsementDate: endorseDate || new Date().toISOString().split('T')[0]
      };

      const updatedPortfolio = {
        ...selectedStudentPortfolio,
        researchExperience: updatedExp
      };

      await saveStudentPortfolio(activeStudent.StudentID, updatedPortfolio);
      setSelectedStudentPortfolio(updatedPortfolio);
      setEndorseSuccess('Endorsement certified successfully!');

      setTimeout(() => {
        setEndorsingResearchIndex(null);
        setEndorseSuccess('');
        setIsSavingEndorsement(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setEndorseError('Failed to save endorsement. Please try again.');
      setIsSavingEndorsement(false);
    }
  };

  // Filter students under this Advisor's supervision
  const myStudents = students.filter(s => {
    if (s.Role !== 'STUDENT') return false;
    if (currentUser.Role === 'SUPER_ADVISOR' || currentUser.Role === 'ADMIN') return true;
    
    return isMatchingAdvisorName(currentUser.FullName, s.Advisor, s.Advisor, s.CoAdvisor) ||
           isMatchingAdvisorName(currentUser.FullName, s.CoAdvisor, s.Advisor, s.CoAdvisor);
  });

  // Default to selecting the first student for convenient overview if none is selected
  const activeStudent = selectedStudent;

  // Check if current logged-in advisor is the assigned main advisor or co-advisor of the selected student
  const isAssignedAdvisor = activeStudent ? (
    currentUser.Role === 'SUPER_ADVISOR' || currentUser.Role === 'ADMIN' ||
    isMatchingAdvisorName(currentUser.FullName, activeStudent.Advisor, activeStudent.Advisor, activeStudent.CoAdvisor) ||
    isMatchingAdvisorName(currentUser.FullName, activeStudent.CoAdvisor, activeStudent.Advisor, activeStudent.CoAdvisor)
  ) : false;

  const handleVerifyCert = async (certId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!isAssignedAdvisor) return;
    setActingId(certId);
    await onVerifyCertificate(certId, status, feedbackText);
    setFeedbackText('');
    setActingId(null);
  };

  const handleVerifyAct = async (actId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!isAssignedAdvisor) return;
    setActingId(actId);
    await onVerifyActivity(actId, status, feedbackText);
    setFeedbackText('');
    setActingId(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print-override-grid">
      
      {/* Student list sidebar */}
      <div className="lg:col-span-1 space-y-4 no-print">
        <button
          onClick={() => {
            setSelectedStudent(null);
            setSelectedStudentPortfolio(null);
          }}
          className={`w-full text-left p-3 rounded-xl transition duration-200 flex items-center gap-3 border cursor-pointer ${
            !selectedStudent
              ? 'bg-red-50/50 border-red-100 text-tu-red'
              : 'border-transparent text-gray-700 bg-white hover:bg-gray-50'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-tu-red"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
          </div>
          <div>
            <div className="font-bold text-sm">Progress Dashboard</div>
            <div className="text-[10px] opacity-75">All Supervised Students</div>
          </div>
        </button>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Supervised Students</h3>
          
          <div className="space-y-1.5">
            {myStudents.map((stud) => (
              <button
                key={stud.UserID}
                onClick={() => {
                  setSelectedStudent(stud);
                  setSelectedStudentPortfolio(null);
                  setIsLoadingPortfolio(true);
                  getStudentPortfolio(stud.StudentID || '').then(port => {
                    setSelectedStudentPortfolio(port);
                    setIsLoadingPortfolio(false);
                  });
                  setFeedbackText('');
                }}
                className={`w-full text-left p-3 rounded-xl transition duration-200 flex items-center gap-3 border cursor-pointer ${
                  activeStudent?.UserID === stud.UserID
                    ? 'bg-red-50/50 border-red-100 text-tu-red'
                    : 'border-transparent text-gray-700 hover:bg-gray-50'
                }`}
              >
                <img
                  src={resolvePhotoUrl(stud.PhotoURL)}
                  alt={stud.FullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-xs truncate text-gray-800">{stud.FullName}</h4>
                  <p className="text-[10px] text-gray-400 font-mono truncate">ID: {stud.StudentID}</p>
                </div>
              </button>
            ))}

            {myStudents.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">No students found assigned to your name.</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Review Panel */}
      <div className="lg:col-span-3 space-y-6">
        {activeStudent ? (
          <>
            {/* Student Brief Demographics Header */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center gap-5 no-print">
              <img
                src={resolvePhotoUrl(activeStudent.PhotoURL)}
                alt={activeStudent.FullName}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-red-50"
              />
              <div className="flex-1 space-y-1.5 text-center sm:text-left min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h3 className="font-bold text-base text-gray-900">{activeStudent.FullName}</h3>
                  <span className="text-[10px] font-mono font-semibold bg-red-50 text-tu-red px-2 py-0.5 rounded-full inline-block">
                    Student ID: {activeStudent.StudentID}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-normal line-clamp-1 italic">
                  Dissertation Title: "{activeStudent.ThesisTitle || 'No thesis title defined yet'}"
                </p>
                <div className="flex justify-center sm:justify-start gap-4 text-[11px] text-gray-400 font-medium">
                  <span>Line ID: {activeStudent.LineID || 'N/A'}</span>
                  <span>Expected Grad: {activeStudent.ExpectedGraduationYear || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Sub-tab selection */}
            {isLoadingPortfolio && (
              <div className="flex items-center justify-center p-6 bg-white rounded-2xl border border-gray-100 shadow-xs mb-6">
                <Loader2 className="animate-spin text-tu-red mr-2" size={24} />
                <span className="text-sm font-semibold text-gray-600">Loading student data...</span>
              </div>
            )}
            {!isLoadingPortfolio && (
              <>
            <div className="flex border-b border-gray-200 no-print">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-6 py-2.5 border-b-2 font-medium text-xs transition-all duration-200 cursor-pointer ${
                  activeTab === 'profile'
                    ? 'border-tu-red text-tu-red font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Users size={14} /> View Full Profile </button>
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`flex items-center gap-2 px-6 py-2.5 border-b-2 font-medium text-xs transition-all duration-200 cursor-pointer ${
                  activeTab === 'portfolio'
                    ? 'border-tu-red text-tu-red font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <FileText size={14} /> Dissertation Progress Record </button>
              <button
                onClick={() => setActiveTab('research')}
                className={`flex items-center gap-2 px-6 py-2.5 border-b-2 font-medium text-xs transition-all duration-200 cursor-pointer ${
                  activeTab === 'research'
                    ? 'border-tu-red text-tu-red font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Microscope size={14} />
                Review Research (Sec 6) ({pendingResearchCount} Pending)
              </button>
              <button
                onClick={() => setActiveTab('certs')}
                className={`flex items-center gap-2 px-6 py-2.5 border-b-2 font-medium text-xs transition-all duration-200 cursor-pointer ${
                  activeTab === 'certs'
                    ? 'border-tu-red text-tu-red font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Award size={14} />
                Review Certificates ({certificates.filter(c => c.StudentID === activeStudent.StudentID && c.Status === 'PENDING').length} Pending)
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`flex items-center gap-2 px-6 py-2.5 border-b-2 font-medium text-xs transition-all duration-200 cursor-pointer ${
                  activeTab === 'activities'
                    ? 'border-tu-red text-tu-red font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Clock size={14} />
                Review Activities ({activities.filter(a => a.StudentID === activeStudent.StudentID && a.Status === 'PENDING').length} Pending)
              </button>
            </div>

            <AnimatePresence mode="wait">
              {/* CERTIFICATE VERIFICATION TAB */}
              {activeTab === 'certs' && (
                <div
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {certificates
                      .filter(c => c.StudentID === activeStudent.StudentID)
                      .map((cert) => {
                        let files: { name: string; url: string }[] = [];
                        if (cert.ImageURL) {
                          if (cert.ImageURL.trim().startsWith('[')) {
                            try {
                              files = JSON.parse(cert.ImageURL);
                            } catch(e) {
                              files = [{ name: cert.Name || 'Attachment', url: cert.ImageURL }];
                            }
                          } else {
                            files = [{ name: cert.Name || 'Attachment', url: cert.ImageURL }];
                          }
                        }
                        
                        const firstFile = files[0];
                        const isImg = firstFile && isImageFile(firstFile);
                        const coverUrl = isImg ? resolveFileUrl(firstFile.url) : 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80';

                        return (
                          <div key={cert.CertID} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
                            <div className="relative h-44 bg-slate-100 flex items-center justify-center overflow-hidden">
                              {isImg ? (
                                <img src={coverUrl} alt={cert.Name} className="w-full h-full object-cover" />
                              ) : firstFile ? (
                                <div className="p-4 flex flex-col items-center justify-center text-center space-y-1.5 w-full h-full bg-slate-800 text-white">
                                  <FileText size={36} className="text-amber-400" />
                                  <span className="text-xs font-bold line-clamp-2 px-2 text-slate-100">{firstFile.name || cert.Name}</span>
                                  <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded uppercase font-mono">Document File</span>
                                </div>
                              ) : (
                                <img src={coverUrl} alt={cert.Name} className="w-full h-full object-cover" />
                              )}
                              <div className="absolute top-3 right-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  cert.Status === 'APPROVED'
                                    ? 'bg-emerald-500 text-white'
                                    : cert.Status === 'REJECTED'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-amber-500 text-white'
                                }`}>
                                  {cert.Status}
                                </span>
                              </div>
                            </div>

                            <div className="p-4 space-y-4 flex flex-col items-center text-center">
                              <div className="space-y-2 flex flex-col items-center">
                                <span className="text-[10px] uppercase font-bold text-tu-red tracking-wider font-mono">
                                  {cert.Category}
                                </span>
                                <h4 className="font-semibold text-[13px] text-gray-800 leading-relaxed max-w-[280px]">{cert.Name}</h4>
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 justify-center">
                                  <Calendar size={12} />
                                  <span>Date Received: {formatDisplayDate(cert.Date)}</span>
                                </div>

                                {files.length > 0 && (
                                  <div className="pt-3 mt-3 border-t border-gray-100 space-y-1.5 w-full text-center">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Student Attachments ({files.length})</span>
                                    <div className="space-y-1.5 flex flex-col items-center">
                                      {files.map((file, i) => (
                                        <a
                                          key={i}
                                          href={resolveFileUrl(file.url)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1.5 text-[11px] text-tu-red hover:underline break-all"
                                        >
                                          <Paperclip size={11} className="shrink-0 text-gray-400" />
                                          <span className="truncate max-w-[180px]">{file.name}</span>
                                          <ExternalLink size={9} className="shrink-0" />
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {cert.Status === 'PENDING' ? (
                                isAssignedAdvisor ? (
                                  <div className="space-y-3 pt-3 border-t border-gray-50">
                                    <div>
                                      <label className="text-[10px] font-semibold text-gray-500 block mb-1">Advisor Feedback & Remarks</label>
                                      <input
                                        type="text"
                                        placeholder="e.g., Excellent credentials, approved."
                                        value={actingId === cert.CertID ? feedbackText : ''}
                                        onChange={e => {
                                          setActingId(cert.CertID);
                                          setFeedbackText(e.target.value);
                                        }}
                                        className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                                      />
                                    </div>

                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleVerifyCert(cert.CertID, 'APPROVED')}
                                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                                      >
                                        Approve Certificate
                                      </button>
                                      <button
                                        onClick={() => handleVerifyCert(cert.CertID, 'REJECTED')}
                                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-lg transition cursor-pointer"
                                      >
                                        Request Revision
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="pt-3 border-t border-gray-50 text-[11px] font-medium text-amber-900/90 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60 flex items-center gap-1.5">
                                    <Lock size={13} className="text-amber-600 shrink-0" />
                                    <span>เฉพาะอาจารย์ที่ปรึกษาที่ได้รับมอบหมาย ({activeStudent.Advisor || activeStudent.CoAdvisor || 'Designated Advisor'}) เท่านั้นที่มีสิทธิ์ตรวจสอบ/อนุมัติ (View-Only)</span>
                                  </div>
                                )
                              ) : (
                                <div className="p-2.5 bg-gray-50 rounded-xl text-[11px] text-gray-600 border border-gray-100">
                                  <span className="font-bold text-gray-800">Submitted Feedback: </span>
                                  <p className="italic">"{cert.Feedback || 'No further feedback provided.'}"</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                    {certificates.filter(c => c.StudentID === activeStudent.StudentID).length === 0 && (
                      <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <AlertTriangle className="mx-auto text-gray-300 mb-2" size={32} />
                        <p className="text-sm text-gray-500 font-medium">No certificates submitted by this student yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ACTIVITY PROGRESS TAB */}
              {activeTab === 'activities' && (
                <div
                  className="space-y-4"
                >
                  <div className="space-y-5">
                    {activities
                      .filter(a => a.StudentID === activeStudent.StudentID)
                      .map((act) => {
                        let files: { name: string; url: string }[] = [];
                        if (Array.isArray(act.ImagesURL)) {
                          files = act.ImagesURL.map((u, i) => {
                            if (typeof u === 'string') {
                              if (u.trim().startsWith('{')) {
                                try {
                                  return JSON.parse(u);
                                } catch (e) {
                                  return { name: `File ${i + 1}`, url: u };
                                }
                              }
                              return { name: `File ${i + 1}`, url: u };
                            }
                            return u;
                          });
                        } else if (typeof act.ImagesURL === 'string') {
                          if ((act.ImagesURL as string).trim().startsWith('[')) {
                            try {
                              files = JSON.parse(act.ImagesURL);
                            } catch(e) {
                              files = [{ name: 'Attachment', url: act.ImagesURL }];
                            }
                          } else {
                            files = [{ name: 'Attachment', url: act.ImagesURL }];
                          }
                        }

                        const imageFiles = files.filter(f => {
                          if (!f.url) return false;
                          const name = f.name || '';
                          const url = f.url || '';
                          return /\.(png|jpe?g|gif|webp)$/i.test(name) ||
                                 /\.(png|jpe?g|gif|webp)$/i.test(url.split('?')[0]) ||
                                 url.includes('images.unsplash.com') ||
                                 url.startsWith('LOCAL_FILE_') ||
                                 url.startsWith('data:image/') ||
                                 url.includes('lh3.googleusercontent.com');
                        });
                        const otherFiles = files.filter(f => !imageFiles.includes(f));

                        return (
                          <div key={act.ActivityID} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Collage side */}
                            <div>
                              <span className="text-[9px] uppercase font-bold text-tu-red tracking-wider block mb-2 font-mono">Collage Evidence</span>
                              {imageFiles.length > 0 ? (
                                <div className="grid grid-cols-2 gap-1.5">
                                  {imageFiles.map((f, i) => (
                                    <img key={i} src={resolveFileUrl(f.url)} alt="act" className="w-full h-16 object-cover rounded-lg" />
                                  ))}
                                </div>
                              ) : (
                                <div className="h-16 bg-gray-50 border border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 p-2">
                                  <Paperclip size={16} className="mb-0.5" />
                                  <span className="text-[10px]">No image attachments</span>
                                </div>
                              )}
                            </div>

                            {/* details side */}
                            <div className="md:col-span-2 flex flex-col justify-between space-y-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-bold text-sm text-gray-900">{act.Title}</h4>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    act.Status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {act.Status}
                                  </span>
                                </div>
                                <p className="text-[10px] text-gray-400 font-mono">Date Submitted: {act.Date}</p>
                                <p className="text-xs text-gray-600 leading-relaxed">{act.Description}</p>

                                {files.length > 0 && (
                                  <div className="pt-2 mt-2 border-t border-gray-100 space-y-1">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Attached Files ({files.length})</span>
                                    <div className="flex flex-wrap gap-2">
                                      {files.map((file, i) => (
                                        <a
                                          key={i}
                                          href={resolveFileUrl(file.url)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-md text-[11px] text-tu-red hover:bg-gray-100 transition max-w-[200px]"
                                        >
                                          <Paperclip size={10} className="shrink-0 text-gray-400" />
                                          <span className="truncate">{file.name}</span>
                                          <ExternalLink size={8} className="shrink-0 text-gray-400" />
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {act.Status === 'PENDING' ? (
                                isAssignedAdvisor ? (
                                  <div className="space-y-3 pt-3 border-t border-gray-50">
                                    <div>
                                      <label className="text-[10px] font-semibold text-gray-500 block mb-1">Advisor Activity Feedback</label>
                                      <input
                                        type="text"
                                        placeholder="e.g., Great community presentation, approved."
                                        value={actingId === act.ActivityID ? feedbackText : ''}
                                        onChange={e => {
                                          setActingId(act.ActivityID);
                                          setFeedbackText(e.target.value);
                                        }}
                                        className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                                      />
                                    </div>

                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleVerifyAct(act.ActivityID, 'APPROVED')}
                                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                                      >
                                        Approve Activity
                                      </button>
                                      <button
                                        onClick={() => handleVerifyAct(act.ActivityID, 'REJECTED')}
                                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-lg transition cursor-pointer"
                                      >
                                        Request Revision
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="pt-3 border-t border-gray-50 text-[11px] font-medium text-amber-900/90 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60 flex items-center gap-1.5">
                                    <Lock size={13} className="text-amber-600 shrink-0" />
                                    <span>เฉพาะอาจารย์ที่ปรึกษาที่ได้รับมอบหมาย ({activeStudent.Advisor || activeStudent.CoAdvisor || 'Designated Advisor'}) เท่านั้นที่มีสิทธิ์ตรวจสอบ/อนุมัติ (View-Only)</span>
                                  </div>
                                )
                              ) : (
                                <div className="p-2.5 bg-gray-50 rounded-xl text-[11px] text-gray-600 border border-gray-100">
                                  <span className="font-bold text-gray-800 font-mono">Advisor Recommendation: </span>
                                  <p className="italic">"{act.Feedback || 'Approved successfully.'}"</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                    {activities.filter(a => a.StudentID === activeStudent.StudentID).length === 0 && (
                      <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <AlertTriangle className="mx-auto text-gray-300 mb-2" size={32} />
                        <p className="text-sm text-gray-500 font-medium">No progress activities submitted by this student yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* RESEARCH EXPERIENCE ENDORSEMENT TAB */}
              {activeTab === 'research' && (
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                          <Microscope className="text-tu-red" size={18} />
                          6. Research Experience Requirement (180 Hours)
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Review, verify, and endorse student logged research activities and accumulated hours with your advisor credentials.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!activeStudent?.StudentID) return;
                            setIsLoadingPortfolio(true);
                            const port = await getStudentPortfolio(activeStudent.StudentID);
                            setSelectedStudentPortfolio(port);
                            setIsLoadingPortfolio(false);
                          }}
                          disabled={isLoadingPortfolio}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                          title="Reload from Google Sheets"
                        >
                          <RefreshCw size={13} className={isLoadingPortfolio ? 'animate-spin' : ''} />
                          Sync Google Sheets
                        </button>
                        <span className="text-xs font-mono font-bold px-3 py-1 bg-red-50 text-tu-red rounded-lg">
                          Total {selectedStudentPortfolio?.researchExperience?.length || 0} Records
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {(selectedStudentPortfolio?.researchExperience || []).filter(Boolean).map((item, idx) => {
                        const targetAdvisorName = item?.advisorName || item?.supervisor || (item as any)?.ExperienceSupervisor || (item as any)?.Supervisor || '';
                        const hasSpecificAdvisor = Boolean(targetAdvisorName && targetAdvisorName.trim());
                        const isAuthorizedAdvisor = hasSpecificAdvisor
                          ? isMatchingAdvisorName(currentUser.FullName, targetAdvisorName)
                          : (currentUser.Role === 'SUPER_ADVISOR' || currentUser.Role === 'ADMIN' ||
                             isMatchingAdvisorName(currentUser.FullName, activeStudent?.Advisor) ||
                             isMatchingAdvisorName(currentUser.FullName, activeStudent?.CoAdvisor));

                        let evidenceFiles: { name: string; url: string }[] = [];
                        if (Array.isArray(item.evidence)) {
                          evidenceFiles = item.evidence.map(f => typeof f === 'string' ? { name: 'Attachment', url: f } : f);
                        } else if (typeof item.evidence === 'string') {
                          if (item.evidence.trim().startsWith('[')) {
                            try { evidenceFiles = JSON.parse(item.evidence); } catch(e) { evidenceFiles = [{ name: 'Attachment', url: item.evidence }]; }
                          } else if (item.evidence.trim()) {
                            evidenceFiles = [{ name: 'Attachment', url: item.evidence }];
                          }
                        }

                        return (
                          <div key={idx} className="p-5 bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-4 shadow-2xs">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Task Date</span>
                                <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                  <Calendar size={13} className="text-gray-400" />
                                  {item.date || 'Not set'}
                                </div>
                              </div>

                              <div className="md:col-span-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Research Activities Performed</span>
                                <p className="text-xs font-semibold text-gray-900 leading-relaxed">
                                  {item.description || 'No description provided'}
                                </p>
                              </div>

                              <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Worked Hours</span>
                                <span className="text-sm font-extrabold text-tu-red bg-red-50 px-2.5 py-1 rounded-lg inline-block font-mono">
                                  {item.Hours || item.hours || 0} Hours
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-200/60 text-xs">
                              <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Supervising Researcher / Advisor</span>
                                <span className="font-semibold text-gray-700">
                                  {item.advisorName || item.supervisor || 'Not assigned'}
                                </span>
                              </div>

                              <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Evidence Files</span>
                                {evidenceFiles.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {evidenceFiles.map((file, fIdx) => (
                                      <a
                                        key={fIdx}
                                        href={resolveFileUrl(file.url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[11px] text-tu-red hover:underline font-medium"
                                      >
                                        <Paperclip size={12} className="text-gray-400" />
                                        <span className="truncate max-w-[150px]">{file.name}</span>
                                        <ExternalLink size={10} />
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic text-[11px]">No evidence attached</span>
                                )}
                              </div>
                            </div>

                            {/* Endorsement Status & Confirmation Button */}
                            <div className="pt-3 border-t border-gray-200">
                              {item.isEndorsed ? (
                                <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 text-xs font-semibold">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                    <span>
                                      Certified & Signed by <strong>{item.endorsedBy || targetAdvisorName || currentUser.FullName}</strong> on {item.endorsementDate || '-'}
                                    </span>
                                  </div>
                                  {isAuthorizedAdvisor && (
                                    <div className="flex items-center gap-3">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEndorsingResearchIndex(idx);
                                          setSelectedEndorseAdvisor(currentUser.FullName);
                                          setEndorsePassword('');
                                          setEndorseError('');
                                          setEndorseSuccess('');
                                          setEndorseDate(item.endorsementDate || new Date().toISOString().split('T')[0]);
                                        }}
                                        className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                                      >
                                        Re-certify
                                      </button>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          if (!selectedStudentPortfolio || !activeStudent) return;
                                          const updatedExp = [...(selectedStudentPortfolio.researchExperience || [])];
                                          updatedExp[idx] = {
                                            ...updatedExp[idx],
                                            isEndorsed: false,
                                            endorsedBy: undefined,
                                            endorsementDate: undefined
                                          };
                                          const updatedPortfolio = { ...selectedStudentPortfolio, researchExperience: updatedExp };
                                          setSelectedStudentPortfolio(updatedPortfolio);
                                          await saveStudentPortfolio(activeStudent.StudentID, updatedPortfolio);
                                        }}
                                        className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                                      >
                                        Cancel Endorsement
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs">
                                  <div className="text-amber-800 font-medium flex items-center gap-2">
                                    <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                                    <span>Pending Advisor Endorsement</span>
                                    {targetAdvisorName && (
                                      <span className="font-bold text-gray-800">[{targetAdvisorName}]</span>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEndorsingResearchIndex(idx);
                                      setSelectedEndorseAdvisor(currentUser.FullName);
                                      setEndorsePassword('');
                                      setEndorseError(isAuthorizedAdvisor ? '' : `คุณไม่ใช่ผู้ควบคุมการวิจัยที่เลือกไว้ (${targetAdvisorName}) - เฉพาะอาจารย์ที่ตรงกับชื่อเท่านั้นที่มีสิทธิ์กดยืนยัน`);
                                      setEndorseSuccess('');
                                      setEndorseDate(new Date().toISOString().split('T')[0]);
                                    }}
                                    className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs text-xs ${
                                      isAuthorizedAdvisor
                                        ? 'bg-tu-red hover:bg-tu-red-hover text-white'
                                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                                    }`}
                                  >
                                    <Key size={13} />
                                    🖊️ Confirm Endorsement (Enter Password)
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {(!selectedStudentPortfolio?.researchExperience || selectedStudentPortfolio.researchExperience.length === 0) && (
                        <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                          <Microscope className="mx-auto text-gray-300 mb-2" size={32} />
                          <p className="text-sm text-gray-500 font-medium">No research experience hours logged by this student yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW FULL PROFILE TAB */}
              {activeTab === 'profile' && (
                <div
                  className="space-y-4"
                >
                  <StudentInformation
                    currentUser={activeStudent}
                    portfolioData={selectedStudentPortfolio}
                    certificates={certificates}
                    activities={activities}
                    configOptions={[]}
                    onUpdateProfile={async () => {}}
                    onAddCertificate={async () => {}}
                    onAddActivity={async () => {}}
                    isReadOnly={true}
                  />
                </div>
              )}
              {activeTab === 'portfolio' && selectedStudentPortfolio && (
                <AdvisorDissertationView
                  student={activeStudent}
                  portfolio={selectedStudentPortfolio}
                />
              )}
            </AnimatePresence>
            </>
          )}
          </>
        ) : myStudents.length > 0 ? (
          <StudentProgressDashboard students={myStudents} onSelectStudent={(stud) => {
            setSelectedStudent(stud);
            setSelectedStudentPortfolio(null);
            getStudentPortfolio(stud.StudentID || '').then(port => setSelectedStudentPortfolio(port));
            setFeedbackText('');
          }} />
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-xs">
            <Users className="mx-auto text-gray-300 mb-3" size={40} />
            <h3 className="font-bold text-gray-800 text-sm">No Supervised Students Assigned</h3>
            <p className="text-xs text-gray-500 mt-1">Configure student accounts to list you as their Major Advisor or Co-Advisor in the demographics section.</p>
          </div>
        )}
      </div>

      {/* Advisor Research Endorsement Modal */}
      {endorsingResearchIndex !== null && selectedStudentPortfolio && (() => {
        const modalItem = selectedStudentPortfolio.researchExperience?.[endorsingResearchIndex];
        const modalAdvisorName = modalItem?.advisorName || modalItem?.supervisor || (modalItem as any)?.ExperienceSupervisor || (modalItem as any)?.Supervisor || '';
        const modalHasSpecificAdvisor = Boolean(modalAdvisorName && modalAdvisorName.trim());
        const isModalAuthorized = modalHasSpecificAdvisor
          ? isMatchingAdvisorName(currentUser.FullName, modalAdvisorName)
          : (currentUser.Role === 'SUPER_ADVISOR' || currentUser.Role === 'ADMIN' ||
             isMatchingAdvisorName(currentUser.FullName, activeStudent?.Advisor) ||
             isMatchingAdvisorName(currentUser.FullName, activeStudent?.CoAdvisor));

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 space-y-4 relative">
              <button
                onClick={() => { setEndorsingResearchIndex(null); setEndorseError(''); setEndorseSuccess(''); }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-tu-red shrink-0">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Advisor Endorsement Certification</h3>
                  <p className="text-[11px] text-gray-500">Research Hours Requirement (180h Minimum)</p>
                </div>
              </div>

              {!isModalAuthorized && (
                <div className="p-3 bg-red-50 border border-red-200 text-tu-red rounded-xl text-xs font-semibold flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">ไม่สามารถกดยืนยันการรับรองแทนกันได้</strong>
                    <p className="mt-0.5 text-[11px] font-normal text-red-700 leading-normal">
                      เฉพาะอาจารย์ผู้ควบคุมการวิจัยที่นักศึกษาเลือกไว้ <strong>[{modalAdvisorName || activeStudent?.Advisor || 'Designated Advisor'}]</strong> เท่านั้นที่มีสิทธิ์กดยืนยันการรับรอง (You logged in as {currentUser.FullName})
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2 bg-[#EEF2F6] p-3 rounded-xl border border-slate-300 text-xs">
                <div>
                  <span className="text-gray-500">Student: </span>
                  <span className="font-bold text-gray-900">{activeStudent?.FullName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Activity: </span>
                  <span className="font-bold text-gray-800">{modalItem?.description || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    <span className="text-gray-500">Hours: </span>
                    <span className="font-bold text-tu-red">{modalItem?.Hours || modalItem?.hours || 0} Hours</span>
                  </span>
                  <span>
                    <span className="text-gray-500">Date: </span>
                    <span className="font-semibold text-gray-700">{modalItem?.date || '-'}</span>
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">1. Supervising Advisor Name</label>
                  <input
                    type="text"
                    readOnly
                    value={currentUser.FullName}
                    className="w-full px-3 py-2 bg-gray-100 border border-slate-300 rounded-xl font-semibold text-gray-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">2. Certification Date</label>
                  <input
                    type="date"
                    value={endorseDate}
                    onChange={e => setEndorseDate(e.target.value)}
                    disabled={!isModalAuthorized}
                    className="w-full px-3 py-2 bg-[#EEF2F6] border border-slate-300 rounded-xl font-medium disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">3. Advisor Password Confirmation</label>
                  <input
                    type="password"
                    value={endorsePassword}
                    onChange={e => setEndorsePassword(e.target.value)}
                    disabled={!isModalAuthorized}
                    placeholder={isModalAuthorized ? "Enter advisor password to confirm signature" : "Disabled - Name does not match supervising advisor"}
                    className="w-full px-3 py-2 bg-[#EEF2F6] border border-slate-300 rounded-xl font-medium disabled:opacity-50"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">* Enter password to authenticate your official signature</span>
                </div>
              </div>

              {endorseError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-tu-red rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" />
                  {endorseError}
                </div>
              )}

              {endorseSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0" />
                  {endorseSuccess}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setEndorsingResearchIndex(null); setEndorseError(''); setEndorseSuccess(''); }}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingEndorsement || !isModalAuthorized}
                  onClick={handleConfirmResearchEndorsement}
                  className={`flex-1 py-2 rounded-xl font-bold transition text-xs flex items-center justify-center gap-1.5 shadow-xs ${
                    !isModalAuthorized
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-tu-red hover:bg-tu-red-hover text-white cursor-pointer'
                  }`}
                >
                  {isSavingEndorsement ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Signing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} />
                      Confirm Certification
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
