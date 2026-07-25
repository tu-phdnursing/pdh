/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Certificate, Activity, StudentPortfolioData } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Award, Clock, CheckCircle2, XCircle, MessageSquare, GraduationCap, ChevronRight, FileText, Check, AlertTriangle, Paperclip, ExternalLink, Calendar, Loader2 } from 'lucide-react';
import { resolvePhotoUrl, resolveFileUrl, formatDisplayDate, getStudentPortfolio } from '../lib/googleSheets';
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
  const [activeTab, setActiveTab] = useState<'certs' | 'activities' | 'profile' | 'portfolio'>('profile');
  
  // Feedback states
  const [feedbackText, setFeedbackText] = useState('');
  const [actingId, setActingId] = useState<string | null>(null);

  // Filter students under this Advisor's supervision
  const myStudents = students.filter(s => {
    if (s.Role !== 'STUDENT') return false;
    if (currentUser.Role === 'SUPER_ADVISOR' || currentUser.Role === 'ADMIN') return true;
    
    const isMainAdvisor = s.Advisor && typeof s.Advisor === 'string' && 
      s.Advisor.toLowerCase().trim() === currentUser.FullName.toLowerCase().trim();
      
    const isCoAdvisor = s.CoAdvisor && typeof s.CoAdvisor === 'string' && 
      s.CoAdvisor.toLowerCase().trim() === currentUser.FullName.toLowerCase().trim();
      
    return isMainAdvisor || isCoAdvisor;
  });

  // Default to selecting the first student for convenient overview if none is selected
  const activeStudent = selectedStudent;

  const handleVerifyCert = async (certId: string, status: 'APPROVED' | 'REJECTED') => {
    setActingId(certId);
    await onVerifyCertificate(certId, status, feedbackText);
    setFeedbackText('');
    setActingId(null);
  };

  const handleVerifyAct = async (actId: string, status: 'APPROVED' | 'REJECTED') => {
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
                        const isImg = firstFile && (/\.(png|jpe?g|gif|webp)$/i.test(firstFile.name) || firstFile.url.includes('images.unsplash.com') || firstFile.url.startsWith('LOCAL_FILE_'));
                        const coverUrl = isImg ? resolveFileUrl(firstFile.url) : 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80';

                        return (
                          <div key={cert.CertID} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
                            <div className="relative h-44 bg-gray-50">
                              <img src={coverUrl} alt={cert.Name} className="w-full h-full object-cover" />
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
    </div>
  );
}
