import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db_store.json");

app.use(express.json({ limit: "50mb" }));

// Initial State / Schema
const INITIAL_DB = {
  settings: [
    { SettingKey: "APP_NAME", SettingValue: "Doctoral Student Portfolio", Description: "Application Name", Example: "Doctoral Student Portfolio", Options: "", UpdatedAt: new Date().toISOString(), UpdatedBy: "SYSTEM" },
    { SettingKey: "UNIVERSITY_NAME", SettingValue: "Prince of Songkla University", Description: "University Name", Example: "Prince of Songkla University", Options: "", UpdatedAt: new Date().toISOString(), UpdatedBy: "SYSTEM" },
    { SettingKey: "FACULTY_NAME", SettingValue: "Faculty of Nursing", Description: "Faculty Name", Example: "Faculty of Nursing", Options: "", UpdatedAt: new Date().toISOString(), UpdatedBy: "SYSTEM" },
    { SettingKey: "PROGRAM_NAME", SettingValue: "Doctor of Philosophy Program", Description: "Program Name", Example: "Doctor of Philosophy Program", Options: "", UpdatedAt: new Date().toISOString(), UpdatedBy: "SYSTEM" },
    { SettingKey: "THEME_PRIMARY", SettingValue: "#F9C94A", Description: "Primary Theme Color", Example: "#F9C94A", Options: "", UpdatedAt: new Date().toISOString(), UpdatedBy: "SYSTEM" },
    { SettingKey: "THEME_SECONDARY", SettingValue: "#B91C1C", Description: "Secondary Theme Color", Example: "#B91C1C", Options: "", UpdatedAt: new Date().toISOString(), UpdatedBy: "SYSTEM" },
    { SettingKey: "ENABLE_CHAT", SettingValue: "TRUE", Description: "Enable Chat Module", Example: "TRUE", Options: "TRUE,FALSE", UpdatedAt: new Date().toISOString(), UpdatedBy: "SYSTEM" },
    { SettingKey: "ENABLE_NOTIFY", SettingValue: "TRUE", Description: "Enable Notifications", Example: "TRUE", Options: "TRUE,FALSE", UpdatedAt: new Date().toISOString(), UpdatedBy: "SYSTEM" },
    { SettingKey: "REQUIRE_180_RESEARCH_HOURS", SettingValue: "TRUE", Description: "Require 180 Research Hours", Example: "TRUE", Options: "TRUE,FALSE", UpdatedAt: new Date().toISOString(), UpdatedBy: "SYSTEM" },
    { SettingKey: "DEFAULT_LANGUAGE", SettingValue: "en", Description: "Default Language", Example: "en", Options: "en,th", UpdatedAt: new Date().toISOString(), UpdatedBy: "SYSTEM" },
    { SettingKey: "ALLOW_ADVISOR_EDIT", SettingValue: "TRUE", Description: "Allow Advisor to Edit Records", Example: "TRUE", Options: "TRUE,FALSE", UpdatedAt: new Date().toISOString(), UpdatedBy: "SYSTEM" },
    { SettingKey: "MAX_UPLOAD_MB", SettingValue: "10", Description: "Max Upload File Size (MB)", Example: "10", Options: "5,10,20", UpdatedAt: new Date().toISOString(), UpdatedBy: "SYSTEM" },
    { SettingKey: "EVIDENCE_FOLDER_NAME", SettingValue: "Portfolio Evidence", Description: "Google Drive Folder Name", Example: "Portfolio Evidence", Options: "", UpdatedAt: new Date().toISOString(), UpdatedBy: "SYSTEM" },
    { SettingKey: "PRINT_HEADER_TEXT", SettingValue: "Doctoral Student Portfolio", Description: "Header text for print PDF", Example: "Doctoral Student Portfolio", Options: "", UpdatedAt: new Date().toISOString(), UpdatedBy: "SYSTEM" },
    { SettingKey: "SAMPLE_DATA_CREATED", SettingValue: "TRUE", Description: "Is Sample Data Created", Example: "TRUE", Options: "TRUE,FALSE", UpdatedAt: new Date().toISOString(), UpdatedBy: "SYSTEM" }
  ],
  users: [
    { UserID: "U001", Email: "admin@example.com", Password: "1234", Role: "Admin", Prefix: "Dr.", FirstName: "System", LastName: "Administrator", FullName: "Dr. System Administrator", StudentID: "", Program: "", Faculty: "Nursing", University: "Prince of Songkla University", AdmissionYear: "", ExpectedGraduationYear: "", MajorAdvisorID: "", CoAdvisorIDs: "", Position: "IT Admin", Affiliation: "Faculty of Nursing", Phone: "0811111111", LineID: "admin_line", ResearchInterests: "Informatics", ORCID: "", PhotoURL: "https://unavatar.io/gravatar/admin@example.com?fallback=https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150", Status: "Active", CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
    { UserID: "U002", Email: "advisor@example.com", Password: "1234", Role: "Advisor", Prefix: "Assoc. Prof. Dr.", FirstName: "Somchai", LastName: "Rakdee", FullName: "Assoc. Prof. Dr. Somchai Rakdee", StudentID: "", Program: "", Faculty: "Nursing", University: "Prince of Songkla University", AdmissionYear: "", ExpectedGraduationYear: "", MajorAdvisorID: "", CoAdvisorIDs: "", Position: "Senior Advisor", Affiliation: "Department of Adult Nursing", Phone: "0822222222", LineID: "somchai_line", ResearchInterests: "Geriatric Nursing, Chronic Care, Active Aging", ORCID: "0000-0002-1823-9001", PhotoURL: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150", Status: "Active", CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
    { UserID: "U003", Email: "coadvisor@example.com", Password: "1234", Role: "CoAdvisor", Prefix: "Asst. Prof. Dr.", FirstName: "Nongnuch", LastName: "Prasert", FullName: "Asst. Prof. Dr. Nongnuch Prasert", StudentID: "", Program: "", Faculty: "Nursing", University: "Prince of Songkla University", AdmissionYear: "", ExpectedGraduationYear: "", MajorAdvisorID: "", CoAdvisorIDs: "", Position: "Co-Advisor", Affiliation: "Department of Pediatric Nursing", Phone: "0833333333", LineID: "nongnuch_line", ResearchInterests: "Family-Centered Care, Pediatric Development", ORCID: "0000-0003-4567-8901", PhotoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150", Status: "Active", CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
    { UserID: "U004", Email: "student@example.com", Password: "1234", Role: "Student", Prefix: "Mrs.", FirstName: "Kanya", LastName: "Srisuwan", FullName: "Mrs. Kanya Srisuwan", StudentID: "6814320001", Program: "Doctor of Philosophy Program in Nursing Science", Faculty: "Nursing", University: "Prince of Songkla University", AdmissionYear: "2025", ExpectedGraduationYear: "2028", MajorAdvisorID: "U002", CoAdvisorIDs: "U003", Position: "Registered Nurse", Affiliation: "Songklanagarind Hospital", Phone: "0812345678", LineID: "kanya_line", ResearchInterests: "Geriatric Diabetes Self-Management, Digital Health Interventions", ORCID: "0000-0001-9876-5432", PhotoURL: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150", Status: "Active", CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
    { UserID: "U005", Email: "pirunnapa.ben@example.com", Password: "1234", Role: "Student", Prefix: "Miss", FirstName: "Pirunnapa", LastName: "Benjamart", FullName: "Miss Pirunnapa Benjamart", StudentID: "6814320039", Program: "Doctor of Philosophy Program in Nursing Science (International)", Faculty: "Nursing", University: "Prince of Songkla University", AdmissionYear: "2025", ExpectedGraduationYear: "2028", MajorAdvisorID: "U002", CoAdvisorIDs: "U003", Position: "Lecturer", Affiliation: "Surat Thani Nursing College", Phone: "0890001234", LineID: "pirunnapa_line", ResearchInterests: "Palliative Care, Spiritual Well-being in Oncology", ORCID: "0000-0002-3456-7890", PhotoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150", Status: "Active", CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() }
  ],
  portfolioRecords: [
    // Section 1. Student Profile
    { RecordID: "R101", StudentUserID: "U004", SectionNo: 1, SectionTitle: "Student Profile", SubsectionNo: 1.2, SubsectionTitle: "Academic Background", RecordType: "Education", Field1: "Master of Science in Nursing", Field2: "Prince of Songkla University", Field3: "2021", Field4: "GPA: 3.85", Field5: "", Field6: "", Field7: "", LongText: "Thesis: Effectiveness of Home-Based Exercise Program on Frail Elderly Nursing Patients.", Status: "Verified", EvidenceIDs: "E001", CreatedBy: "U004", CreatedAt: new Date().toISOString(), UpdatedBy: "U004", UpdatedAt: new Date().toISOString() },
    { RecordID: "R102", StudentUserID: "U004", SectionNo: 1, SectionTitle: "Student Profile", SubsectionNo: 1.3, SubsectionTitle: "Professional Background", RecordType: "Employment", Field1: "Registered Nurse (ICU)", Field2: "Songklanagarind Hospital", Field3: "2021", Field4: "2024", Field5: "", Field6: "", Field7: "", LongText: "Handled critically ill adult and elderly patients, specialized in diabetes-related complications and ICU management protocols.", Status: "Verified", EvidenceIDs: "", CreatedBy: "U004", CreatedAt: new Date().toISOString(), UpdatedBy: "U004", UpdatedAt: new Date().toISOString() },
    // Section 2. Program of Study & Milestones
    { RecordID: "R201", StudentUserID: "U004", SectionNo: 2, SectionTitle: "Program of Study and Academic Milestones", SubsectionNo: 2.2, SubsectionTitle: "Doctoral Milestones and Timeline", RecordType: "Milestone", Field1: "Proposal Defense", Field2: "Planned: Nov 2026", Field3: "Status: Preparing Draft", Field4: "", Field5: "", Field6: "", Field7: "", LongText: "Working closely with Major Advisor Assoc. Prof. Dr. Somchai to refine research scope, objectives and ethics clearance checklist.", Status: "In Progress", EvidenceIDs: "", CreatedBy: "U004", CreatedAt: new Date().toISOString(), UpdatedBy: "U004", UpdatedAt: new Date().toISOString() },
    // Section 3. English
    { RecordID: "R301", StudentUserID: "U004", SectionNo: 3, SectionTitle: "English Language Proficiency Requirement", SubsectionNo: 3.1, SubsectionTitle: "Record of English Language Test", RecordType: "Test", Field1: "TOEFL ITP", Field2: "560", Field3: "Passed", Field4: "Date Taken: Oct 2025", Field5: "", Field6: "", Field7: "", LongText: "Achieved the required English threshold for the PhD program.", Status: "Verified", EvidenceIDs: "E002", CreatedBy: "U004", CreatedAt: new Date().toISOString(), UpdatedBy: "U004", UpdatedAt: new Date().toISOString() },
    // Section 4. Coursework
    { RecordID: "R401", StudentUserID: "U004", SectionNo: 4, SectionTitle: "Coursework and Academic Development", SubsectionNo: 4.1, SubsectionTitle: "Courses Completed", RecordType: "Course", Field1: "NUR901: Advanced Nursing Research Methodology", Field2: "Grade: A", Field3: "3 Credits", Field4: "Semester 1/2025", Field5: "", Field6: "", Field7: "", LongText: "Mastered qualitative and quantitative nursing research designs.", Status: "Verified", EvidenceIDs: "", CreatedBy: "U004", CreatedAt: new Date().toISOString(), UpdatedBy: "U004", UpdatedAt: new Date().toISOString() },
    // Section 5. Dissertation Progress
    { RecordID: "R501", StudentUserID: "U004", SectionNo: 5, SectionTitle: "Research Development and Dissertation Progress", SubsectionNo: 5.3, SubsectionTitle: "Dissertation Progress Record", RecordType: "Progress", Field1: "Chapter 1-3 Outline", Field2: "Completed Draft", Field3: "90% complete", Field4: "", Field5: "", Field6: "", Field7: "", LongText: "Background section has been fully drafted. Literature search for Chapter 2 has been systematic and organized with EndNote.", Status: "In Progress", EvidenceIDs: "", CreatedBy: "U004", CreatedAt: new Date().toISOString(), UpdatedBy: "U004", UpdatedAt: new Date().toISOString() },
    // Section 7. Scholarly Output
    { RecordID: "R701", StudentUserID: "U004", SectionNo: 7, SectionTitle: "Scholarly Output", SubsectionNo: 7.2, SubsectionTitle: "Publications", RecordType: "Publication", Field1: "Self-Management Interventions for Older Adults", Field2: "Journal of Nursing Science", Field3: "Scopus Q2", Field4: "Co-Author", Field5: "Published Dec 2025", Field6: "", Field7: "", LongText: "Published a review paper on current self-management strategies for rural elderly diabetes patients.", Status: "Published", EvidenceIDs: "E003", CreatedBy: "U004", CreatedAt: new Date().toISOString(), UpdatedBy: "U004", UpdatedAt: new Date().toISOString() }
  ],
  studentProfiles: [
    { ProfileID: "P001", StudentUserID: "U004", FullName: "Mrs. Kanya Srisuwan", ContactInformation: "Email: kanya@example.com, Tel: 0812345678, Line: kanya_line", CurrentPositionAffiliation: "Registered Nurse at ICU, Songklanagarind Hospital", ResearchInterests: "Geriatric Diabetes Self-Management, Digital Health Interventions, Chronic Care Models", ORCID: "0000-0001-9876-5432", GoalsForDoctoralStudy: "To develop into an independent nursing scientist who utilizes digital technology to solve self-management challenges in the Thai elderly diabetes population.", DevelopmentPlan: "Year 1: Complete coursework, pass TOEFL, prepare proposal.\nYear 2: Proposal Defense, Ethics Approval, Data Collection.\nYear 3: Publications, Dissertation Defense.", EnglishReflection: "I improved my academic writing by attending the intensive English bootcamp provided by the university. I practice writing reflections weekly.", ResearchExperienceReflection: "Acting as a research assistant under Assoc. Prof. Dr. Somchai has tremendously enhanced my systematic lit-review skills.", NetworkingReflection: "Presented at the PSU International Nursing Conference, built networks with scholars from Singapore and Taiwan.", CommunicationReflection: "Gained confidence presenting in English during academic seminars and research progress defense.", AcademicGrowthReflection: "Developed a deep understanding of epistemology and ontology in healthcare research.", ResearchIdentityReflection: "Developing a strong identity as an applied digital health nursing researcher.", ChallengesReflection: "Balancing full-time PhD coursework and minor clinical duties was challenging, but time-blocking helped.", TransformationReflection: "Transitioned from a clinical consumer of research to an active, critical designer of scientific inquiries.", ShortTermCareerGoals: "Publish at least two Scopus Q1/Q2 papers, obtain PhD within 3.5 years.", LongTermCareerAspirations: "Become a Full Professor of Nursing, leading a digital healthcare research unit.", PreparationNeeded: "Advanced training in biostatistics and artificial intelligence applications in nursing care.", UpdatedAt: new Date().toISOString(), UpdatedBy: "U004" },
    { ProfileID: "P002", StudentUserID: "U005", FullName: "Miss Pirunnapa Benjamart", ContactInformation: "Email: pirunnapa.ben@example.com, Tel: 0890001234", CurrentPositionAffiliation: "Lecturer, Surat Thani Nursing College", ResearchInterests: "Palliative Care, Spiritual Well-being in Oncology, End-of-Life care", ORCID: "0000-0002-3456-7890", GoalsForDoctoralStudy: "To establish a national model for palliative care Integration in community settings in southern Thailand.", DevelopmentPlan: "Complete courses with GPA > 3.80, publish 2 international papers, establish community palliative clinics.", EnglishReflection: "Scored high on entrance, continuing to study advanced academic publishing.", ResearchExperienceReflection: "Collaborated on multi-center palliative care trials, mastering qualitative triangulation methods.", NetworkingReflection: "Active member of Thai Palliative Care Association.", CommunicationReflection: "Excellent orator, delivered public nursing workshops.", AcademicGrowthReflection: "Grown significantly in critical appraisal of medical ethics.", ResearchIdentityReflection: "Compassionate, patient-centered clinical nursing researcher.", ChallengesReflection: "Travel between Surat Thani and Hat Yai was taxing, but solved with virtual check-ins.", TransformationReflection: "Evolved to advocate strongly for nurse-led spiritual palliative intervention guidelines.", ShortTermCareerGoals: "Complete dissertation on spiritual palliative nursing model.", LongTermCareerAspirations: "Dean of Nursing College, National Palliative Care Consultant.", PreparationNeeded: "Post-doctoral fellowship in global palliative care centers (UK/Australia).", UpdatedAt: new Date().toISOString(), UpdatedBy: "U005" }
  ],
  dissertations: [
    { DissertationID: "D001", StudentUserID: "U004", TopicDevelopment: "Started with general elder care, refined to Mobile-App supported Self-Management for Type 2 Diabetes rural elderly in Southern Thailand.", Title: "Development and Evaluation of a Digital Mobile Health Application for Enhancing Type 2 Diabetes Self-Management Among Rural Older Adults", BackgroundSignificance: "Type 2 Diabetes among rural elderly is soaring in Southern Thailand, with limited hospital access. App-guided intervention can bridge this barrier.", ResearchProblem: "Existing apps are too complex for rural elderly. There is a critical gap in tailored, high-usability elderly interfaces that integrate caregiver notify loops.", Objectives: "1) Design user-friendly Thai mobile health app.\n2) Evaluate app feasibility.\n3) Examine clinical efficacy on HbA1c and self-care efficacy.", ResearchQuestionsHypotheses: "Can a tailored mobile app improve self-care efficacy and lower HbA1c levels compared to standard hospital leaflets?", ConceptualFramework: "Modified Social Cognitive Theory & Health Belief Model.", MethodologyOverview: "Mixed-methods design. Phase 1: Co-design app with older adults. Phase 2: 12-week randomized controlled trial (RCT) with 80 participants.", EthicsApplicationDate: "2025-12-15", EthicsApprovalDate: "2026-02-10", ApprovalNumber: "NUR-PSU-2026-004", Amendments: "None", DataManagementNotes: "All data encrypted, stored on Prince of Songkla secure server, pseudonymized.", ChallengesSolutions: "Elderly initial resistance to smartphones. Solved by holding hands-on community workshops and assigning family touchpoints.", UpdatedAt: new Date().toISOString(), UpdatedBy: "U004" }
  ],
  researchHours: [
    { HourID: "H001", StudentUserID: "U004", Date: "2025-09-12", ResearchActivity: "Literature Search and Systematic Mapping", WorkDescription: "Conducted systematic searches across PubMed, CINAHL, and Scopus for elderly digital health interventions.", Hours: 25, SupervisorAdvisor: "Assoc. Prof. Dr. Somchai Rakdee", EvidenceIDs: "", CreatedBy: "U004", CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
    { HourID: "H002", StudentUserID: "U004", Date: "2025-10-05", ResearchActivity: "Data Collection Training & Pilot Simulation", WorkDescription: "Trained research assistants on collecting clinical biomarkers and patient questionnaires in the local health center.", Hours: 30, SupervisorAdvisor: "Assoc. Prof. Dr. Somchai Rakdee", EvidenceIDs: "", CreatedBy: "U004", CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
    { HourID: "H003", StudentUserID: "U004", Date: "2025-11-20", ResearchActivity: "Qualitative Focus Group Transcription & Analysis", WorkDescription: "Transcribed 3 focus groups of elderly patients sharing their mobile phone navigation hurdles.", Hours: 45, SupervisorAdvisor: "Assoc. Prof. Dr. Somchai Rakdee", EvidenceIDs: "E004", CreatedBy: "U004", CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
    { HourID: "H004", StudentUserID: "U004", Date: "2026-01-15", ResearchActivity: "Data Analysis and Synthesizing Results", WorkDescription: "Performed SPSS quantitative data analysis on pre-test biomarkers and mapped out patient user personas.", Hours: 15, SupervisorAdvisor: "Asst. Prof. Dr. Nongnuch Prasert", EvidenceIDs: "", CreatedBy: "U004", CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() }
  ],
  competencyAssessments: [
    { AssessmentID: "A001", StudentUserID: "U004", Competency: "Advanced disciplinary knowledge", Level: "Proficient", EvidenceRemarks: "Completed all core nurse science PhD courses with grade A.", ReviewYear: "2025", CreatedBy: "U002", CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
    { AssessmentID: "A002", StudentUserID: "U004", Competency: "Research design and methodology", Level: "Competent", EvidenceRemarks: "Drafted a robust mixed-method randomized trial proposal.", ReviewYear: "2025", CreatedBy: "U002", CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
    { AssessmentID: "A003", StudentUserID: "U004", Competency: "Academic writing", Level: "Developing", EvidenceRemarks: "Scopus review published, but dissertation Chapter 2 drafts need editing help.", ReviewYear: "2025", CreatedBy: "U002", CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
    { AssessmentID: "A004", StudentUserID: "U004", Competency: "English communication for academic purposes", Level: "Proficient", EvidenceRemarks: "TOEFL score 560, smoothly delivered presentation at conference.", ReviewYear: "2025", CreatedBy: "U003", CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() }
  ],
  advisorComments: [
    { CommentID: "C001", StudentUserID: "U004", AdvisorUserID: "U002", ReviewYear: "2025", CommentText: "Mrs. Kanya is highly driven and shows excellent initiative. Her academic growth is exceptional. Her publication in Year 1 is impressive. She must continue focusing on advanced statistical tools.", Recommendation: "Approve to proceed to Proposal Defense stage, provided Chapter 3 has rigorous control measures.", Status: "Approved", CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() }
  ],
  endorsements: [
    { EndorsementID: "E101", StudentUserID: "U004", Role: "Major Advisor", AdvisorUserID: "U002", AdvisorName: "Assoc. Prof. Dr. Somchai Rakdee", SignatureText: "Somchai R.", SignatureDate: "2026-02-15", Status: "Endorsed", CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
    { EndorsementID: "E102", StudentUserID: "U004", Role: "Co-Advisor / Committee Member", AdvisorUserID: "U003", AdvisorName: "Asst. Prof. Dr. Nongnuch Prasert", SignatureText: "Nongnuch P.", SignatureDate: "2026-02-16", Status: "Endorsed", CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() }
  ],
  evidence: [
    { EvidenceID: "E001", StudentUserID: "U004", RelatedRecordID: "R101", RelatedSection: "1.2", FileName: "MSN_Certificate_PSU.pdf", FileURL: "https://drive.google.com/file/d/mock-msn-cert-url", FileID: "mock-id-msn-cert", MimeType: "application/pdf", UploadedBy: "U004", UploadedAt: new Date().toISOString(), Description: "Official MSN Graduation Transcript & Degree Certificate" },
    { EvidenceID: "E002", StudentUserID: "U004", RelatedRecordID: "R301", RelatedSection: "3.1", FileName: "TOEFL_ITP_560_Report.pdf", FileURL: "https://drive.google.com/file/d/mock-toefl-report-url", FileID: "mock-id-toefl", MimeType: "application/pdf", UploadedBy: "U004", UploadedAt: new Date().toISOString(), Description: "English proficiency test results report" },
    { EvidenceID: "E003", StudentUserID: "U004", RelatedRecordID: "R701", RelatedSection: "7.2", FileName: "Scopus_Review_Diabetes_Elderly.pdf", FileURL: "https://drive.google.com/file/d/mock-scopus-review-url", FileID: "mock-id-scopus", MimeType: "application/pdf", UploadedBy: "U004", UploadedAt: new Date().toISOString(), Description: "Published paper PDF in JNS" },
    { EvidenceID: "E004", StudentUserID: "U004", RelatedRecordID: "H003", RelatedSection: "6.1", FileName: "Focus_Group_Transcript_Analysis.xlsx", FileURL: "https://drive.google.com/file/d/mock-excel-transcript-url", FileID: "mock-id-excel-transcript", MimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", UploadedBy: "U004", UploadedAt: new Date().toISOString(), Description: "Transcripts coding matrix and theme map" }
  ],
  notifications: [
    { NotificationID: "N001", SenderUserID: "U002", ReceiverUserID: "U004", Title: "Annual Portfolio Review Scheduled", Message: "Please make sure to complete sections 1 to 14, especially the Reflective Practice and future career plans, before our meeting next Friday.", FileName: "Annual_Review_Agenda.pdf", FileURL: "https://drive.google.com/file/d/mock-notify-agenda", IsRead: "FALSE", CreatedAt: new Date().toISOString(), ReadAt: "" },
    { NotificationID: "N002", SenderUserID: "U001", ReceiverUserID: "U004", Title: "Evidence Submission Required", Message: "Admin reminder: Please upload your TOEFL certificate and co-advisor signatures in Section 3 and 16 before the end of this semester.", FileName: "", FileURL: "", IsRead: "TRUE", CreatedAt: new Date().toISOString(), ReadAt: new Date().toISOString() }
  ],
  chatMessages: [
    { MessageID: "M001", ThreadID: "U004-U002", SenderUserID: "U004", ReceiverUserID: "U002", StudentUserID: "U004", MessageText: "Good evening, Professor. I have updated the Chapter 2 Systematic Literature Review table in Section 5.3. Could you please check if the synthesis is deep enough?", FileName: "", FileURL: "", IsRead: "TRUE", CreatedAt: new Date(Date.now() - 3600000 * 2).toISOString() },
    { MessageID: "M002", ThreadID: "U004-U002", SenderUserID: "U002", ReceiverUserID: "U004", StudentUserID: "U004", MessageText: "Excellent work, Kanya. The synthesis tables look clear. I added a comment in the Advisor Workspace suggesting you group the digital literacy barriers more clearly.", FileName: "Advisor_Lit_Feedback.pdf", FileURL: "https://drive.google.com/file/d/mock-advisor-feedback", IsRead: "FALSE", CreatedAt: new Date(Date.now() - 3600000).toISOString() },
    { MessageID: "M003", ThreadID: "U004-U003", SenderUserID: "U003", ReceiverUserID: "U004", StudentUserID: "U004", MessageText: "Hi Kanya, as Co-advisor I checked your focus group transcripts. Excellent qualitative density! Let us catch up next Wednesday on child-caregiver involvement.", FileName: "", FileURL: "", IsRead: "FALSE", CreatedAt: new Date(Date.now() - 1800000).toISOString() }
  ],
  activityLog: [
    { LogID: "L001", UserID: "U001", Action: "setupDatabase", Detail: "Database schema successfully initiated by admin.", CreatedAt: new Date().toISOString() },
    { LogID: "L002", UserID: "U001", Action: "setupExampleData", Detail: "Preloaded rich academic sample portfolio data for 2 students and advisors.", CreatedAt: new Date().toISOString() }
  ]
};

// Database utility functions
function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), "utf8");
    return INITIAL_DB;
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file, resetting to initial state", err);
    return INITIAL_DB;
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing database file", err);
  }
}

// Ensure database file is generated right away
readDb();

// API Endpoints corresponding to GAS functions

// Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const db = readDb();
  const user = db.users.find(
    (u: any) => u.Email.toLowerCase() === email.toLowerCase() && u.Password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  if (user.Status !== "Active") {
    return res.status(403).json({ error: "User account is suspended or inactive" });
  }

  // Create a copy without password
  const { Password, ...userSafe } = user;
  res.json({ user: userSafe });
});

// Setup DB
app.post("/api/setupDatabase", (req, res) => {
  writeDb(INITIAL_DB);
  res.json({
    success: true,
    message: "Database schema and folders initialized successfully.",
    spreadsheetId: "1gas-demo-spreadsheet-id",
    spreadsheetUrl: "https://docs.google.com/spreadsheets/d/1gas-demo-spreadsheet-id",
    folderId: "1gas-demo-drive-folder-id",
    folderUrl: "https://drive.google.com/drive/folders/1gas-demo-drive-folder-id"
  });
});

// Setup Example Data
app.post("/api/setupExampleData", (req, res) => {
  writeDb(INITIAL_DB);
  res.json({
    success: true,
    message: "Rich academic sample data preloaded successfully."
  });
});

// Get App Data (filters based on role)
app.post("/api/getAppData", (req, res) => {
  const { userId } = req.body;
  const db = readDb();
  const user = db.users.find((u: any) => u.UserID === userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const role = user.Role;

  let filteredUsers = [...db.users];
  let filteredRecords = [...db.portfolioRecords];
  let filteredProfiles = [...db.studentProfiles];
  let filteredDissertations = [...db.dissertations];
  let filteredResearchHours = [...db.researchHours];
  let filteredAssessments = [...db.competencyAssessments];
  let filteredComments = [...db.advisorComments];
  let filteredEndorsements = [...db.endorsements];
  let filteredEvidence = [...db.evidence];
  let filteredNotifications = [...db.notifications];
  let filteredChatMessages = [...db.chatMessages];

  // Filtering based on role
  if (role === "Student") {
    filteredRecords = db.portfolioRecords.filter((r: any) => r.StudentUserID === userId);
    filteredProfiles = db.studentProfiles.filter((p: any) => p.StudentUserID === userId);
    filteredDissertations = db.dissertations.filter((d: any) => d.StudentUserID === userId);
    filteredResearchHours = db.researchHours.filter((h: any) => h.StudentUserID === userId);
    filteredAssessments = db.competencyAssessments.filter((a: any) => a.StudentUserID === userId);
    filteredComments = db.advisorComments.filter((c: any) => c.StudentUserID === userId);
    filteredEndorsements = db.endorsements.filter((e: any) => e.StudentUserID === userId);
    filteredEvidence = db.evidence.filter((e: any) => e.StudentUserID === userId);
    filteredNotifications = db.notifications.filter((n: any) => n.ReceiverUserID === userId);
    filteredChatMessages = db.chatMessages.filter(
      (m: any) => m.StudentUserID === userId || m.SenderUserID === userId || m.ReceiverUserID === userId
    );
  } else if (role === "Advisor") {
    // Advisor sees students they advise
    const advisedStudentIds = db.users
      .filter((u: any) => u.MajorAdvisorID === userId)
      .map((u: any) => u.UserID);

    filteredRecords = db.portfolioRecords.filter((r: any) => advisedStudentIds.includes(r.StudentUserID));
    filteredProfiles = db.studentProfiles.filter((p: any) => advisedStudentIds.includes(p.StudentUserID));
    filteredDissertations = db.dissertations.filter((d: any) => advisedStudentIds.includes(d.StudentUserID));
    filteredResearchHours = db.researchHours.filter((h: any) => advisedStudentIds.includes(h.StudentUserID));
    filteredAssessments = db.competencyAssessments.filter((a: any) => advisedStudentIds.includes(a.StudentUserID));
    filteredComments = db.advisorComments.filter(
      (c: any) => advisedStudentIds.includes(c.StudentUserID) || c.AdvisorUserID === userId
    );
    filteredEndorsements = db.endorsements.filter(
      (e: any) => advisedStudentIds.includes(e.StudentUserID) || e.AdvisorUserID === userId
    );
    filteredEvidence = db.evidence.filter((e: any) => advisedStudentIds.includes(e.StudentUserID));
    filteredNotifications = db.notifications.filter(
      (n: any) => n.SenderUserID === userId || advisedStudentIds.includes(n.ReceiverUserID)
    );
    filteredChatMessages = db.chatMessages.filter(
      (m: any) => m.SenderUserID === userId || m.ReceiverUserID === userId || advisedStudentIds.includes(m.StudentUserID)
    );
  } else if (role === "CoAdvisor") {
    // Co-advisor sees students they are co-advisor for
    const linkedStudentIds = db.users
      .filter((u: any) => u.CoAdvisorIDs && u.CoAdvisorIDs.split(",").includes(userId))
      .map((u: any) => u.UserID);

    filteredRecords = db.portfolioRecords.filter((r: any) => linkedStudentIds.includes(r.StudentUserID));
    filteredProfiles = db.studentProfiles.filter((p: any) => linkedStudentIds.includes(p.StudentUserID));
    filteredDissertations = db.dissertations.filter((d: any) => linkedStudentIds.includes(d.StudentUserID));
    filteredResearchHours = db.researchHours.filter((h: any) => linkedStudentIds.includes(h.StudentUserID));
    filteredAssessments = db.competencyAssessments.filter((a: any) => linkedStudentIds.includes(a.StudentUserID));
    filteredComments = db.advisorComments.filter((c: any) => linkedStudentIds.includes(c.StudentUserID));
    filteredEndorsements = db.endorsements.filter((e: any) => linkedStudentIds.includes(e.StudentUserID));
    filteredEvidence = db.evidence.filter((e: any) => linkedStudentIds.includes(e.StudentUserID));
    filteredNotifications = db.notifications.filter(
      (n: any) => n.SenderUserID === userId || linkedStudentIds.includes(n.ReceiverUserID)
    );
    filteredChatMessages = db.chatMessages.filter(
      (m: any) => m.SenderUserID === userId || m.ReceiverUserID === userId || linkedStudentIds.includes(m.StudentUserID)
    );
  }

  // Admin sees all, no filtering needed.

  res.json({
    users: filteredUsers.map(({ Password, ...u }) => u), // Strip passwords for safety
    portfolioRecords: filteredRecords,
    studentProfiles: filteredProfiles,
    dissertations: filteredDissertations,
    researchHours: filteredResearchHours,
    competencyAssessments: filteredAssessments,
    advisorComments: filteredComments,
    endorsements: filteredEndorsements,
    evidence: filteredEvidence,
    notifications: filteredNotifications,
    chatMessages: filteredChatMessages,
    settings: db.settings
  });
});

// Save Profile
app.post("/api/saveUserProfile", (req, res) => {
  const payload = req.body;
  const db = readDb();
  
  // Find or insert profile
  const index = db.studentProfiles.findIndex((p: any) => p.StudentUserID === payload.StudentUserID);
  const updatedProfile = {
    ProfileID: payload.ProfileID || "P" + Date.now(),
    StudentUserID: payload.StudentUserID,
    FullName: payload.FullName || "",
    ContactInformation: payload.ContactInformation || "",
    CurrentPositionAffiliation: payload.CurrentPositionAffiliation || "",
    ResearchInterests: payload.ResearchInterests || "",
    ORCID: payload.ORCID || "",
    GoalsForDoctoralStudy: payload.GoalsForDoctoralStudy || "",
    DevelopmentPlan: payload.DevelopmentPlan || "",
    EnglishReflection: payload.EnglishReflection || "",
    ResearchExperienceReflection: payload.ResearchExperienceReflection || "",
    NetworkingReflection: payload.NetworkingReflection || "",
    CommunicationReflection: payload.CommunicationReflection || "",
    AcademicGrowthReflection: payload.AcademicGrowthReflection || "",
    ResearchIdentityReflection: payload.ResearchIdentityReflection || "",
    ChallengesReflection: payload.ChallengesReflection || "",
    TransformationReflection: payload.TransformationReflection || "",
    ShortTermCareerGoals: payload.ShortTermCareerGoals || "",
    LongTermCareerAspirations: payload.LongTermCareerAspirations || "",
    PreparationNeeded: payload.PreparationNeeded || "",
    UpdatedAt: new Date().toISOString(),
    UpdatedBy: payload.UpdatedBy || payload.StudentUserID
  };

  if (index !== -1) {
    db.studentProfiles[index] = updatedProfile;
  } else {
    db.studentProfiles.push(updatedProfile);
  }

  // Also update standard user profile info (FullName, Phone, ResearchInterests, LineID, ORCID etc) if matching
  const userIndex = db.users.findIndex((u: any) => u.UserID === payload.StudentUserID);
  if (userIndex !== -1) {
    db.users[userIndex].FullName = payload.FullName || db.users[userIndex].FullName;
    db.users[userIndex].ResearchInterests = payload.ResearchInterests || db.users[userIndex].ResearchInterests;
    db.users[userIndex].ORCID = payload.ORCID || db.users[userIndex].ORCID;
    db.users[userIndex].UpdatedAt = new Date().toISOString();
  }

  writeDb(db);
  res.json({ success: true, profile: updatedProfile, users: db.users.map(({ Password, ...u }) => u) });
});

// Save Portfolio Record
app.post("/api/savePortfolioRecord", (req, res) => {
  const payload = req.body;
  const db = readDb();

  const recordID = payload.RecordID || "R" + Date.now();
  const newRecord = {
    RecordID: recordID,
    StudentUserID: payload.StudentUserID,
    SectionNo: Number(payload.SectionNo),
    SectionTitle: payload.SectionTitle,
    SubsectionNo: Number(payload.SubsectionNo),
    SubsectionTitle: payload.SubsectionTitle,
    RecordType: payload.RecordType || "",
    Field1: payload.Field1 || "",
    Field2: payload.Field2 || "",
    Field3: payload.Field3 || "",
    Field4: payload.Field4 || "",
    Field5: payload.Field5 || "",
    Field6: payload.Field6 || "",
    Field7: payload.Field7 || "",
    LongText: payload.LongText || "",
    Status: payload.Status || "Draft",
    EvidenceIDs: payload.EvidenceIDs || "",
    CreatedBy: payload.CreatedBy || payload.StudentUserID,
    CreatedAt: payload.CreatedAt || new Date().toISOString(),
    UpdatedBy: payload.UpdatedBy || payload.StudentUserID,
    UpdatedAt: new Date().toISOString()
  };

  const idx = db.portfolioRecords.findIndex((r: any) => r.RecordID === payload.RecordID);
  if (idx !== -1) {
    db.portfolioRecords[idx] = newRecord;
  } else {
    db.portfolioRecords.push(newRecord);
  }

  writeDb(db);
  res.json({ success: true, record: newRecord });
});

// Delete Portfolio Record
app.post("/api/deletePortfolioRecord", (req, res) => {
  const { recordId } = req.body;
  const db = readDb();
  db.portfolioRecords = db.portfolioRecords.filter((r: any) => r.RecordID !== recordId);
  writeDb(db);
  res.json({ success: true });
});

// Save Dissertation Info
app.post("/api/saveDissertation", (req, res) => {
  const payload = req.body;
  const db = readDb();

  const disID = payload.DissertationID || "D" + Date.now();
  const updatedDiss = {
    DissertationID: disID,
    StudentUserID: payload.StudentUserID,
    TopicDevelopment: payload.TopicDevelopment || "",
    Title: payload.Title || "",
    BackgroundSignificance: payload.BackgroundSignificance || "",
    ResearchProblem: payload.ResearchProblem || "",
    Objectives: payload.Objectives || "",
    ResearchQuestionsHypotheses: payload.ResearchQuestionsHypotheses || "",
    ConceptualFramework: payload.ConceptualFramework || "",
    MethodologyOverview: payload.MethodologyOverview || "",
    EthicsApplicationDate: payload.EthicsApplicationDate || "",
    EthicsApprovalDate: payload.EthicsApprovalDate || "",
    ApprovalNumber: payload.ApprovalNumber || "",
    Amendments: payload.Amendments || "",
    DataManagementNotes: payload.DataManagementNotes || "",
    ChallengesSolutions: payload.ChallengesSolutions || "",
    UpdatedAt: new Date().toISOString(),
    UpdatedBy: payload.UpdatedBy || payload.StudentUserID
  };

  const idx = db.dissertations.findIndex((d: any) => d.StudentUserID === payload.StudentUserID);
  if (idx !== -1) {
    db.dissertations[idx] = updatedDiss;
  } else {
    db.dissertations.push(updatedDiss);
  }

  writeDb(db);
  res.json({ success: true, dissertation: updatedDiss });
});

// Save Research Hour
app.post("/api/saveResearchHour", (req, res) => {
  const payload = req.body;
  const db = readDb();

  const hourID = payload.HourID || "H" + Date.now();
  const updatedHour = {
    HourID: hourID,
    StudentUserID: payload.StudentUserID,
    Date: payload.Date || new Date().toISOString().split("T")[0],
    ResearchActivity: payload.ResearchActivity || "",
    WorkDescription: payload.WorkDescription || "",
    Hours: Number(payload.Hours || 0),
    SupervisorAdvisor: payload.SupervisorAdvisor || "",
    EvidenceIDs: payload.EvidenceIDs || "",
    CreatedBy: payload.CreatedBy || payload.StudentUserID,
    CreatedAt: payload.CreatedAt || new Date().toISOString(),
    UpdatedAt: new Date().toISOString()
  };

  const idx = db.researchHours.findIndex((h: any) => h.HourID === payload.HourID);
  if (idx !== -1) {
    db.researchHours[idx] = updatedHour;
  } else {
    db.researchHours.push(updatedHour);
  }

  writeDb(db);
  res.json({ success: true, hour: updatedHour });
});

// Save Competency Assessment
app.post("/api/saveCompetencyAssessment", (req, res) => {
  const payload = req.body;
  const db = readDb();

  const assessmentID = payload.AssessmentID || "A" + Date.now();
  const updatedAssessment = {
    AssessmentID: assessmentID,
    StudentUserID: payload.StudentUserID,
    Competency: payload.Competency || "",
    Level: payload.Level || "Beginning",
    EvidenceRemarks: payload.EvidenceRemarks || "",
    ReviewYear: payload.ReviewYear || new Date().getFullYear().toString(),
    CreatedBy: payload.CreatedBy || "System",
    CreatedAt: payload.CreatedAt || new Date().toISOString(),
    UpdatedAt: new Date().toISOString()
  };

  const idx = db.competencyAssessments.findIndex(
    (a: any) => a.StudentUserID === payload.StudentUserID && a.Competency === payload.Competency
  );
  if (idx !== -1) {
    db.competencyAssessments[idx] = updatedAssessment;
  } else {
    db.competencyAssessments.push(updatedAssessment);
  }

  writeDb(db);
  res.json({ success: true, assessment: updatedAssessment });
});

// Send Notification
app.post("/api/sendNotification", (req, res) => {
  const payload = req.body;
  const db = readDb();

  const notify = {
    NotificationID: "N" + Date.now(),
    SenderUserID: payload.SenderUserID,
    ReceiverUserID: payload.ReceiverUserID,
    Title: payload.Title || "Notification",
    Message: payload.Message || "",
    FileName: payload.FileName || "",
    FileURL: payload.FileURL || "",
    IsRead: "FALSE",
    CreatedAt: new Date().toISOString(),
    ReadAt: ""
  };

  db.notifications.push(notify);
  writeDb(db);
  res.json({ success: true, notification: notify });
});

// Mark Notification Read
app.post("/api/markNotificationRead", (req, res) => {
  const { notificationId } = req.body;
  const db = readDb();

  const idx = db.notifications.findIndex((n: any) => n.NotificationID === notificationId);
  if (idx !== -1) {
    db.notifications[idx].IsRead = "TRUE";
    db.notifications[idx].ReadAt = new Date().toISOString();
  }

  writeDb(db);
  res.json({ success: true });
});

// Send Chat Message
app.post("/api/sendChatMessage", (req, res) => {
  const payload = req.body;
  const db = readDb();

  const chat = {
    MessageID: "M" + Date.now(),
    ThreadID: payload.ThreadID || `${payload.StudentUserID}-${payload.SenderUserID}`,
    SenderUserID: payload.SenderUserID,
    ReceiverUserID: payload.ReceiverUserID,
    StudentUserID: payload.StudentUserID,
    MessageText: payload.MessageText || "",
    FileName: payload.FileName || "",
    FileURL: payload.FileURL || "",
    IsRead: "FALSE",
    CreatedAt: new Date().toISOString()
  };

  db.chatMessages.push(chat);
  writeDb(db);
  res.json({ success: true, chatMessage: chat });
});

// Mark Chat Read
app.post("/api/markChatRead", (req, res) => {
  const { threadId, userId } = req.body;
  const db = readDb();

  db.chatMessages.forEach((m: any) => {
    if (m.ThreadID === threadId && m.ReceiverUserID === userId) {
      m.IsRead = "TRUE";
    }
  });

  writeDb(db);
  res.json({ success: true });
});

// Upload Evidence (Creates a mock link and adds record)
app.post("/api/uploadEvidence", (req, res) => {
  const { base64Data, fileName, mimeType, metadata } = req.body;
  const db = readDb();

  const evidenceId = "E" + Date.now();
  const fileUrl = `https://drive.google.com/file/d/mock-${evidenceId}`;
  
  const newEvidence = {
    EvidenceID: evidenceId,
    StudentUserID: metadata.StudentUserID || "U004",
    RelatedRecordID: metadata.RelatedRecordID || "",
    RelatedSection: metadata.RelatedSection || "",
    FileName: fileName || "evidence.pdf",
    FileURL: fileUrl,
    FileID: `mock-id-${evidenceId}`,
    MimeType: mimeType || "application/pdf",
    UploadedBy: metadata.UploadedBy || "U004",
    UploadedAt: new Date().toISOString(),
    Description: metadata.Description || "Uploaded supporting document"
  };

  db.evidence.push(newEvidence);
  writeDb(db);

  res.json({ success: true, evidence: newEvidence });
});

// Save Advisor Comment
app.post("/api/saveAdvisorComment", (req, res) => {
  const payload = req.body;
  const db = readDb();

  const commentID = payload.CommentID || "C" + Date.now();
  const newComment = {
    CommentID: commentID,
    StudentUserID: payload.StudentUserID,
    AdvisorUserID: payload.AdvisorUserID,
    ReviewYear: payload.ReviewYear || new Date().getFullYear().toString(),
    CommentText: payload.CommentText || "",
    Recommendation: payload.Recommendation || "",
    Status: payload.Status || "Submitted",
    CreatedAt: payload.CreatedAt || new Date().toISOString(),
    UpdatedAt: new Date().toISOString()
  };

  const idx = db.advisorComments.findIndex((c: any) => c.CommentID === payload.CommentID);
  if (idx !== -1) {
    db.advisorComments[idx] = newComment;
  } else {
    db.advisorComments.push(newComment);
  }

  writeDb(db);
  res.json({ success: true, comment: newComment });
});

// Save Endorsement
app.post("/api/saveEndorsement", (req, res) => {
  const payload = req.body;
  const db = readDb();

  const endID = payload.EndorsementID || "E" + Date.now();
  const newEndorsement = {
    EndorsementID: endID,
    StudentUserID: payload.StudentUserID,
    Role: payload.Role || "Major Advisor",
    AdvisorUserID: payload.AdvisorUserID,
    AdvisorName: payload.AdvisorName || "",
    SignatureText: payload.SignatureText || "",
    SignatureDate: payload.SignatureDate || new Date().toISOString().split("T")[0],
    Status: payload.Status || "Endorsed",
    CreatedAt: payload.CreatedAt || new Date().toISOString(),
    UpdatedAt: new Date().toISOString()
  };

  const idx = db.endorsements.findIndex(
    (e: any) => e.StudentUserID === payload.StudentUserID && e.Role === payload.Role
  );
  if (idx !== -1) {
    db.endorsements[idx] = newEndorsement;
  } else {
    db.endorsements.push(newEndorsement);
  }

  writeDb(db);
  res.json({ success: true, endorsement: newEndorsement });
});

// Save User (Admin Management)
app.post("/api/saveUser", (req, res) => {
  const payload = req.body;
  const db = readDb();

  const userID = payload.UserID || "U" + Date.now();
  const newUser = {
    UserID: userID,
    Email: payload.Email,
    Password: payload.Password || "1234",
    Role: payload.Role || "Student",
    Prefix: payload.Prefix || "",
    FirstName: payload.FirstName || "",
    LastName: payload.LastName || "",
    FullName: `${payload.Prefix || ""} ${payload.FirstName || ""} ${payload.LastName || ""}`.trim(),
    StudentID: payload.StudentID || "",
    Program: payload.Program || "",
    Faculty: payload.Faculty || "",
    University: payload.University || "",
    AdmissionYear: payload.AdmissionYear || "",
    ExpectedGraduationYear: payload.ExpectedGraduationYear || "",
    MajorAdvisorID: payload.MajorAdvisorID || "",
    CoAdvisorIDs: payload.CoAdvisorIDs || "",
    Position: payload.Position || "",
    Affiliation: payload.Affiliation || "",
    Phone: payload.Phone || "",
    LineID: payload.LineID || "",
    ResearchInterests: payload.ResearchInterests || "",
    ORCID: payload.ORCID || "",
    PhotoURL: payload.PhotoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(payload.FirstName || "Student")}`,
    Status: payload.Status || "Active",
    CreatedAt: payload.CreatedAt || new Date().toISOString(),
    UpdatedAt: new Date().toISOString()
  };

  const idx = db.users.findIndex((u: any) => u.UserID === payload.UserID);
  if (idx !== -1) {
    // Preserve password if not updated or provided
    if (!payload.Password) {
      newUser.Password = db.users[idx].Password;
    }
    db.users[idx] = newUser;
  } else {
    db.users.push(newUser);
  }

  writeDb(db);
  res.json({ success: true, user: newUser, users: db.users.map(({ Password, ...u }) => u) });
});

// Save Settings
app.post("/api/saveSettings", (req, res) => {
  const settingsList = req.body; // Array of settings
  const db = readDb();

  settingsList.forEach((incoming: any) => {
    const idx = db.settings.findIndex((s: any) => s.SettingKey === incoming.SettingKey);
    if (idx !== -1) {
      db.settings[idx].SettingValue = incoming.SettingValue;
      db.settings[idx].UpdatedAt = new Date().toISOString();
    }
  });

  writeDb(db);
  res.json({ success: true, settings: db.settings });
});

// Get Spreadsheet Mock URL
app.get("/api/getSpreadsheetUrl", (req, res) => {
  res.json({
    url: "https://docs.google.com/spreadsheets/d/1gas-demo-spreadsheet-id",
    folderUrl: "https://drive.google.com/drive/folders/1gas-demo-drive-folder-id"
  });
});


// Serve files in production/development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
