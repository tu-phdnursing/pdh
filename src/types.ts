/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'STUDENT' | 'ADVISOR' | 'CO_ADVISOR' | 'SUPER_ADVISOR' | 'ADMIN';

export interface User {
  UserID: string;
  Email: string;
  FullName: string;
  Role: UserRole;
  StudentID?: string;
  Major?: string;
  Advisor?: string;
  CoAdvisor?: string;
  ThesisTitle?: string;
  LineID?: string;
  ORCID?: string;
  DateOfSubmission?: string;
  YearOfAdmission?: string;
  ResearchInterests?: string;
  ExpectedGraduationYear?: string;
  PhotoURL?: string;
  AdditionalPhotos?: string[];
  Password?: string;
}

export type CertStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Certificate {
  CertID: string;
  StudentID: string;
  Name: string;
  Date: string;
  Category: string;
  ImageURL: string;
  Status: CertStatus;
  ApprovedBy?: string;
  Feedback?: string;
}

export interface Activity {
  ActivityID: string;
  StudentID: string;
  Title: string;
  Date: string;
  Description: string;
  ImagesURL: (string | { name: string; url: string })[]; // Saved as JSON string in Google Sheet
  Status: CertStatus;
  ApprovedBy?: string;
  Feedback?: string;
}

export type OptionType = 'ADVISOR' | 'CO_ADVISOR' | 'CERT_CATEGORY' | 'DEGREE' | 'COURSE' | 'COURSE_SET' | 'SEMESTER' | 'ProgressActivity' | string;

export interface ConfigOption {
  id: string;
  OptionType: OptionType;
  OptionValue: string;
  OptionDescription?: string;
}

export interface ActivityLog {
  LogID: string;
  Timestamp: string;
  Action: string;
  UserID: string;
  Details: string;
}

// Complete rich schema reflecting the TU Nursing PhD Portfolio screenshots
export interface StudentPortfolioData {
  academicBackground: { degree: string; field: string; institution: string; year: string }[];
  professionalBackground: { period: string; role: string; remarks: string }[];
  programOfStudyName?: string;
  programCourses?: { semester: string; code: string; title: string; credits: string; status: 'Not Started' | 'In Progress' | 'Completed' }[];
  learningPlans?: { competency: string; description: string; targetDate: string; status: 'Not Started' | 'In Progress' | 'Completed'; activities: string }[];
  milestones: { key: string; label: string; plannedDate: string; actualDate: string; remarks: string; status: 'Not Started' | 'In Progress' | 'Completed' }[];
  englishTest: { testName: string; dateTaken: string; scoreAchieved: string; requiredScore: string; status: string; evidence: string };
  englishActivities: { date: string; activity: string; organizer: string; description: string; evidence: string }[];
  englishReflection: string;
  completedCourses: { code: string; title: string; semester: string; credits: string; grade: string }[];
  keyLearnings: { course: string; keyLearning: string; application: string }[];
  workshops: { date: string; title: string; organizer: string; role: string; keyLearning: string }[];
  dissertationInfo: { title: string; background: string; problem: string; objectives: string; hypotheses: string; conceptualFramework: string; methodology: string; researchTopic?: string };
  dissertationProgress: { activity: string; date: string; progress: string; obstacles?: string; evidence: any }[];
  advisorMeetings: { date: string; persons: string; issues: string; actionPoints: string }[];
  ethicsGovernance: { dateApplied: string; dateApproved: string; approvalNumber: string; amendments: string; confidentiality: string };
  researchExperience: { date: string; activity: string; description: string; hours: number; supervisor: string; evidence: string }[];
  researchReflection: string;
  conferencePresentations: { date: string; title: string; conference: string; type: string; venue: string }[];
  publications: { year: string; title: string; journal: string; status: string; doi: string }[];
  manuscripts: { title: string; journal: string; stage: string; plannedSubmission: string }[];
  grants: { title: string; source: string; role: string; amount: string; period: string }[];
  awards: { date: string; award: string; organizer: string; description: string }[];
  teachingExperiences: { semester: string; course: string; role: string; studentLevel: string; description: string }[];
  supervisions: { date: string; type: string; studentLevel: string; description: string }[];
  academicServices: { date: string; activity: string; role: string; organization: string }[];
  leaderships: { date: string; role: string; organization: string; responsibilities: string }[];
  competencySelfAssessment: { competency: string; rating: 'Beginning' | 'Developing' | 'Competent' | 'Proficient'; remarks: string }[];
  annualReview: { achievements: string; improvements: string; actionPlans: { goal: string; steps: string; timeline: string; support: string }[] };
  futureCareer: { shortTerm: string; longTerm: string; preparation: string };
  advisorComments: string;
  reflectionAcademicGrowth?: string;
  reflectionResearchIdentity?: string;
  reflectionChallengesResilience?: string;
  reflectionTransformation?: string;
  endorsements: { role: string; name: string; signatureDate: string }[];
  englishVerification?: {
    comments: string;
    name: string;
    signatureDate: string;
  };
  supportingFiles?: { name: string; url: string; title?: string; date?: string; description?: string }[];
}

export interface ChatMessage {
  MessageID: string;
  SenderID: string;
  SenderName: string;
  ReceiverID: string; // Target StudentID or Advisor UserID
  MessageText: string;
  Attachment?: string;
  AttachmentName?: string;
  Timestamp: string;
}

export interface Notification {
  NotificationID: string;
  SenderID: string;
  SenderName: string;
  ReceiverID: string; // Target StudentID or Advisor UserID
  Title: string;
  MessageText: string;
  Attachment?: string;
  AttachmentName?: string;
  Timestamp: string;
  IsRead: boolean;
}

