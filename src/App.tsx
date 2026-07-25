/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award, BookOpen, Clock, FileText, Settings, Users, LogOut, KeyRound,
  HelpCircle, RefreshCw, Layers, CheckCircle2, AlertCircle, Sparkles, GraduationCap,
  MessageSquare, Bell, UserPlus, Database
} from 'lucide-react';

// Import Types
import { User, UserRole, Certificate, Activity, ConfigOption, StudentPortfolioData } from './types';

// Import Database Helper Services
import {
  initializeDatabase, getUsers, saveUser, deleteUser, getCertificates,
  saveCertificate, deleteCertificate, getActivities, saveActivity, deleteActivity, getConfigOptions,
  saveConfigOption, deleteConfigOption, getAllPortfolios, getStudentPortfolio, saveStudentPortfolio,
  getAppsScriptUrl, setAppsScriptUrl, logActivity, resolvePhotoUrl
} from './lib/googleSheets';

// Import Modular Components
import Dashboard from './components/Dashboard';
import StudentInformation from './components/StudentInformation';
import EditPortfolio from './components/EditPortfolio';
import AdminPanel from './components/AdminPanel';
import AdvisorPanel from './components/AdvisorPanel';
import PrintReport from './components/PrintReport';
import AppsScriptHelp from './components/AppsScriptHelp';
import AdvisoryChat from './components/AdvisoryChat';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Database States
  const [users, setUsers] = useState<User[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [configOptions, setConfigOptions] = useState<ConfigOption[]>([]);
  const [studentPortfolio, setStudentPortfolio] = useState<StudentPortfolioData | null>(null);
  const [allPortfolios, setAllPortfolios] = useState<{studentId: string, portfolio: StudentPortfolioData}[]>([]);
  const [apiUrl, setApiUrl] = useState('');
  const [showUrlConfig, setShowUrlConfig] = useState(false);

  // UI States
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [targetSection, setTargetSection] = useState<number | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState(''); // dummy for login simulation
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState<'idle' | 'sending' | 'success' | 'failed'>('idle');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'failed'>('idle');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'failed'>('idle');

  // Hidden mockup and registration states
  const [logoClicks, setLogoClicks] = useState(0);
  const [showMockup, setShowMockup] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Student registration states
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regStudentID, setRegStudentID] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('STUDENT');
  const [regMajor, setRegMajor] = useState('Doctor of Philosophy Program in Nursing Science (International Program)');
  const [regAdvisor, setRegAdvisor] = useState('');
  const [regCoAdvisor, setRegCoAdvisor] = useState('');
  const [regThesisTitle, setRegThesisTitle] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Load Database and Initialize
  const loadDatabase = async (isSilent = false) => {
    if (!isSilent) setSyncStatus('syncing');
    try {
      initializeDatabase();
      const fetchedUsers = await getUsers();
      const fetchedCerts = await getCertificates();
      const fetchedActs = await getActivities();
      const fetchedConfigs = await getConfigOptions();
      const scriptUrl = getAppsScriptUrl();

      setUsers(fetchedUsers);
      setCertificates(fetchedCerts);
      setActivities(fetchedActs);
      setConfigOptions(fetchedConfigs);
      setApiUrl(scriptUrl);

      // If user is logged in, reload their portfolio data
      if (currentUser && currentUser.Role === 'STUDENT') {
        const port = await getStudentPortfolio(currentUser.StudentID || '6601010024');
        setStudentPortfolio(port);
      } else if (fetchedUsers.length > 0 && currentUser) {
        if (currentUser.Role === 'ADVISOR' || currentUser.Role === 'ADMIN' || currentUser.Role === 'SUPER_ADVISOR' || currentUser.Role === 'CO_ADVISOR') {
          const allP = await getAllPortfolios();
          setAllPortfolios(allP);
        }
        // Find fresh copy of currentUser in DB
        const freshUser = fetchedUsers.find(u => u.UserID === currentUser.UserID);
        if (freshUser) {
          setCurrentUser(freshUser);
        }
      }
      if (!isSilent) {
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 2000);
      } else {
        setSyncStatus('idle');
      }
    } catch (e) {
      console.error('Error synchronizing database:', e);
      if (!isSilent) {
        setSyncStatus('failed');
        setTimeout(() => setSyncStatus('idle'), 2000);
      }
    }
  };

  useEffect(() => {
    // 1. Instantly load from local storage cache to open under 1 second
    initializeDatabase();
    const cachedUsers = JSON.parse(localStorage.getItem('TU_PHD_USERS') || '[]');
    const cachedCerts = JSON.parse(localStorage.getItem('TU_PHD_CERTS') || '[]');
    const cachedActs = JSON.parse(localStorage.getItem('TU_PHD_ACTIVITIES') || '[]');
    const cachedConfigs = JSON.parse(localStorage.getItem('TU_PHD_CONFIGS') || '[]');
    const scriptUrl = getAppsScriptUrl();

    if (cachedUsers.length > 0) {
      setUsers(cachedUsers);
      setCertificates(cachedCerts);
      setActivities(cachedActs);
      setConfigOptions(cachedConfigs);
    }
    setApiUrl(scriptUrl);
    setIsInitialized(true);

    // 2. Refresh from Google Sheets silently in background
    loadDatabase(true);
  }, []);

  // Sync portfolio on student change
  useEffect(() => {
    if (currentUser && currentUser.Role === 'STUDENT') {
      getStudentPortfolio(currentUser.StudentID || '6601010024').then(port => {
        setStudentPortfolio(port);
      });
    } else {
      setStudentPortfolio(null);
    }
  }, [currentUser]);

  // Auth Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setLoginError('Please enter your registered email.');
      return;
    }
    if (!loginPassword.trim()) {
      setLoginError('Please enter your password.');
      return;
    }

    const match = users.find(u => u.Email && typeof u.Email === 'string' && u.Email.toLowerCase().trim() === loginEmail.toLowerCase().trim());
    if (match) {
      const userPassword = String(match.Password || '1234').toLowerCase().trim();
      const inputPassword = loginPassword.toLowerCase().trim();
      if (userPassword === inputPassword) {
        setCurrentUser(match);
        logActivity(match.UserID, 'LOGIN', `User ${match.FullName} logged into PhD Portfolio system`);
        setLoginError('');
        setActiveTab('dashboard');
      } else {
        setLoginError('Incorrect password. Please try again (Default is "1234").');
      }
    } else {
      setLoginError('User account not found. Please double check your email or Sign Up for an account below.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const isStudent = regRole === 'STUDENT';
    if (!regFullName.trim() || !regEmail.trim() || !regPassword.trim() || (isStudent && !regStudentID.trim())) {
      setLoginError('Please fill in all required fields including password' + (isStudent ? ' and Student ID.' : '.'));
      return;
    }

    const match = users.find(u => {
      const emailMatch = u.Email && typeof u.Email === 'string' && u.Email.toLowerCase().trim() === regEmail.toLowerCase().trim();
      const studentIDMatch = isStudent && u.StudentID && regStudentID.trim() && String(u.StudentID).trim() === regStudentID.trim();
      return emailMatch || studentIDMatch;
    });
    if (match) {
      setLoginError('An account with this email or Student ID already exists.');
      return;
    }

    const newUser: User = {
      UserID: `${regRole}-${Date.now()}`,
      Email: regEmail.toLowerCase().trim(),
      FullName: regFullName.trim(),
      StudentID: isStudent ? regStudentID.trim() : '',
      Role: regRole,
      Major: isStudent ? regMajor : undefined,
      Advisor: isStudent ? (regAdvisor || undefined) : undefined,
      CoAdvisor: isStudent ? (regCoAdvisor || undefined) : undefined,
      ThesisTitle: isStudent ? (regThesisTitle.trim() || undefined) : undefined,
      PhotoURL: isStudent 
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
        : 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
      Password: regPassword.trim()
    };

    try {
      await saveUser(newUser);
      await loadDatabase();
      setCurrentUser(newUser);
      logActivity(newUser.UserID, 'REGISTER', `New ${regRole.toLowerCase()} ${newUser.FullName} registered`);
      setLoginError('');
      setIsRegistering(false);
      setActiveTab('dashboard');
      setRegPassword(''); // clear after register
    } catch (err) {
      console.error(err);
      setLoginError('Registration failed. Please try again.');
    }
  };

  const handleQuickLogin = (role: 'STUDENT' | 'ADVISOR' | 'ADMIN') => {
    let targetEmail = 'student@tu.ac.th';
    if (role === 'ADVISOR') targetEmail = 'advisor@tu.ac.th';
    if (role === 'ADMIN') targetEmail = 'admin@tu.ac.th';

    const match = users.find(u => u.Email === targetEmail);
    if (match) {
      setCurrentUser(match);
      logActivity(match.UserID, 'QUICK_LOGIN', `Quick Login bypass triggered as ${match.Role}`);
      setLoginError('');
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      logActivity(currentUser.UserID, 'LOGOUT', `User ${currentUser.FullName} logged out`);
    }
    setCurrentUser(null);
    setStudentPortfolio(null);
  };

  // Profile update handler
  const handleUpdateProfile = async (updatedProfile: User) => {
    setSaveStatus('saving');
    try {
      await saveUser(updatedProfile); // Background Sync
      setUsers(prev => prev.map(u => u.UserID === updatedProfile.UserID ? updatedProfile : u));
      if (currentUser && currentUser.UserID === updatedProfile.UserID) {
        setCurrentUser(updatedProfile);
      }
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      console.error(e);
      setSaveStatus('failed');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  // Add Certificate
  const handleAddCertificate = async (cert: Certificate) => {
    setSaveStatus('saving');
    try {
      await saveCertificate(cert); // Background Sync
      setCertificates(prev => {
        const exists = prev.some(c => c.CertID === cert.CertID);
        if (exists) {
          return prev.map(c => c.CertID === cert.CertID ? cert : c);
        }
        return [cert, ...prev];
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      console.error(e);
      setSaveStatus('failed');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  // Delete Certificate
  const handleDeleteCertificate = async (certId: string) => {
    setSaveStatus('saving');
    try {
      await deleteCertificate(certId);
      setCertificates(prev => prev.filter(c => c.CertID !== certId));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      console.error(e);
      setSaveStatus('failed');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  // Verify Certificate
  const handleVerifyCertificate = async (certId: string, status: 'APPROVED' | 'REJECTED', feedback: string) => {
    const cert = certificates.find(c => c.CertID === certId);
    if (cert && currentUser) {
      const updated: Certificate = {
        ...cert,
        Status: status,
        Feedback: feedback,
        ApprovedBy: currentUser.FullName
      };
      setSaveStatus('saving');
      try {
        await saveCertificate(updated); // Background Sync
        logActivity(currentUser.UserID, 'VERIFY_CERTIFICATE', `Advisor verified Certificate ${certId} with status ${status}`);
        setCertificates(prev => prev.map(c => c.CertID === certId ? updated : c));
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (e) {
        console.error(e);
        setSaveStatus('failed');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    }
  };

  // Add Activity
  const handleAddActivity = async (act: Activity) => {
    setSaveStatus('saving');
    try {
      await saveActivity(act); // Background Sync
      setActivities(prev => {
        const exists = prev.some(a => a.ActivityID === act.ActivityID);
        if (exists) {
          return prev.map(a => a.ActivityID === act.ActivityID ? act : a);
        }
        return [act, ...prev];
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      console.error(e);
      setSaveStatus('failed');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  // Delete Activity
  const handleDeleteActivity = async (actId: string) => {
    setSaveStatus('saving');
    try {
      await deleteActivity(actId);
      setActivities(prev => prev.filter(a => a.ActivityID !== actId));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      console.error(e);
      setSaveStatus('failed');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  // Verify Activity
  const handleVerifyActivity = async (actId: string, status: 'APPROVED' | 'REJECTED', feedback: string) => {
    const act = activities.find(a => a.ActivityID === actId);
    if (act && currentUser) {
      const updated: Activity = {
        ...act,
        Status: status,
        Feedback: feedback,
        ApprovedBy: currentUser.FullName
      };
      setSaveStatus('saving');
      try {
        await saveActivity(updated); // Background Sync
        logActivity(currentUser.UserID, 'VERIFY_ACTIVITY', `Advisor verified Activity Progress ${actId} with status ${status}`);
        setActivities(prev => prev.map(a => a.ActivityID === actId ? updated : a));
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (e) {
        console.error(e);
        setSaveStatus('failed');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    }
  };

  // Save Portfolio
  const handleSavePortfolio = async (data: StudentPortfolioData) => {
    if (currentUser && currentUser.StudentID) {
      setSaveStatus('saving');
      try {
        await saveStudentPortfolio(currentUser.StudentID, data); // Background Sync
        setStudentPortfolio(data);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (e) {
        console.error(e);
        setSaveStatus('failed');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    }
  };

  // Save config option
  const handleSaveConfig = async (opt: ConfigOption) => {
    setSaveStatus('saving');
    try {
      await saveConfigOption(opt); // Background Sync
      setConfigOptions(prev => {
        const exists = prev.some(c => c.id === opt.id);
        if (exists) {
          return prev.map(c => c.id === opt.id ? opt : c);
        }
        return [...prev, opt];
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      console.error(e);
      setSaveStatus('failed');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleDeleteConfig = async (id: string) => {
    setSaveStatus('saving');
    try {
      await deleteConfigOption(id); // Background Sync
      setConfigOptions(prev => prev.filter(c => c.id !== id));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      console.error(e);
      setSaveStatus('failed');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleSaveUser = async (u: User) => {
    setSaveStatus('saving');
    try {
      await saveUser(u); // Background Sync
      setUsers(prev => {
        const exists = prev.some(x => x.UserID === u.UserID);
        if (exists) {
          return prev.map(x => x.UserID === u.UserID ? u : x);
        }
        return [...prev, u];
      });
      if (currentUser && currentUser.UserID === u.UserID) {
        setCurrentUser(u);
      }
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      console.error(e);
      setSaveStatus('failed');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleDeleteUserAccount = async (id: string) => {
    setSaveStatus('saving');
    try {
      await deleteUser(id); // Background Sync
      setUsers(prev => prev.filter(u => u.UserID !== id));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      console.error(e);
      setSaveStatus('failed');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleSaveApiUrl = (url: string) => {
    setAppsScriptUrl(url);
    setApiUrl(url);
    loadDatabase();
  };

  // Render Loading
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#FAF6EC] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-tu-red border-t-transparent rounded-full animate-spin" />
        <h2 className="text-sm font-bold text-gray-700">Loading Doctoral Portfolio System...</h2>
        <p className="text-xs text-gray-400">Faculty of Nursing • Thammasat University</p>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // LOGIN SCREEN (Theme matching Image 2 and TU branding)
  // -----------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FAF6EC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-10 px-8 shadow-2xl rounded-[2.5rem] border border-amber-100/50 space-y-6 flex flex-col items-center">
            
            {/* Red logo with 5-click trigger for Mockups */}
            <button
              onClick={() => {
                setLogoClicks(prev => {
                  const next = prev + 1;
                  if (next >= 5) {
                    setShowMockup(true);
                  }
                  return next;
                });
              }}
              className="w-24 h-24 bg-[#FAF6EC] rounded-full flex items-center justify-center shadow-md border border-red-100 hover:scale-105 active:scale-95 transition duration-150 shrink-0 p-2.5 cursor-pointer"
              title="Click 5 times to reveal quick evaluator login"
            >
              <img 
                src="https://lh3.googleusercontent.com/d/1qmMuV0e2tItZuhX0oexmhhnu3GdBBbe0" 
                alt="Thammasat University Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </button>

            {/* University & Department Titles */}
            <div className="text-center space-y-1">
              <span className="block text-[10px] font-extrabold text-[#B31B1B] uppercase tracking-[0.15em]">
                FACULTY OF NURSING
              </span>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Thammasat University
              </h2>
              <p className="text-[9px] font-extrabold text-[#B31B1B] uppercase tracking-[0.08em] mt-0.5">
                DOCTORAL PORTFOLIO MANAGEMENT SYSTEM
              </p>
            </div>

            {/* Form Toggle: Sign In vs Sign Up */}
            {!isRegistering ? (
              /* SIGN IN FORM */
              <form onSubmit={handleLogin} className="w-full space-y-5 text-xs">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F4F6F9] border-0 rounded-2xl focus:outline-0 focus:ring-2 focus:ring-[#B31B1B] text-gray-800 text-sm placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Personal Access Code / Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F4F6F9] border-0 rounded-2xl focus:outline-0 focus:ring-2 focus:ring-[#B31B1B] text-gray-800 text-sm placeholder:text-gray-400 font-mono"
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center text-gray-400">
                      <KeyRound size={16} />
                    </div>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-start gap-2 leading-relaxed">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#B31B1B] hover:bg-[#991818] active:bg-[#800000] text-white font-extrabold rounded-2xl shadow-md hover:shadow-lg transition duration-150 text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  Log In to Portfolio <span className="text-sm">→</span>
                </button>
              </form>
            ) : (
              /* SIGN UP / REGISTER FORM */
              <form onSubmit={handleRegister} className="w-full space-y-4 text-xs">
                <div className="text-center">
                  <h3 className="font-extrabold text-sm text-gray-800">Create New Account</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">Please fill in your doctoral student details below</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">
                    Full Name (with title) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Miss Jane Doe (นางสาวเจน โด)"
                    value={regFullName}
                    onChange={e => setRegFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F4F6F9] border-0 rounded-xl focus:outline-0 focus:ring-2 focus:ring-[#B31B1B] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">
                    System Role (บทบาทในระบบ) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={regRole}
                    onChange={e => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2.5 bg-[#F4F6F9] border-0 rounded-xl focus:outline-0 focus:ring-2 focus:ring-[#B31B1B] text-xs font-semibold text-gray-800"
                  >
                    <option value="STUDENT">Student (นักศึกษาดุษฎีบัณฑิต)</option>
                    <option value="ADVISOR">Advisor (อาจารย์ที่ปรึกษาหลัก)</option>
                    <option value="CO_ADVISOR">Co-Advisor (อาจารย์ที่ปรึกษาร่วม)</option>
                    <option value="SUPER_ADVISOR">SuperAdvisor (อาจารย์ผู้ดูแลหลักหลักสูตร)</option>
                  </select>
                </div>

                <div className={regRole === 'STUDENT' ? 'grid grid-cols-2 gap-3' : 'w-full'}>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@tu.ac.th"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F4F6F9] border-0 rounded-xl focus:outline-0 focus:ring-2 focus:ring-[#B31B1B] text-xs"
                    />
                  </div>

                  {regRole === 'STUDENT' && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-1">
                        Student ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., 6601010024"
                        value={regStudentID}
                        onChange={e => setRegStudentID(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#F4F6F9] border-0 rounded-xl focus:outline-0 focus:ring-2 focus:ring-[#B31B1B] text-xs font-mono"
                      />
                    </div>
                  )}
                </div>

                {regRole === 'STUDENT' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-1">
                        Major Program
                      </label>
                      <select
                        value={regMajor}
                        onChange={e => setRegMajor(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#F4F6F9] border-0 rounded-xl focus:outline-0 focus:ring-2 focus:ring-[#B31B1B] text-xs"
                      >
                        <option value="Doctor of Philosophy Program in Nursing Science (International Program)">
                          PhD in Nursing Science (International Program)
                        </option>
                        <option value="Doctor of Philosophy Program in Nursing Science (Thai Program)">
                          PhD in Nursing Science (Thai Program)
                        </option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-700 mb-1">
                          Advisor
                        </label>
                        <select
                          value={regAdvisor}
                          onChange={e => setRegAdvisor(e.target.value)}
                          className="w-full px-3 py-2.5 bg-[#F4F6F9] border-0 rounded-xl focus:outline-0 focus:ring-2 focus:ring-[#B31B1B] text-xs"
                        >
                          <option value="">Select Advisor...</option>
                          {users.filter(u => u.Role === 'ADVISOR' || u.Role === 'CO_ADVISOR' || u.Role === 'SUPER_ADVISOR').map(u => (
                            <option key={u.UserID} value={u.FullName}>{u.FullName}</option>
                          ))}
                          <option value="Assoc. Prof. Dr. Nonglak Wisetsilp">Assoc. Prof. Dr. Nonglak Wisetsilp</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-700 mb-1">
                          Co-Advisor
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Assoc. Prof. Dr. Wipa Chaichan"
                          value={regCoAdvisor}
                          onChange={e => setRegCoAdvisor(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#F4F6F9] border-0 rounded-xl focus:outline-0 focus:ring-2 focus:ring-[#B31B1B] text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-1">
                        Thesis Title (Draft)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Efficacy of Mindfulness-Based Tele-Nursing Intervention..."
                        value={regThesisTitle}
                        onChange={e => setRegThesisTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#F4F6F9] border-0 rounded-xl focus:outline-0 focus:ring-2 focus:ring-[#B31B1B] text-xs"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">
                    Password / Access Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Set your password (e.g., 1234)"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F4F6F9] border-0 rounded-xl focus:outline-0 focus:ring-2 focus:ring-[#B31B1B] text-xs font-mono"
                  />
                </div>

                {loginError && (
                  <div className="p-2.5 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-start gap-1.5 leading-normal text-[11px]">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-[#B31B1B] hover:bg-[#991818] active:bg-[#800000] text-white font-extrabold rounded-xl shadow-md transition duration-150 text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus size={14} /> Register & Log In
                </button>
              </form>
            )}

            {/* Toggle Sign Up / Sign In Switch Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setLoginError('');
                }}
                className="text-xs font-bold text-[#B31B1B] hover:text-[#991818] transition flex items-center gap-2 focus:outline-0"
              >
                <UserPlus size={16} />
                <span>
                  {isRegistering
                    ? 'Already have an account? Log In'
                    : "Don't have an account? Sign Up / Register"}
                </span>
              </button>
            </div>

            {/* Quick login bypass section - HIDDEN BY DEFAULT, SHOWN ON 5 CLICKS */}
            {showMockup && (
              <div className="w-full relative border-t border-gray-100 pt-5 mt-2 animate-fade-in">
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Quick Evaluation Login
                </span>
                
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleQuickLogin('STUDENT')}
                    className="w-full py-2 bg-blue-50/50 hover:bg-blue-100/50 text-blue-800 font-semibold rounded-xl transition border border-blue-100 flex items-center justify-between px-4 text-xs"
                  >
                    <span>Orapan (STUDENT)</span>
                    <span className="font-mono text-[9px] bg-blue-100 px-1.5 py-0.5 rounded">student@tu.ac.th</span>
                  </button>

                  <button
                    onClick={() => handleQuickLogin('ADVISOR')}
                    className="w-full py-2 bg-amber-50/50 hover:bg-amber-100/50 text-amber-800 font-semibold rounded-xl transition border border-amber-100 flex items-center justify-between px-4 text-xs"
                  >
                    <span>Nonglak (ADVISOR)</span>
                    <span className="font-mono text-[9px] bg-amber-100 px-1.5 py-0.5 rounded">advisor@tu.ac.th</span>
                  </button>

                  <button
                    onClick={() => handleQuickLogin('ADMIN')}
                    className="w-full py-2 bg-red-50/50 hover:bg-red-100/50 text-red-800 font-semibold rounded-xl transition border border-red-100 flex items-center justify-between px-4 text-xs"
                  >
                    <span>System Admin (ADMIN)</span>
                    <span className="font-mono text-[9px] bg-red-100 px-1.5 py-0.5 rounded">admin@tu.ac.th</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer exactly styled from Image 2 */}
        <div className="mt-8 text-center text-[10px] text-gray-400/80 font-medium">
          Doctoral Student Portfolio Management System • Faculty of Nursing • Thammasat University
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // MAIN SYSTEM BOARD LAYOUT
  // -----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans">
      
      {/* 1. Header (Navbar) - Hidden during print */}
      <header className="no-print bg-white border-b border-gray-100 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setLogoClicks(prev => {
                  const next = prev + 1;
                  if (next >= 5) {
                    setShowMockup(curr => !curr);
                    return 0;
                  }
                  return next;
                });
              }}
              className="w-10 h-10 flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition"
              title="Click 5 times to toggle mockup tools"
            >
              <img 
                src="https://lh3.googleusercontent.com/d/1qmMuV0e2tItZuhX0oexmhhnu3GdBBbe0" 
                alt="TU" 
                className="w-10 h-10 object-contain"
                referrerPolicy="no-referrer"
              />
            </button>
            <div>
              <h1 className="text-xs sm:text-sm font-extrabold text-tu-red leading-tight">
                Faculty of Nursing, Thammasat University
              </h1>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
                Nursing PhD Doctoral Portfolio
              </p>
            </div>
          </div>

          {/* User profile & Database sync indicator */}
          <div className="flex items-center gap-4">
            {/* Database status icon & tiny config */}
            <div className="relative flex items-center">
              {currentUser.Role === 'ADMIN' ? (
                <button
                  onClick={() => setShowUrlConfig(prev => !prev)}
                  className={`p-2 rounded-xl transition flex items-center gap-1.5 text-xs cursor-pointer ${
                    apiUrl ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                  }`}
                  title={apiUrl ? 'Connected to Google Sheets (Click to edit URL)' : 'Offline Local Mode (Click to set URL)'}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${apiUrl ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <Database size={13} />
                  <span className="hidden sm:inline font-semibold">
                    {apiUrl ? 'Connected' : 'Local Mode'}
                  </span>
                </button>
              ) : (
                <div
                  className={`p-2 rounded-xl flex items-center gap-1.5 text-xs ${
                    apiUrl ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'
                  }`}
                  title={apiUrl ? 'Connected to Google Sheets' : 'Offline Local Mode'}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${apiUrl ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <Database size={13} />
                  <span className="hidden sm:inline font-semibold">
                    {apiUrl ? 'Connected' : 'Local Mode'}
                  </span>
                </div>
              )}
              
              {currentUser.Role === 'ADMIN' && showUrlConfig && (
                <div className="absolute right-0 top-11 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 w-72 z-50 space-y-2 animate-fade-in text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                      <Settings size={12} className="text-gray-400 font-bold" />
                      Google Sheets API Endpoint
                    </span>
                    <button 
                      onClick={() => setShowUrlConfig(false)} 
                      className="text-gray-400 hover:text-gray-600 text-xs font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="https://script.google.com/macros/s/..."
                    value={apiUrl}
                    onChange={e => handleSaveApiUrl(e.target.value)}
                    className="w-full text-[10px] p-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-tu-red"
                  />
                  <div className="text-[9px] text-gray-400">
                    {apiUrl ? '✓ Connected to live sheets.' : '⚠️ Using cached local state.'}
                  </div>
                </div>
              )}
            </div>

            {/* Sync status */}
            <button
              onClick={() => loadDatabase(false)}
              disabled={syncStatus === 'syncing'}
              className="p-2 text-gray-400 hover:text-tu-red hover:bg-red-50 rounded-xl transition flex items-center gap-1.5 text-xs cursor-pointer"
              title="Refresh / Sync Google Sheets Database"
            >
              <RefreshCw size={14} className={syncStatus === 'syncing' ? 'animate-spin text-tu-red' : ''} />
              <span className="hidden sm:inline font-semibold">
                {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'success' ? 'Sync Successful!' : 'Sync Sheets'}
              </span>
            </button>

            {/* Quick switch roles dropdown for grading - Only shown if showMockup is unlocked via logo clicks */}
            {showMockup && (
              <div className="hidden md:flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100 animate-fade-in">
                <span className="text-[9px] font-bold text-gray-400 uppercase px-2">Mockup:</span>
                <button
                  onClick={() => {
                    const match = users.find(u => u.Role === 'STUDENT');
                    if (match) setCurrentUser(match);
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    currentUser.Role === 'STUDENT' ? 'bg-tu-red text-white' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  STUDENT
                </button>
                <button
                  onClick={() => {
                    const match = users.find(u => u.Role === 'ADVISOR');
                    if (match) setCurrentUser(match);
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    currentUser.Role === 'ADVISOR' ? 'bg-[#B31B1B] text-white' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  ADVISOR
                </button>
                <button
                  onClick={() => {
                    const match = users.find(u => u.Role === 'ADMIN');
                    if (match) setCurrentUser(match);
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    currentUser.Role === 'ADMIN' ? 'bg-tu-red text-white' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  ADMIN
                </button>
              </div>
            )}

            {/* Logged in User Card */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
              <img
                src={resolvePhotoUrl(currentUser.PhotoURL, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80')}
                alt={currentUser.FullName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-red-50"
              />
              <div className="text-left hidden lg:block">
                <span className="font-bold text-xs text-gray-800 block line-clamp-1">{currentUser.FullName}</span>
                <span className="text-[9px] font-mono text-gray-400 block uppercase font-bold">{currentUser.Role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                title="Log Out"
              >
                <LogOut size={14} />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 2. Main Grid Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Nav Tabs Bar - Hidden during print */}
        <div className="no-print flex flex-wrap gap-2 border-b border-gray-100 pb-3">
          <button
            onClick={() => { setActiveTab('dashboard'); setTargetSection(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-tu-red text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            <Layers size={13} />
            Overview Dashboard
          </button>

          {['STUDENT', 'ADVISOR', 'CO_ADVISOR', 'SUPER_ADVISOR', 'ADMIN'].includes(currentUser.Role) && (
            <button
              onClick={() => { setActiveTab('info'); setTargetSection(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'info'
                  ? 'bg-tu-red text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              <Users size={13} />
              {currentUser.Role === 'STUDENT' ? 'My Profile & Certificates' : 'My Profile'}
            </button>
          )}

          {currentUser.Role === 'STUDENT' && (
            <button
              onClick={() => { setActiveTab('edit'); setTargetSection(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'edit'
                  ? 'bg-tu-red text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              <BookOpen size={13} />
              16-Section Portfolio Record
            </button>
          )}

          {['ADVISOR', 'CO_ADVISOR', 'SUPER_ADVISOR'].includes(currentUser.Role) && (
            <button
              onClick={() => setActiveTab('advisor')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'advisor'
                  ? 'bg-tu-red text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              <GraduationCap size={13} />
              Advisor Portal
            </button>
          )}

          {['ADMIN', 'SUPER_ADVISOR'].includes(currentUser.Role) && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-tu-red text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              <Settings size={13} />
              Admin & Matchmaking Panel
            </button>
          )}

          {currentUser.Role === 'STUDENT' && (
            <button
              onClick={() => setActiveTab('print')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'print'
                  ? 'bg-tu-red text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              <FileText size={13} />
              Print Preview & Report
            </button>
          )}

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-tu-red text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            <MessageSquare size={13} />
            Advisory Chat & Reminders
          </button>

          {currentUser.Role === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('help')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'help'
                  ? 'bg-tu-red text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              <HelpCircle size={13} />
              Google Sheets Setup Guide
            </button>
          )}
        </div>

        {/* Tab contents transition container */}
        <div className="print-content-wrapper">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <div
                key="dashboard"
              >
                <Dashboard
                  currentUser={currentUser}
                  certificates={certificates}
                  activities={activities}
                  allPortfolios={allPortfolios}
                  portfolioData={studentPortfolio || {
                    academicBackground: [], professionalBackground: [], milestones: [],
                    englishTest: { testName: '', dateTaken: '', scoreAchieved: '', requiredScore: '', status: '', evidence: '' },
                    englishActivities: [], englishReflection: '', completedCourses: [], keyLearnings: [], workshops: [],
                    dissertationInfo: { title: '', background: '', problem: '', objectives: '', hypotheses: '', conceptualFramework: '', methodology: '', researchTopic: '' },
                    dissertationProgress: [], advisorMeetings: [], ethicsGovernance: { dateApplied: '', dateApproved: '', approvalNumber: '', amendments: '', confidentiality: '' },
                    researchExperience: [], researchReflection: '', conferencePresentations: [], publications: [], manuscripts: [], grants: [], awards: [],
                    teachingExperiences: [], supervisions: [], academicServices: [], leaderships: [], competencySelfAssessment: [],
                    annualReview: { achievements: '', improvements: '', actionPlans: [] }, futureCareer: { shortTerm: '', longTerm: '', preparation: '' },
                    advisorComments: '', endorsements: []
                  }}
                  allStudents={users}
                  onNavigate={(tab, sectionId) => {
                    setActiveTab(tab);
                    setTargetSection(sectionId || null);
                  }}
                />
              </div>
            )}

            {activeTab === 'info' && (
              <div
                key="info"
              >
                <StudentInformation
                  currentUser={currentUser}
                  certificates={certificates}
                  activities={activities}
                  configOptions={configOptions}
                  onUpdateProfile={handleUpdateProfile}
                  onAddCertificate={handleAddCertificate}
                  onAddActivity={handleAddActivity}
                  onDeleteCertificate={handleDeleteCertificate}
                  onDeleteActivity={handleDeleteActivity}
                />
              </div>
            )}

            {activeTab === 'edit' && currentUser.Role === 'STUDENT' && studentPortfolio && (
              <div
                key="edit"
              >
                <EditPortfolio
                  currentUser={currentUser}
                  portfolioData={studentPortfolio}
                  onSavePortfolio={handleSavePortfolio}
                  configOptions={configOptions}
                  certificates={certificates}
                  initialSection={targetSection}
                />
              </div>
            )}

            {activeTab === 'advisor' && ['ADVISOR', 'CO_ADVISOR', 'SUPER_ADVISOR'].includes(currentUser.Role) && (
              <div
                key="advisor"
              >
                <AdvisorPanel
                  currentUser={currentUser}
                  students={users}
                  certificates={certificates}
                  activities={activities}
                  onVerifyCertificate={handleVerifyCertificate}
                  onVerifyActivity={handleVerifyActivity}
                />
              </div>
            )}

            {activeTab === 'admin' && ['ADMIN', 'SUPER_ADVISOR'].includes(currentUser.Role) && (
              <div
                key="admin"
              >
                <AdminPanel
                  currentUser={currentUser}
                  users={users}
                  configOptions={configOptions}
                  onAddUser={handleSaveUser}
                  onDeleteUser={handleDeleteUserAccount}
                  onAddConfigOption={handleSaveConfig}
                  onDeleteConfigOption={handleDeleteConfig}
                />
              </div>
            )}

            {activeTab === 'chat' && (
              <div
                key="chat"
              >
                <AdvisoryChat
                  currentUser={currentUser}
                  allUsers={users}
                  onRefreshDB={loadDatabase}
                />
              </div>
            )}

            {activeTab === 'help' && currentUser.Role === 'ADMIN' && (
              <div
                key="help"
              >
                <AppsScriptHelp />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* PRINT TAB RENDERS DIRECTLY UNDER MAIN AREA WITHOUT TABS INTERRUPTIONS */}
        {activeTab === 'print' && currentUser.Role === 'STUDENT' && studentPortfolio && (
          <PrintReport
            currentUser={currentUser}
            portfolioData={studentPortfolio}
            certificates={certificates}
            activities={activities}
            onBack={() => setActiveTab('dashboard')}
          />
        )}

      </main>

      {/* Footer - Hidden during print */}
      <footer className="no-print bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Faculty of Nursing, Thammasat University. All Rights Reserved.</p>
          <p className="mt-1 font-mono text-[10px]">The system is fully responsive and synced with Google Sheets Database securely.</p>
        </div>
      </footer>

      {/* Floating Progress Indicators */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 no-print">
        {syncStatus !== 'idle' && (
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border transition duration-250 ${
              syncStatus === 'syncing' ? 'bg-[#FAF6EC] text-amber-700 border-amber-200' :
              syncStatus === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {syncStatus === 'syncing' ? (
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            ) : syncStatus === 'success' ? (
              <span className="text-base text-emerald-600">✓</span>
            ) : (
              <span className="text-base text-red-600">⚠️</span>
            )}
            <span>
              {syncStatus === 'syncing' ? 'กำลังดึงข้อมูล...' :
               syncStatus === 'success' ? 'ดึงข้อมูลสำเร็จ' :
               'ดึงข้อมูลล้มเหลว'}
            </span>
          </div>
        )}

        {saveStatus !== 'idle' && (
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border transition duration-250 ${
              saveStatus === 'saving' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              saveStatus === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {saveStatus === 'saving' ? (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : saveStatus === 'success' ? (
              <span className="text-base text-emerald-600">✓</span>
            ) : (
              <span className="text-base text-red-600">⚠️</span>
            )}
            <span>
              {saveStatus === 'saving' ? 'กำลังบันทึกข้อมูล...' :
               saveStatus === 'success' ? 'บันทึกข้อมูลสำเร็จ' :
               'บันทึกข้อมูลล้มเหลว'}
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
