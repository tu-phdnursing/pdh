export type UserRole = "Admin" | "Advisor" | "CoAdvisor" | "Student";

export interface User {
  UserID: string;
  Email: string;
  Role: UserRole;
  Prefix: string;
  FirstName: string;
  LastName: string;
  FullName: string;
  StudentID: string;
  Program: string;
  Faculty: string;
  University: string;
  AdmissionYear: string;
  ExpectedGraduationYear: string;
  MajorAdvisorID: string;
  CoAdvisorIDs: string;
  Position: string;
  Affiliation: string;
  Phone: string;
  LineID: string;
  ResearchInterests: string;
  ORCID: string;
  PhotoURL: string;
  Status: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface PortfolioRecord {
  RecordID: string;
  StudentUserID: string;
  SectionNo: number;
  SectionTitle: string;
  SubsectionNo: number;
  SubsectionTitle: string;
  RecordType: string;
  Field1: string;
  Field2: string;
  Field3: string;
  Field4: string;
  Field5: string;
  Field6: string;
  Field7: string;
  LongText: string;
  Status: string;
  EvidenceIDs: string;
  CreatedBy: string;
  CreatedAt: string;
  UpdatedBy: string;
  UpdatedAt: string;
}

export interface StudentProfile {
  ProfileID: string;
  StudentUserID: string;
  FullName: string;
  ContactInformation: string;
  CurrentPositionAffiliation: string;
  ResearchInterests: string;
  ORCID: string;
  GoalsForDoctoralStudy: string;
  DevelopmentPlan: string;
  EnglishReflection: string;
  ResearchExperienceReflection: string;
  NetworkingReflection: string;
  CommunicationReflection: string;
  AcademicGrowthReflection: string;
  ResearchIdentityReflection: string;
  ChallengesReflection: string;
  TransformationReflection: string;
  ShortTermCareerGoals: string;
  LongTermCareerAspirations: string;
  PreparationNeeded: string;
  UpdatedAt: string;
  UpdatedBy: string;
}

export interface Dissertation {
  DissertationID: string;
  StudentUserID: string;
  TopicDevelopment: string;
  Title: string;
  BackgroundSignificance: string;
  ResearchProblem: string;
  Objectives: string;
  ResearchQuestionsHypotheses: string;
  ConceptualFramework: string;
  MethodologyOverview: string;
  EthicsApplicationDate: string;
  EthicsApprovalDate: string;
  ApprovalNumber: string;
  Amendments: string;
  DataManagementNotes: string;
  ChallengesSolutions: string;
  UpdatedAt: string;
  UpdatedBy: string;
}

export interface ResearchHour {
  HourID: string;
  StudentUserID: string;
  Date: string;
  ResearchActivity: string;
  WorkDescription: string;
  Hours: number;
  SupervisorAdvisor: string;
  EvidenceIDs: string;
  CreatedBy: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface CompetencyAssessment {
  AssessmentID: string;
  StudentUserID: string;
  Competency: string;
  Level: "Beginning" | "Developing" | "Competent" | "Proficient";
  EvidenceRemarks: string;
  ReviewYear: string;
  CreatedBy: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface AdvisorComment {
  CommentID: string;
  StudentUserID: string;
  AdvisorUserID: string;
  ReviewYear: string;
  CommentText: string;
  Recommendation: string;
  Status: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface Endorsement {
  EndorsementID: string;
  StudentUserID: string;
  Role: string;
  AdvisorUserID: string;
  AdvisorName: string;
  SignatureText: string;
  SignatureDate: string;
  Status: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface Evidence {
  EvidenceID: string;
  StudentUserID: string;
  RelatedRecordID: string;
  RelatedSection: string;
  FileName: string;
  FileURL: string;
  FileID: string;
  MimeType: string;
  UploadedBy: string;
  UploadedAt: string;
  Description: string;
}

export interface Notification {
  NotificationID: string;
  SenderUserID: string;
  ReceiverUserID: string;
  Title: string;
  Message: string;
  FileName: string;
  FileURL: string;
  IsRead: string;
  CreatedAt: string;
  ReadAt: string;
}

export interface ChatMessage {
  MessageID: string;
  ThreadID: string;
  SenderUserID: string;
  ReceiverUserID: string;
  StudentUserID: string;
  MessageText: string;
  FileName: string;
  FileURL: string;
  IsRead: string;
  CreatedAt: string;
}

export interface Setting {
  SettingKey: string;
  SettingValue: string;
  Description: string;
  Example: string;
  Options: string;
  UpdatedAt: string;
  UpdatedBy: string;
}

export interface AppState {
  currentUser: User | null;
  data: {
    users: User[];
    portfolioRecords: PortfolioRecord[];
    studentProfiles: StudentProfile[];
    dissertations: Dissertation[];
    researchHours: ResearchHour[];
    competencyAssessments: CompetencyAssessment[];
    advisorComments: AdvisorComment[];
    endorsements: Endorsement[];
    evidence: Evidence[];
    notifications: Notification[];
    chatMessages: ChatMessage[];
    settings: Setting[];
  } | null;
  selectedStudentId: string | null;
  currentPage: string;
}
