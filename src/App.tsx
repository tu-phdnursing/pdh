/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  GraduationCap, 
  User as UserIcon, 
  BookOpen, 
  Bell, 
  MessageSquare, 
  Printer, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Clock, 
  FileText, 
  ChevronRight, 
  Users, 
  Copy, 
  Check, 
  Database, 
  Server, 
  TrendingUp, 
  Award, 
  HelpCircle,
  Phone,
  Grid,
  Send,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, PortfolioRecord, StudentProfile, Dissertation, ResearchHour, CompetencyAssessment, AdvisorComment, Endorsement, Evidence, Notification, ChatMessage, Setting, AppState } from "./types";
import { SECTIONS_CONFIG, COMPETENCIES } from "./sectionsData";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [email, setEmail] = useState("student@example.com");
  const [password, setPassword] = useState("1234");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<string>("dashboard");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  // App Data State
  const [users, setUsers] = useState<User[]>([]);
  const [portfolioRecords, setPortfolioRecords] = useState<PortfolioRecord[]>([]);
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>([]);
  const [dissertations, setDissertations] = useState<Dissertation[]>([]);
  const [researchHours, setResearchHours] = useState<ResearchHour[]>([]);
  const [competencyAssessments, setCompetencyAssessments] = useState<CompetencyAssessment[]>([]);
  const [advisorComments, setAdvisorComments] = useState<AdvisorComment[]>([]);
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);

  // Local UI helper states
  const [selectedSection, setSelectedSection] = useState<number>(1);
  const [activeChatPeerId, setActiveChatPeerId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Dialog / Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Code Export View states
  const [gasCodeGs, setGasCodeGs] = useState("");
  const [gasIndexHtml, setGasIndexHtml] = useState("");
  const [copiedGs, setCopiedGs] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  // Form states
  const [editingRecord, setEditingRecord] = useState<PortfolioRecord | null>(null);
  const [recordForm, setRecordForm] = useState({
    SubsectionTitle: "",
    Field1: "",
    Field2: "",
    Field3: "",
    Field4: "",
    Field5: "",
    Field6: "",
    Field7: "",
    LongText: "",
    Status: "Draft"
  });

  const [profileForm, setProfileForm] = useState({
    FullName: "",
    Phone: "",
    LineID: "",
    ORCID: "",
    ResearchInterests: "",
    GoalsForDoctoralStudy: ""
  });

  const [commentForm, setCommentForm] = useState({
    CommentText: "",
    Recommendation: "Approved to proceed"
  });

  const [broadcastForm, setBroadcastForm] = useState({
    ReceiverUserID: "",
    Title: "",
    Message: ""
  });

  const [userForm, setUserForm] = useState({
    Email: "",
    Password: "1234",
    Role: "Student",
    Prefix: "Mrs.",
    FirstName: "",
    LastName: "",
    StudentID: "",
    Phone: "",
    LineID: "",
    ResearchInterests: ""
  });

  // Load GAS files from static resources or fetch
  useEffect(() => {
    fetch("/public/gas/Code.gs")
      .then(r => r.text())
      .then(t => setGasCodeGs(t))
      .catch(() => {
        // Fallback code string if file fetch fails during server-side static checks
        setGasCodeGs(`// See export tab inside Admin panel for full Code.gs code.`);
      });

    fetch("/public/gas/index.html")
      .then(r => r.text())
      .then(t => setGasIndexHtml(t))
      .catch(() => {
        setGasIndexHtml(`<!-- See export tab inside Admin panel for full index.html code. -->`);
      });
  }, []);

  // Remember me logic
  useEffect(() => {
    const stored = localStorage.getItem("phd_portfolio_user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setCurrentUser(u);
        fetchAppData(u.UserID);
      } catch (e) {
        localStorage.removeItem("phd_portfolio_user");
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchAppData = async (userId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/getAppData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
        setPortfolioRecords(data.portfolioRecords || []);
        setStudentProfiles(data.studentProfiles || []);
        setDissertations(data.dissertations || []);
        setResearchHours(data.researchHours || []);
        setCompetencyAssessments(data.competencyAssessments || []);
        setAdvisorComments(data.advisorComments || []);
        setEndorsements(data.endorsements || []);
        setEvidence(data.evidence || []);
        setNotifications(data.notifications || []);
        setChatMessages(data.chatMessages || []);
        setSettings(data.settings || []);

        // Default selection logic
        const user = data.users.find((u: User) => u.UserID === userId);
        if (user && (user.Role === "Advisor" || user.Role === "CoAdvisor")) {
          const studentsList = data.users.filter((u: User) => u.Role === "Student");
          if (studentsList.length > 0) {
            setSelectedStudentId(studentsList[0].UserID);
          }
        } else {
          setSelectedStudentId(userId);
        }
      }
    } catch (e) {
      showToast("Error fetching application data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        if (rememberMe) {
          localStorage.setItem("phd_portfolio_user", JSON.stringify(data.user));
        }
        showToast(`Successfully logged in as ${data.user.FullName}`);
        await fetchAppData(data.user.UserID);
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      alert("Error contacting local mock server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("phd_portfolio_user");
    setCurrentUser(null);
    setSelectedStudentId(null);
    setCurrentPage("dashboard");
  };

  // Setup Database Sheet Trigger
  const triggerSetupDatabase = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/setupDatabase", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        showToast("Database & Google Drive schema loaded successfully!");
        alert(`Google Sheets DB initialized!\n\nSpreadsheet ID: ${data.spreadsheetId}\nSpreadsheet URL: ${data.spreadsheetUrl}\n\nEvidence upload folder created!`);
      }
    } catch (e) {
      showToast("Setup DB trigger failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Setup Sample Data Trigger
  const triggerSetupExampleData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/setupExampleData", { method: "POST" });
      if (res.ok) {
        showToast("Example PhD student data preloaded!");
        if (currentUser) {
          await fetchAppData(currentUser.UserID);
        }
      }
    } catch (e) {
      showToast("Setup sample data failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Save Portfolio Record
  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedStudentId) return;

    const selectedConfig = SECTIONS_CONFIG.find(s => s.number === selectedSection);
    const titleText = selectedConfig ? selectedConfig.title : `Section ${selectedSection}`;

    const payload = {
      RecordID: editingRecord ? editingRecord.RecordID : "",
      StudentUserID: selectedStudentId,
      SectionNo: selectedSection,
      SectionTitle: titleText,
      SubsectionNo: selectedSection + 0.1, // Auto mock subsection increment
      SubsectionTitle: recordForm.SubsectionTitle || "Academic Achievement",
      Field1: recordForm.Field1,
      Field2: recordForm.Field2,
      Field3: recordForm.Field3,
      Field4: recordForm.Field4,
      LongText: recordForm.LongText,
      Status: recordForm.Status,
      CreatedBy: currentUser.UserID
    };

    setIsLoading(true);
    try {
      const res = await fetch("/api/savePortfolioRecord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast("Portfolio record saved successfully!");
        setIsRecordModalOpen(false);
        setEditingRecord(null);
        setRecordForm({ SubsectionTitle: "", Field1: "", Field2: "", Field3: "", Field4: "", Field5: "", Field6: "", Field7: "", LongText: "", Status: "Draft" });
        await fetchAppData(currentUser.UserID);
      }
    } catch (e) {
      showToast("Error saving record");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Portfolio Record
  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this portfolio record?")) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/deletePortfolioRecord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId })
      });
      if (res.ok) {
        showToast("Record deleted successfully.");
        if (currentUser) {
          await fetchAppData(currentUser.UserID);
        }
      }
    } catch (e) {
      showToast("Delete failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Save Student Personal Profile Information
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedStudentId) return;

    const existingProfile = studentProfiles.find(p => p.StudentUserID === selectedStudentId);

    const payload = {
      ProfileID: existingProfile ? existingProfile.ProfileID : "",
      StudentUserID: selectedStudentId,
      FullName: profileForm.FullName,
      ContactInformation: `Email: ${currentUser.Email}, Phone: ${profileForm.Phone}, Line: ${profileForm.LineID}`,
      CurrentPositionAffiliation: selectedStudentId === "U004" ? "Registered Nurse, Songklanagarind" : "Lecturer, Surat Thani",
      ResearchInterests: profileForm.ResearchInterests,
      ORCID: profileForm.ORCID,
      GoalsForDoctoralStudy: profileForm.GoalsForDoctoralStudy,
      UpdatedBy: currentUser.UserID
    };

    setIsLoading(true);
    try {
      const res = await fetch("/api/saveUserProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast("Personal profile details saved.");
        setIsProfileModalOpen(false);
        await fetchAppData(currentUser.UserID);
      }
    } catch (e) {
      showToast("Save profile failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Advisor Comment (Workspace Review)
  const handleSaveComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedStudentId) return;

    const payload = {
      StudentUserID: selectedStudentId,
      AdvisorUserID: currentUser.UserID,
      ReviewYear: new Date().getFullYear().toString(),
      CommentText: commentForm.CommentText,
      Recommendation: commentForm.Recommendation,
      Status: "Submitted"
    };

    setIsLoading(true);
    try {
      const res = await fetch("/api/saveAdvisorComment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast("Advisor comment submitted!");
        setCommentForm({ CommentText: "", Recommendation: "Approved to proceed" });
        await fetchAppData(currentUser.UserID);
      }
    } catch (e) {
      showToast("Submit comment failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Broadcast Advisory alert notification
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const payload = {
      SenderUserID: currentUser.UserID,
      ReceiverUserID: broadcastForm.ReceiverUserID || "U004", // Default to kanya
      Title: broadcastForm.Title,
      Message: broadcastForm.Message
    };

    setIsLoading(true);
    try {
      const res = await fetch("/api/sendNotification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast("Broadcast notification sent successfully!");
        setBroadcastForm({ ReceiverUserID: "", Title: "", Message: "" });
        await fetchAppData(currentUser.UserID);
      }
    } catch (e) {
      showToast("Error sending broadcast alert");
    } finally {
      setIsLoading(false);
    }
  };

  // Save User (Admin Action)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/saveUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm)
      });
      if (res.ok) {
        showToast("User updated successfully in registry!");
        setIsUserModalOpen(false);
        setUserForm({
          Email: "", Password: "1234", Role: "Student", Prefix: "Mrs.", FirstName: "", LastName: "", StudentID: "", Phone: "", LineID: "", ResearchInterests: ""
        });
        await fetchAppData(currentUser.UserID);
      }
    } catch (e) {
      showToast("Error updating registry");
    } finally {
      setIsLoading(false);
    }
  };

  // Send Chat message
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeChatPeerId || !chatInput.trim()) return;

    const payload = {
      SenderUserID: currentUser.UserID,
      ReceiverUserID: activeChatPeerId,
      StudentUserID: currentUser.Role === "Student" ? currentUser.UserID : activeChatPeerId,
      MessageText: chatInput
    };

    try {
      const res = await fetch("/api/sendChatMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setChatInput("");
        await fetchAppData(currentUser.UserID);
      }
    } catch (e) {
      showToast("Chat transmission error");
    }
  };

  // Mark notification read
  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      const res = await fetch("/api/markNotificationRead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId })
      });
      if (res.ok) {
        if (currentUser) {
          await fetchAppData(currentUser.UserID);
        }
      }
    } catch (e) {
      showToast("Read update failed");
    }
  };

  const copyToClipboard = (text: string, type: "gs" | "html") => {
    navigator.clipboard.writeText(text);
    if (type === "gs") {
      setCopiedGs(true);
      setTimeout(() => setCopiedGs(false), 2000);
    } else {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    }
    showToast("Code copied to clipboard!");
  };

  // Initialize edit forms with existing values
  const initProfileForm = () => {
    const student = users.find(u => u.UserID === selectedStudentId);
    const profile = studentProfiles.find(p => p.StudentUserID === selectedStudentId);
    if (student) {
      setProfileForm({
        FullName: student.FullName || "",
        Phone: student.Phone || "",
        LineID: student.LineID || "",
        ORCID: student.ORCID || "",
        ResearchInterests: student.ResearchInterests || "",
        GoalsForDoctoralStudy: profile ? profile.GoalsForDoctoralStudy : ""
      });
      setIsProfileModalOpen(true);
    }
  };

  const initRecordForm = (rec: PortfolioRecord) => {
    setEditingRecord(rec);
    setRecordForm({
      SubsectionTitle: rec.SubsectionTitle || "",
      Field1: rec.Field1 || "",
      Field2: rec.Field2 || "",
      Field3: rec.Field3 || "",
      Field4: rec.Field4 || "",
      Field5: rec.Field5 || "",
      Field6: rec.Field6 || "",
      Field7: rec.Field7 || "",
      LongText: rec.LongText || "",
      Status: rec.Status || "Draft"
    });
    setIsRecordModalOpen(true);
  };

  // Filtered lists for the active student context
  const filteredRecords = portfolioRecords.filter(r => r.StudentUserID === selectedStudentId && r.SectionNo === selectedSection);
  const activeStudent = users.find(u => u.UserID === selectedStudentId);

  // Experience hours metrics
  const studentHours = researchHours.filter(h => h.StudentUserID === selectedStudentId);
  const loggedHoursSum = studentHours.reduce((sum, h) => sum + Number(h.Hours || 0), 0);

  // Chat Contacts
  const chatPeers = users.filter(u => u.UserID !== currentUser?.UserID);
  if (chatPeers.length > 0 && !activeChatPeerId) {
    setActiveChatPeerId(chatPeers[0].UserID);
  }

  // Active chat thread messages
  const activeChatMessages = chatMessages.filter(
    m => (m.SenderUserID === currentUser?.UserID && m.ReceiverUserID === activeChatPeerId) ||
         (m.SenderUserID === activeChatPeerId && m.ReceiverUserID === currentUser?.UserID)
  );

  // Login page layout
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-cream-soft flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border-t-8 border-red-deep"
        >
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-red-deep rounded-full flex items-center justify-center text-gold-accent mb-4">
              <GraduationCap size={36} />
            </div>
            <h1 className="text-2xl font-bold font-display text-slate-charcoal">Doctoral Student Portfolio</h1>
            <p className="text-sm text-gray-500 font-sans mt-1">PSU Doctoral Portfolio Management System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-deep/20 focus:border-red-deep"
                placeholder="student@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-deep/20 focus:border-red-deep"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="remember_me" 
                className="rounded border-gray-300 text-red-deep focus:ring-red-deep"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember_me" className="ml-2 text-xs text-gray-600 font-medium">Remember my session on this device</label>
            </div>

            <button 
              type="submit" 
              className="w-full py-2.5 bg-[#F9C94A] text-[#B91C1C] font-extrabold rounded-lg border-b-2 border-[#D9A92A] hover:bg-[#FCD86E] active:border-b-0 active:translate-y-[2px] transition-all shadow-sm text-xs uppercase tracking-wider font-display"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 border-t border-dashed border-gray-200 pt-4 text-xs space-y-1.5 text-gray-600 bg-gray-50 p-4 rounded-lg">
            <span className="font-bold text-red-deep block mb-1">Academic Sandbox Accounts (Password: 1234):</span>
            <p>• Student 1: <strong className="font-mono">student@example.com</strong></p>
            <p>• Student 2: <strong className="font-mono">pirunnapa.ben@example.com</strong></p>
            <p>• Advisor: <strong className="font-mono">advisor@example.com</strong></p>
            <p>• CoAdvisor: <strong className="font-mono">coadvisor@example.com</strong></p>
            <p>• Administrator: <strong className="font-mono">admin@example.com</strong></p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-soft flex flex-col font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-charcoal text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 border-l-4 border-gold-accent"
          >
            <CheckCircle className="text-gold-accent" size={18} />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header */}
      <header className="bg-white text-gray-900 border-b border-gray-200 py-3 px-6 flex items-center justify-between shadow-sm no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F9C94A] rounded-lg flex items-center justify-center font-bold text-[#B91C1C] text-xl italic shadow-md">
            DP
          </div>
          <div>
            <h1 className="text-sm font-black font-display tracking-wider text-gray-900 uppercase leading-none">DOCTORAL STUDENT PORTFOLIO</h1>
            <p className="text-[10px] text-[#B91C1C] font-mono mt-1 uppercase tracking-widest font-bold">Prince of Songkla University • Nursing</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-[#B91C1C] block font-bold font-mono uppercase tracking-widest leading-none mb-1">{currentUser.Role}</span>
            <span className="text-sm font-black block leading-none text-gray-800">{currentUser.FullName}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F9C94A] border-2 border-[#B91C1C] overflow-hidden shadow-inner flex items-center justify-center">
            <img 
              className="w-full h-full object-cover" 
              src={currentUser.PhotoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser.FirstName}`} 
              alt="Profile avatar" 
            />
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 bg-red-50 text-red-deep hover:bg-red-100 border border-red-200 rounded-lg transition-all"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-[#B91C1C] text-white flex gap-1 px-6 overflow-x-auto whitespace-nowrap scrollbar-none border-b-2 border-[#F9C94A] shadow-md no-print">
        {[
          { key: "dashboard", label: "Dashboard", icon: Grid },
          { key: "profile", label: "Information", icon: UserIcon },
          { key: "portfolio", label: "Portfolio (1-14)", icon: BookOpen },
          ...(currentUser.Role === "Advisor" || currentUser.Role === "CoAdvisor" ? [{ key: "workspace", label: "Advisor Workspace", icon: Users }] : []),
          { key: "notify", label: "Notifications", icon: Bell },
          { key: "chat", label: "Advisory Chat", icon: MessageSquare },
          { key: "report", label: "Print Portfolio", icon: Printer },
          ...(currentUser.Role === "Admin" ? [{ key: "admin", label: "Admin Panel", icon: Settings }] : [])
        ].map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                setCurrentPage(item.key);
                setActiveTab("overview");
              }}
              className={`flex items-center gap-2.5 px-5 py-4 text-xs font-bold uppercase tracking-wider transition-all relative ${
                isActive 
                  ? "bg-[#D12E2E] text-[#F9C94A] font-black" 
                  : "text-white/85 hover:bg-[#D12E2E]/60 hover:text-white"
              }`}
            >
              {isActive && (
                <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-8 h-1 bg-[#F9C94A] rounded-full"></span>
              )}
              <Icon size={14} className={isActive ? "text-[#F9C94A]" : "text-white/60"} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* App Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {isLoading && (
          <div className="fixed inset-0 bg-white/70 z-50 flex items-center justify-center flex-col">
            <Loader2 className="animate-spin text-red-deep" size={36} />
            <span className="text-sm font-semibold text-slate-charcoal mt-2 font-mono">Syncing Sheets...</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* 1. DASHBOARD PAGE */}
            {currentPage === "dashboard" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold font-display text-slate-charcoal">PhD Student Academic Dashboard</h2>
                    <p className="text-xs text-gray-500">Review hours progress, publications count, and current milestones timeline.</p>
                  </div>
                  {currentUser.Role !== "Student" && activeStudent && (
                    <div className="px-4 py-2 bg-cream-soft border border-gold-accent rounded-xl text-xs font-semibold">
                      Viewing Student Scope: <span className="text-red-deep">{activeStudent.FullName}</span> ({activeStudent.StudentID})
                    </div>
                  )}
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border-l-4 border-red-deep shadow-sm flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold font-mono text-slate-charcoal">{portfolioRecords.filter(r => r.StudentUserID === selectedStudentId).length}</span>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Records Fielded</p>
                    </div>
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-deep">
                      <BookOpen size={18} />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border-l-4 border-gold-accent shadow-sm flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold font-mono text-slate-charcoal">{loggedHoursSum} / 180</span>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Research Hours Logged</p>
                    </div>
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                      <Clock size={18} />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border-l-4 border-red-deep shadow-sm flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold font-mono text-slate-charcoal">
                        {portfolioRecords.filter(r => r.StudentUserID === selectedStudentId && r.SectionNo === 7 && r.SubsectionNo === 7.2).length}
                      </span>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Scopus Publications</p>
                    </div>
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-deep">
                      <TrendingUp size={18} />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border-l-4 border-gold-accent shadow-sm flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold font-mono text-slate-charcoal">{evidence.filter(e => e.StudentUserID === selectedStudentId).length}</span>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Uploaded Evidence PDFs</p>
                    </div>
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                      <FileText size={18} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Milestones timeline */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm lg:col-span-2">
                    <h3 className="text-base font-bold font-display text-slate-charcoal border-b border-gray-100 pb-3 mb-6 flex justify-between items-center">
                      <span>Research Milestones & Status Timeline</span>
                      <span className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">Active Cycle</span>
                    </h3>
                    <div className="relative pl-2">
                      <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
                      <div className="space-y-6 relative">
                        {/* Milestone 1 */}
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white z-10 shrink-0 shadow-lg shadow-green-100">
                            <CheckCircle size={18} />
                          </div>
                          <div className="pt-0.5">
                            <h4 className="text-sm font-bold text-gray-800">Qualifying Examination</h4>
                            <p className="text-xs text-gray-500">Passed and Verified in Sem 1/2025 • Grade: Pass</p>
                          </div>
                        </div>

                        {/* Milestone 2 */}
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-[#B91C1C] rounded-full flex items-center justify-center text-white z-10 shrink-0 shadow-lg shadow-red-100 ring-4 ring-white">
                            <span className="font-bold text-[10px] font-mono text-[#F9C94A]">OK</span>
                          </div>
                          <div className="pt-0.5">
                            <h4 className="text-sm font-bold text-[#B91C1C]">TOEFL ITP English Threshold Requirement</h4>
                            <p className="text-xs text-gray-500">Approved with Score 560 • Threshold Met</p>
                          </div>
                        </div>

                        {/* Milestone 3 */}
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-[#F9C94A] rounded-full flex items-center justify-center text-[#B91C1C] z-10 shrink-0 shadow-md ring-4 ring-white">
                            <Clock size={16} />
                          </div>
                          <div className="pt-0.5">
                            <h4 className="text-sm font-bold text-gray-800">Dissertation Proposal Defense</h4>
                            <p className="text-xs text-gray-500">In Progress • Status: Draft outline submitted under advisory review</p>
                            <div className="mt-2 flex gap-1.5 flex-wrap">
                              <span className="bg-red-50 text-[#B91C1C] text-[9px] font-bold px-2 py-0.5 rounded border border-red-100 uppercase tracking-wider">Chapter 1-3 Outline</span>
                              <span className="bg-amber-50 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded border border-amber-100 uppercase tracking-wider font-mono">Feedback Pending</span>
                            </div>
                          </div>
                        </div>

                        {/* Milestone 4 */}
                        <div className="flex items-start gap-4 opacity-40">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 z-10 shrink-0">
                            <FileText size={16} />
                          </div>
                          <div className="pt-0.5">
                            <h4 className="text-sm font-bold text-gray-800">Final Dissertation Defense</h4>
                            <p className="text-xs text-gray-500">Expected graduation clearance: Sem 2/2028</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress target hours */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-base font-bold font-display text-slate-charcoal border-b border-gray-100 pb-3 mb-4">Doctoral Progress Meter</h3>
                    <div className="text-center py-4">
                      <div className="relative w-28 h-28 mx-auto flex items-center justify-center bg-cream-soft rounded-full border-4 border-gold-accent">
                        <div>
                          <span className="text-2xl font-bold font-mono text-red-deep">{loggedHoursSum}</span>
                          <span className="text-[10px] text-gray-500 block uppercase font-semibold">Hours log</span>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-gray-600 mt-4 leading-relaxed">
                        Required threshold: 180 logged research experience hours to verify graduation clearance.
                      </p>
                      <div className="w-full bg-gray-100 rounded-full h-2 mt-4 overflow-hidden">
                        <div 
                          className="bg-red-deep h-full rounded-full transition-all" 
                          style={{ width: `${Math.min((loggedHoursSum / 180) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-charcoal font-bold block text-right mt-1">
                        {Math.round((loggedHoursSum / 180) * 100)}% Complete
                      </span>
                    </div>

                    <div className="mt-4 bg-amber-50 p-4 rounded-xl border border-amber-200/50 space-y-2">
                      <span className="font-bold text-xs text-red-deep uppercase tracking-wider block">Advisory quick link</span>
                      <button 
                        onClick={() => setCurrentPage("portfolio")}
                        className="w-full py-2 bg-red-deep text-white font-semibold rounded-lg text-xs hover:bg-red-800 transition"
                      >
                        + Add Portfolio Record
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. INFORMATION / PROFILE PAGE */}
            {currentPage === "profile" && activeStudent && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold font-display text-slate-charcoal">Student Profile & Personal Information</h2>
                    <p className="text-xs text-gray-500">Read-only profile outline with modal-guided editor for Student users.</p>
                  </div>
                  {currentUser.Role === "Student" && (
                    <button 
                      onClick={initProfileForm}
                      className="px-4 py-2 bg-[#F9C94A] text-[#B91C1C] text-xs font-bold rounded-lg border-b-2 border-[#D9A92A] hover:bg-[#FCD86E] active:border-b-0 active:translate-y-[2px] transition-all shadow-sm"
                    >
                      Edit Personal Info
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Photo & Basic Details */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-center">
                    <img 
                      className="w-32 h-32 rounded-full border-4 border-gold-accent object-cover mx-auto bg-gray-50 shadow" 
                      src={activeStudent.PhotoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${activeStudent.FirstName}`} 
                      alt="Student" 
                    />
                    <h3 className="text-lg font-bold text-slate-charcoal mt-4">{activeStudent.FullName}</h3>
                    <span className="text-xs text-red-deep font-bold bg-red-50 px-3 py-1 rounded-full mt-2 inline-block">
                      Student ID: {activeStudent.StudentID}
                    </span>

                    <div className="text-left mt-6 border-t border-gray-100 pt-4 space-y-3 text-xs text-gray-600">
                      <p><strong>Program Track:</strong> {activeStudent.Program || "Doctor of Philosophy Program in Nursing Science"}</p>
                      <p><strong>Faculty:</strong> {activeStudent.Faculty || "Nursing"}</p>
                      <p><strong>University:</strong> {activeStudent.University || "Prince of Songkla University"}</p>
                      <p><strong>Admission Year:</strong> {activeStudent.AdmissionYear}</p>
                      <p><strong>Expected Graduation:</strong> {activeStudent.ExpectedGraduationYear}</p>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm md:col-span-2 space-y-6">
                    <h3 className="text-base font-bold font-display text-slate-charcoal border-b border-gray-100 pb-3">Contact and Scholar Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Email Address</span>
                        <p className="text-sm font-semibold text-slate-charcoal mt-1">{activeStudent.Email}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Contact Number</span>
                        <p className="text-sm font-semibold text-slate-charcoal mt-1">{activeStudent.Phone || "Not Logged"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Line ID Link</span>
                        <p className="text-sm font-semibold text-slate-charcoal mt-1">{activeStudent.LineID || "Not Logged"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">ORCID iD</span>
                        <p className="text-sm font-semibold text-red-deep font-mono mt-1">{activeStudent.ORCID || "Not Logged"}</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-5">
                      <span className="text-xs font-bold text-red-deep block mb-2">Research and Dissertation Interests</span>
                      <p className="bg-cream-soft p-4 rounded-xl border-l-4 border-gold-accent text-sm leading-relaxed text-slate-charcoal font-medium">
                        {activeStudent.ResearchInterests || "No research interests described yet. Update your interests through edit profile."}
                      </p>
                    </div>

                    <div className="pt-3">
                      <span className="text-xs font-bold text-red-deep block mb-2">Goals for Doctoral Study</span>
                      <p className="text-sm leading-relaxed text-gray-600">
                        {studentProfiles.find(p => p.StudentUserID === selectedStudentId)?.GoalsForDoctoralStudy || "No doctoral goals logged yet."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. PORTFOLIO ENTRY PAGE */}
            {currentPage === "portfolio" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold font-display text-slate-charcoal">Portfolio Section Records Entry</h2>
                    <p className="text-xs text-gray-500">Record, update, and manage entries for all 14 mandatory doctoral sections.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingRecord(null);
                      setRecordForm({ SubsectionTitle: "", Field1: "", Field2: "", Field3: "", Field4: "", Field5: "", Field6: "", Field7: "", LongText: "", Status: "Draft" });
                      setIsRecordModalOpen(true);
                    }}
                    className="px-4 py-2 bg-[#F9C94A] text-[#B91C1C] text-xs font-bold rounded-lg border-b-2 border-[#D9A92A] hover:bg-[#FCD86E] active:border-b-0 active:translate-y-[2px] transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Add Portfolio Record
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left list of Sections */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm h-[600px] overflow-y-auto">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3 px-2">Portfolio Directory</span>
                    <div className="space-y-1">
                      {SECTIONS_CONFIG.map(sect => {
                        const isSelected = selectedSection === sect.number;
                        return (
                          <button
                            key={sect.number}
                            onClick={() => setSelectedSection(sect.number)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${isSelected ? "bg-cream-soft text-red-deep border-l-4 border-red-deep font-bold" : "text-gray-600 hover:bg-gray-50"}`}
                          >
                            <span className="truncate pr-2">Section {sect.number}. {sect.title}</span>
                            <ChevronRight size={12} className={isSelected ? "text-red-deep" : "text-gray-400"} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right records grid */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm lg:col-span-2 h-[600px] overflow-y-auto">
                    <div className="border-b border-gray-100 pb-3 mb-4">
                      <span className="text-[10px] font-bold text-red-deep uppercase tracking-wider font-mono">Selected Scope</span>
                      <h3 className="text-base font-bold font-display text-slate-charcoal">
                        Section {selectedSection}: {SECTIONS_CONFIG.find(s => s.number === selectedSection)?.title}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {filteredRecords.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
                          <BookOpen className="text-gray-300 mx-auto mb-3" size={32} />
                          <p className="text-xs text-gray-500 font-medium">No records filed under this section yet.</p>
                          <button 
                            onClick={() => setIsRecordModalOpen(true)}
                            className="mt-3 text-xs font-bold text-red-deep hover:underline"
                          >
                            + Add some records now
                          </button>
                        </div>
                      ) : (
                        filteredRecords.map(rec => (
                          <div key={rec.RecordID} className="p-4 bg-soft border border-gray-200 rounded-xl shadow-sm hover:border-gold-accent transition">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                                  Sub-part: {rec.SubsectionTitle}
                                </span>
                                <h4 className="text-sm font-bold text-slate-charcoal mt-1.5">{rec.Field1}</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {rec.Field2} {rec.Field3 ? `| Year: ${rec.Field3}` : ""} {rec.Field4 ? `| Date Taken: ${rec.Field4}` : ""}
                                </p>
                              </div>

                              <div className="flex gap-1">
                                <button 
                                  onClick={() => initRecordForm(rec)}
                                  className="p-1.5 text-gray-500 hover:text-slate-charcoal bg-white rounded-lg border border-gray-200 shadow-sm"
                                  title="Edit entry"
                                >
                                  <Edit3 size={12} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteRecord(rec.RecordID)}
                                  className="p-1.5 text-red-500 hover:text-red-700 bg-white rounded-lg border border-gray-200 shadow-sm"
                                  title="Delete entry"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                            
                            {rec.LongText && (
                              <p className="text-xs text-gray-600 leading-relaxed mt-3 border-t border-dashed border-gray-200 pt-2.5">
                                {rec.LongText}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. ADVISOR WORKSPACE PAGE */}
            {currentPage === "workspace" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-charcoal">Advisory Sign-off & Portfolio Tracking Workspace</h2>
                  <p className="text-xs text-gray-500">Provide comments, complete endorsements, and view advised students overview.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Student Selection list */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm h-[550px] overflow-y-auto">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3 px-2">Advisees List</span>
                    <div className="space-y-2">
                      {users.filter(u => u.Role === "Student").map(s => {
                        const isSelected = selectedStudentId === s.UserID;
                        return (
                          <div 
                            key={s.UserID}
                            onClick={() => setSelectedStudentId(s.UserID)}
                            className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${isSelected ? "bg-cream-soft border-gold-accent shadow-sm" : "border-gray-100 hover:border-gray-200 bg-gray-50/50"}`}
                          >
                            <img src={s.PhotoURL} className="w-10 h-10 rounded-full border border-gold-accent object-cover bg-white" />
                            <div>
                              <p className="text-xs font-bold text-slate-charcoal leading-none">{s.FullName}</p>
                              <span className="text-[10px] text-gray-500 font-mono block mt-1">ID: {s.StudentID}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comment box and historical endorsements */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm md:col-span-2 h-[550px] overflow-y-auto space-y-6">
                    {activeStudent && (
                      <>
                        <div className="border-b border-gray-100 pb-3">
                          <h3 className="text-base font-bold font-display text-slate-charcoal">Submit Scholars Review & Feedback</h3>
                          <p className="text-xs text-gray-500">Currently reviewing: <span className="text-red-deep font-bold">{activeStudent.FullName}</span></p>
                        </div>

                        <form onSubmit={handleSaveComment} className="bg-soft p-4 rounded-xl border border-gray-200 space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Scholar Guidance & Comments</label>
                            <textarea 
                              className="w-full text-xs p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-deep"
                              rows={3}
                              placeholder="Type major feedback, correction instructions, or publish strategies..."
                              value={commentForm.CommentText}
                              onChange={e => setCommentForm({ ...commentForm, CommentText: e.target.value })}
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Status Recommendation</label>
                              <select 
                                className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                                value={commentForm.Recommendation}
                                onChange={e => setCommentForm({ ...commentForm, Recommendation: e.target.value })}
                              >
                                <option value="Approved to proceed">Approved to proceed to next cycle</option>
                                <option value="Approved with modifications">Approved with minor modifications</option>
                                <option value="Requires detailed update">Requires immediate progress meeting</option>
                              </select>
                            </div>
                            <div className="flex items-end">
                              <button 
                                type="submit"
                                className="w-full py-2 bg-red-deep text-white text-xs font-bold rounded-lg hover:bg-red-800 transition"
                              >
                                Submit Evaluation Signature
                              </button>
                            </div>
                          </div>
                        </form>

                        <div>
                          <h4 className="text-xs font-bold text-red-deep uppercase tracking-wider mb-3">Review Feedback History</h4>
                          <div className="space-y-3">
                            {advisorComments.filter(c => c.StudentUserID === selectedStudentId).length === 0 ? (
                              <p className="text-xs text-gray-500 text-center py-6 bg-gray-50 rounded-lg">No prior feedback recorded for this student.</p>
                            ) : (
                              advisorComments.filter(c => c.StudentUserID === selectedStudentId).map(c => (
                                <div key={c.CommentID} className="p-3.5 bg-cream-soft/40 border border-gray-200 rounded-xl border-l-4 border-gold-accent">
                                  <div className="flex justify-between items-start text-[10px] font-mono text-gray-500 mb-2">
                                    <span>Review Year: {c.ReviewYear}</span>
                                    <span>{new Date(c.CreatedAt).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-xs text-slate-charcoal leading-relaxed">{c.CommentText}</p>
                                  <span className="text-[10px] bg-red-50 text-red-deep px-2 py-0.5 rounded font-bold mt-2 inline-block">
                                    Rec: {c.Recommendation}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 5. NOTIFICATIONS PAGE */}
            {currentPage === "notify" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold font-display text-slate-charcoal">System Alerts & Notifications</h2>
                    <p className="text-xs text-gray-500">Read advisor communications, broadcast schedule alerts, and manage incoming tasks.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Broadcast block for Advisors/Admins */}
                  {currentUser.Role !== "Student" && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-fit">
                      <h3 className="text-base font-bold font-display text-slate-charcoal border-b border-gray-100 pb-3 mb-4">Send Advisory Alert</h3>
                      <form onSubmit={handleSendBroadcast} className="space-y-3">
                        <div className="form-group">
                          <label className="text-xs font-bold text-gray-700">Select Student Recipient</label>
                          <select 
                            className="w-full text-xs p-2 border border-gray-300 rounded-lg mt-1"
                            value={broadcastForm.ReceiverUserID}
                            onChange={e => setBroadcastForm({ ...broadcastForm, ReceiverUserID: e.target.value })}
                            required
                          >
                            <option value="">-- Choose student --</option>
                            {users.filter(u => u.Role === "Student").map(s => (
                              <option key={s.UserID} value={s.UserID}>{s.FullName}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="text-xs font-bold text-gray-700">Notification Alert Title</label>
                          <input 
                            type="text" 
                            className="w-full text-xs p-2 border border-gray-300 rounded-lg mt-1"
                            placeholder="e.g. Schedule for Annual Portfolio Review"
                            value={broadcastForm.Title}
                            onChange={e => setBroadcastForm({ ...broadcastForm, Title: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="text-xs font-bold text-gray-700">Message Content</label>
                          <textarea 
                            className="w-full text-xs p-2 border border-gray-300 rounded-lg mt-1"
                            rows={3}
                            placeholder="Type scheduled date, meeting venue or required files details..."
                            value={broadcastForm.Message}
                            onChange={e => setBroadcastForm({ ...broadcastForm, Message: e.target.value })}
                            required
                          />
                        </div>

                        <button 
                          type="submit"
                          className="w-full py-2 bg-red-deep text-white font-bold rounded-lg text-xs hover:bg-red-800 transition"
                        >
                          Broadcast Alert
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Notifications feed */}
                  <div className={`bg-white rounded-2xl border border-gray-200 p-6 shadow-sm ${currentUser.Role !== "Student" ? "lg:col-span-2" : "lg:col-span-3"} h-[550px] overflow-y-auto`}>
                    <h3 className="text-base font-bold font-display text-slate-charcoal border-b border-gray-100 pb-3 mb-4">Incoming Notification Feed</h3>
                    <div className="space-y-4">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-12">No alert notifications received yet.</p>
                      ) : (
                        notifications.map(n => {
                          const isUnread = n.IsRead === "FALSE";
                          return (
                            <div 
                              key={n.NotificationID} 
                              className={`p-4 rounded-xl border flex justify-between items-start gap-4 transition ${isUnread ? "bg-cream-soft border-gold-accent" : "bg-soft border-gray-100"}`}
                            >
                              <div>
                                <h4 className="text-xs font-bold text-slate-charcoal flex items-center gap-2">
                                  {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-red-deep"></span>}
                                  {n.Title}
                                </h4>
                                <p className="text-xs text-gray-600 mt-1">{n.Message}</p>
                                <span className="text-[9px] text-gray-400 block mt-2 font-mono">Sent: {new Date(n.CreatedAt).toLocaleString()}</span>
                              </div>

                              {isUnread && n.ReceiverUserID === currentUser.UserID && (
                                <button 
                                  onClick={() => handleMarkNotificationRead(n.NotificationID)}
                                  className="text-[10px] font-bold text-red-deep hover:underline whitespace-nowrap bg-white border border-gray-200 shadow-sm px-2 py-1 rounded"
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. CHAT PAGE */}
            {currentPage === "chat" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-charcoal">Advisory Chat & Messages</h2>
                  <p className="text-xs text-gray-500">Real-time instant messaging channel between scholars, Major Advisors, and Co-advisors.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
                  {/* Left contacts list */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm overflow-y-auto">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3 px-2">Contacts</span>
                    <div className="space-y-1">
                      {chatPeers.map(p => (
                        <div
                          key={p.UserID}
                          onClick={() => setActiveChatPeerId(p.UserID)}
                          className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${activeChatPeerId === p.UserID ? "bg-cream-soft border-gold-accent" : "border-transparent hover:bg-gray-50"}`}
                        >
                          <img src={p.PhotoURL} className="w-8 h-8 rounded-full border border-gold-accent object-cover bg-white" />
                          <div>
                            <p className="text-xs font-bold text-slate-charcoal leading-none">{p.FullName}</p>
                            <span className="text-[10px] text-gray-500 block mt-1">{p.Role}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chat Box panel */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm md:col-span-2 flex flex-col h-full overflow-hidden">
                    {activeChatPeerId ? (
                      <>
                        {/* Selected Contact Header */}
                        {(() => {
                          const peer = users.find(u => u.UserID === activeChatPeerId);
                          return peer ? (
                            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                              <img src={peer.PhotoURL} className="w-9 h-9 rounded-full border border-gold-accent object-cover" />
                              <div>
                                <h4 className="text-xs font-bold text-slate-charcoal">{peer.FullName}</h4>
                                <span className="text-[9px] text-gray-500 block mt-0.5">{peer.Role} • {peer.Affiliation || "Faculty of Nursing"}</span>
                              </div>
                            </div>
                          ) : null;
                        })()}

                        {/* Message list area */}
                        <div className="flex-1 p-4 overflow-y-auto bg-soft space-y-3">
                          {activeChatMessages.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs text-gray-400 font-medium">
                              No prior chat messages logged. Start discussion below.
                            </div>
                          ) : (
                            activeChatMessages.map(m => {
                              const isSent = m.SenderUserID === currentUser.UserID;
                              return (
                                <div 
                                  key={m.MessageID} 
                                  className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                                >
                                  <div className={`max-w-[70%] p-3 rounded-xl text-xs leading-relaxed shadow-sm ${isSent ? "bg-red-deep text-white rounded-br-none" : "bg-white text-slate-charcoal border border-gray-200 rounded-bl-none"}`}>
                                    <p>{m.MessageText}</p>
                                    <span className={`text-[8px] block text-right mt-1.5 ${isSent ? "text-red-100" : "text-gray-400"}`}>
                                      {new Date(m.CreatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Input form */}
                        <form onSubmit={handleSendChat} className="p-3 border-t border-gray-100 flex gap-2">
                          <input 
                            type="text" 
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-red-deep"
                            placeholder="Type advising message or notes..."
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            required
                          />
                          <button 
                            type="submit" 
                            className="px-4 py-2 bg-red-deep text-white font-bold rounded-xl text-xs hover:bg-red-800 transition flex items-center gap-1 shadow-sm"
                          >
                            <Send size={12} /> Send
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-gray-400 font-medium">
                        No active contact selected.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 7. PRINT REPORT PAGE */}
            {currentPage === "report" && activeStudent && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 no-print">
                  <div>
                    <h2 className="text-xl font-bold font-display text-slate-charcoal">Compile Doctoral Portfolio Dossier</h2>
                    <p className="text-xs text-gray-500">Preview complete A4 structured report compiling personal information and sections 1-14 before saving.</p>
                  </div>
                  <button 
                    onClick={() => window.print()}
                    className="px-5 py-2.5 bg-red-deep text-white text-xs font-bold rounded-lg hover:bg-red-800 transition shadow flex items-center gap-1.5"
                  >
                    <Printer size={14} /> Print / Save as PDF (A4)
                  </button>
                </div>

                {/* Printable Frame Area */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm max-w-[800px] mx-auto print:border-none print:shadow-none print:p-0">
                  {/* COVER PAGE */}
                  <div className="text-center py-16 border-2 border-gold-accent rounded-xl bg-cream-soft/40 mb-10 print:bg-transparent">
                    <GraduationCap className="text-red-deep mx-auto mb-4" size={56} />
                    <h1 className="text-2xl font-bold font-display text-red-deep uppercase tracking-tight">Doctoral Student Portfolio</h1>
                    <p className="text-sm font-semibold text-slate-charcoal mt-2">{activeStudent.University || "Prince of Songkla University"}</p>
                    <p className="text-xs text-gray-500">{activeStudent.Faculty || "Faculty of Nursing"}</p>

                    <div className="max-w-md mx-auto text-left mt-10 border-t border-gray-200/50 pt-6 space-y-2 text-xs leading-relaxed text-gray-700 px-6">
                      <p><strong>Student Name:</strong> {activeStudent.FullName}</p>
                      <p><strong>Student ID:</strong> {activeStudent.StudentID}</p>
                      <p><strong>Program Track:</strong> {activeStudent.Program || "Doctor of Philosophy Program in Nursing Science"}</p>
                      <p><strong>Year of Admission:</strong> {activeStudent.AdmissionYear}</p>
                      <p><strong>Expected Graduation Year:</strong> {activeStudent.ExpectedGraduationYear}</p>
                      <p><strong>Major Scholar Advisor:</strong> Assoc. Prof. Dr. Somchai Rakdee</p>
                    </div>
                  </div>

                  {/* Portfolio sections compile loop */}
                  <div className="space-y-8 mt-12">
                    <div className="print-page-break">
                      <h2 className="text-base font-bold text-red-deep uppercase tracking-wider border-b-2 border-red-deep pb-1.5 mb-3 font-display">
                        Section 1. Student Profile & Contact details
                      </h2>
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-700 bg-gray-50 p-4 rounded-xl">
                        <p><strong>Email Address:</strong> {activeStudent.Email}</p>
                        <p><strong>Phone:</strong> {activeStudent.Phone || "Not Logged"}</p>
                        <p><strong>Line ID:</strong> {activeStudent.LineID || "Not Logged"}</p>
                        <p><strong>ORCID:</strong> {activeStudent.ORCID || "Not Logged"}</p>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed mt-3">
                        <strong>Research Objectives:</strong> {studentProfiles.find(p => p.StudentUserID === selectedStudentId)?.GoalsForDoctoralStudy || "No goals logged."}
                      </p>
                    </div>

                    <div className="print-page-break">
                      <h2 className="text-base font-bold text-red-deep uppercase tracking-wider border-b-2 border-red-deep pb-1.5 mb-3 font-display">
                        Section 2. Planned Program of Study & Achievements List
                      </h2>
                      {portfolioRecords.filter(r => r.StudentUserID === selectedStudentId).length === 0 ? (
                        <p className="text-xs text-gray-400">No achievements recorded in system.</p>
                      ) : (
                        <div className="space-y-3.5">
                          {portfolioRecords.filter(r => r.StudentUserID === selectedStudentId).map(rec => (
                            <div key={rec.RecordID} className="p-3 border border-gray-100 rounded-lg text-xs">
                              <div className="flex justify-between font-bold text-slate-charcoal">
                                <span>Sec {rec.SectionNo} - {rec.SubsectionTitle}</span>
                                <span className="text-red-deep">{rec.Field1}</span>
                              </div>
                              <p className="text-[10px] text-gray-500 mt-1">{rec.Field2} • {rec.Field3}</p>
                              {rec.LongText && <p className="text-gray-600 mt-2 font-serif leading-relaxed">{rec.LongText}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="print-page-break">
                      <h2 className="text-base font-bold text-red-deep uppercase tracking-wider border-b-2 border-red-deep pb-1.5 mb-3 font-display">
                        Section 6. Research Experience Hours Logs
                      </h2>
                      <p className="text-xs font-bold text-slate-charcoal mb-2">Total Hours Progress: {loggedHoursSum} / 180 Hours</p>
                      <table className="w-full text-[11px] border-collapse text-left text-gray-700">
                        <thead>
                          <tr className="bg-gray-100 font-bold border-b border-gray-200">
                            <th className="p-2">Date</th>
                            <th className="p-2">Activity Description</th>
                            <th className="p-2 text-right">Hours</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentHours.map(h => (
                            <tr key={h.HourID} className="border-b border-gray-100">
                              <td className="p-2">{h.Date}</td>
                              <td className="p-2">{h.ResearchActivity}</td>
                              <td className="p-2 text-right font-bold">{h.Hours} hrs</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="print-page-break">
                      <h2 className="text-base font-bold text-red-deep uppercase tracking-wider border-b-2 border-red-deep pb-1.5 mb-3 font-display">
                        Section 15. Advisor Review Evaluation Logs
                      </h2>
                      {advisorComments.filter(c => c.StudentUserID === selectedStudentId).length === 0 ? (
                        <p className="text-xs text-gray-400">No advisor guidance review comments recorded.</p>
                      ) : (
                        <div className="space-y-3">
                          {advisorComments.filter(c => c.StudentUserID === selectedStudentId).map(c => (
                            <div key={c.CommentID} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                              <p className="text-xs font-serif italic text-gray-700">"{c.CommentText}"</p>
                              <div className="flex justify-between mt-3 text-[10px] font-bold text-red-deep font-mono">
                                <span>Recommendation: {c.Recommendation}</span>
                                <span>Date: {new Date(c.CreatedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 8. ADMIN PANEL PAGE */}
            {currentPage === "admin" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-charcoal">Admin Database Setup and GAS Code Exporter</h2>
                  <p className="text-xs text-gray-500">Configure Spreadsheet DB connection, seed mock academic data, and view Google Apps Script deploy scripts.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Database Actions card */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-base font-bold font-display text-red-deep border-b border-gray-100 pb-3 mb-4">Initialize Google Sheets Mapping</h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Create or inspect the required database structures. This executes a background mock database mapping that replicates Apps Script.
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      <button 
                        onClick={triggerSetupDatabase}
                        className="px-4 py-2 bg-slate-charcoal text-white font-bold text-xs rounded-lg hover:bg-slate-900 transition flex items-center gap-1"
                      >
                        <Database size={14} /> Execute setupDatabase()
                      </button>
                      <button 
                        onClick={triggerSetupExampleData}
                        className="px-4 py-2 bg-red-deep text-white font-bold text-xs rounded-lg hover:bg-red-800 transition flex items-center gap-1"
                      >
                        <Server size={14} /> Seed Sample Data
                      </button>
                    </div>
                  </div>

                  {/* Users Admin Control card */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
                      <h3 className="text-base font-bold font-display text-slate-charcoal">Accounts Registry Summary</h3>
                      <button 
                        onClick={() => {
                          setUserForm({ Email: "", Password: "1234", Role: "Student", Prefix: "Mrs.", FirstName: "", LastName: "", StudentID: "", Phone: "", LineID: "", ResearchInterests: "" });
                          setIsUserModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-red-deep text-white text-xs font-bold rounded-lg hover:bg-red-800 transition shadow flex items-center gap-1"
                      >
                        <Plus size={12} /> New User
                      </button>
                    </div>

                    <div className="space-y-2 h-[200px] overflow-y-auto">
                      {users.map(u => (
                        <div key={u.UserID} className="p-2.5 bg-soft rounded-lg border border-gray-100 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-red-deep uppercase tracking-wider">{u.Role}</span>
                            <h4 className="text-xs font-bold text-slate-charcoal mt-0.5">{u.FullName}</h4>
                            <span className="text-[10px] text-gray-500 font-mono block">{u.Email}</span>
                          </div>
                          <span className="text-[9px] bg-green-50 text-green-700 border border-green-200 font-bold px-1.5 py-0.5 rounded">
                            {u.Status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* GOOGLE APPS SCRIPT CODE VIEWER BOXES */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-bold font-display text-slate-charcoal leading-none">Google Apps Script Production Export Codes</h3>
                    <p className="text-xs text-gray-500 mt-1">Copy and paste these scripts directly into your Google Apps Script workspace (script.google.com) to launch this exact portfolio system in production!</p>
                  </div>

                  {/* Code.gs segment */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-slate-900 px-4 py-2.5 rounded-t-xl">
                      <span className="text-xs text-white font-mono font-bold">1. Code.gs (Apps Script Backend)</span>
                      <button 
                        onClick={() => copyToClipboard(gasCodeGs, "gs")}
                        className="px-2.5 py-1 text-[10px] font-bold bg-slate-700 hover:bg-slate-600 text-white rounded transition flex items-center gap-1"
                      >
                        {copiedGs ? <Check size={10} /> : <Copy size={10} />}
                        {copiedGs ? "Copied!" : "Copy Code"}
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-950 text-green-400 font-mono text-[11px] h-[300px] overflow-y-auto rounded-b-xl border border-slate-900 shadow-inner">
                      <code>{gasCodeGs}</code>
                    </pre>
                  </div>

                  {/* index.html segment */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-slate-900 px-4 py-2.5 rounded-t-xl">
                      <span className="text-xs text-white font-mono font-bold">2. index.html (Apps Script Client interface)</span>
                      <button 
                        onClick={() => copyToClipboard(gasIndexHtml, "html")}
                        className="px-2.5 py-1 text-[10px] font-bold bg-slate-700 hover:bg-slate-600 text-white rounded transition flex items-center gap-1"
                      >
                        {copiedHtml ? <Check size={10} /> : <Copy size={10} />}
                        {copiedHtml ? "Copied!" : "Copy Code"}
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-950 text-amber-400 font-mono text-[11px] h-[300px] overflow-y-auto rounded-b-xl border border-slate-900 shadow-inner">
                      <code>{gasIndexHtml}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* -------------------------------------------------------------
         MODALS POPUPS JSX
         ------------------------------------------------------------- */}

      {/* Edit Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-charcoal/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl border border-gray-200 max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <h3 className="text-base font-bold font-display text-slate-charcoal border-b border-gray-100 pb-3 mb-4">Edit Personal Profile</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold text-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Prefix Name</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                    value={profileForm.FullName}
                    onChange={e => setProfileForm({ ...profileForm, FullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Phone Number (Plain Text)</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                    value={profileForm.Phone}
                    onChange={e => setProfileForm({ ...profileForm, Phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Line ID</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                    value={profileForm.LineID}
                    onChange={e => setProfileForm({ ...profileForm, LineID: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block mb-1">ORCID iD</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono"
                    value={profileForm.ORCID}
                    onChange={e => setProfileForm({ ...profileForm, ORCID: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Research Specialization Focus</label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                  rows={2}
                  value={profileForm.ResearchInterests}
                  onChange={e => setProfileForm({ ...profileForm, ResearchInterests: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-1">Goals for Doctoral Study</label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                  rows={3}
                  value={profileForm.GoalsForDoctoralStudy}
                  onChange={e => setProfileForm({ ...profileForm, GoalsForDoctoralStudy: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 mt-6">
                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition-all">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#F9C94A] text-[#B91C1C] font-extrabold rounded-lg border-b-2 border-[#D9A92A] hover:bg-[#FCD86E] active:border-b-0 active:translate-y-[1px] transition-all text-xs shadow-sm">Save Profile</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Record Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 bg-slate-charcoal/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl border border-gray-200 max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <h3 className="text-base font-bold font-display text-slate-charcoal border-b border-gray-100 pb-3 mb-4">
              {editingRecord ? "Edit Portfolio Entry" : `Add New Entry under Section ${selectedSection}`}
            </h3>
            <form onSubmit={handleSaveRecord} className="space-y-4 text-xs font-semibold text-gray-700">
              <div>
                <label className="block mb-1">Subsection Category Label</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                  placeholder="e.g. Coursework Completed or Milestone Progress"
                  value={recordForm.SubsectionTitle}
                  onChange={e => setRecordForm({ ...recordForm, SubsectionTitle: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Title / Academic Activity Name</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                  placeholder="Enter primary details"
                  value={recordForm.Field1}
                  onChange={e => setRecordForm({ ...recordForm, Field1: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Supporting Details / Location</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                    value={recordForm.Field2}
                    onChange={e => setRecordForm({ ...recordForm, Field2: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block mb-1">Academic Year / Score</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                    value={recordForm.Field3}
                    onChange={e => setRecordForm({ ...recordForm, Field3: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Relevant Dates / Milestone target</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                  value={recordForm.Field4}
                  onChange={e => setRecordForm({ ...recordForm, Field4: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-1">Summary Reflections / Narratives</label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                  rows={3}
                  value={recordForm.LongText}
                  onChange={e => setRecordForm({ ...recordForm, LongText: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 mt-6">
                <button type="button" onClick={() => setIsRecordModalOpen(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition-all">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#F9C94A] text-[#B91C1C] font-extrabold rounded-lg border-b-2 border-[#D9A92A] hover:bg-[#FCD86E] active:border-b-0 active:translate-y-[1px] transition-all text-xs shadow-sm">Save Entry</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Admin User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-slate-charcoal/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl border border-gray-200 max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <h3 className="text-base font-bold font-display text-slate-charcoal border-b border-gray-100 pb-3 mb-4">Add User to Database Registry</h3>
            <form onSubmit={handleSaveUser} className="space-y-4 text-xs font-semibold text-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">First Name</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                    value={userForm.FirstName}
                    onChange={e => setUserForm({ ...userForm, FirstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Last Name</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                    value={userForm.LastName}
                    onChange={e => setUserForm({ ...userForm, LastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                    value={userForm.Email}
                    onChange={e => setUserForm({ ...userForm, Email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Role Designation</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                    value={userForm.Role}
                    onChange={e => setUserForm({ ...userForm, Role: e.target.value })}
                  >
                    <option value="Student">Student</option>
                    <option value="Advisor">Advisor</option>
                    <option value="CoAdvisor">CoAdvisor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Student ID (Leave blank for Staff)</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                    value={userForm.StudentID}
                    onChange={e => setUserForm({ ...userForm, StudentID: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block mb-1">Phone Number (Plain Text)</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                    value={userForm.Phone}
                    onChange={e => setUserForm({ ...userForm, Phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 mt-6">
                <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition-all">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#F9C94A] text-[#B91C1C] font-extrabold rounded-lg border-b-2 border-[#D9A92A] hover:bg-[#FCD86E] active:border-b-0 active:translate-y-[1px] transition-all text-xs shadow-sm">Add User</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
