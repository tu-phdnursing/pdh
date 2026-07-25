export interface SectionConfig {
  number: number;
  title: string;
  subsections: {
    number: number;
    title: string;
    fields: {
      key: string;
      label: string;
      type: "text" | "textarea" | "date" | "number" | "select";
      options?: string[];
      placeholder?: string;
    }[];
  }[];
}

export const SECTIONS_CONFIG: SectionConfig[] = [
  {
    number: 1,
    title: "Student Profile",
    subsections: [
      {
        number: 1.1,
        title: "Personal Information",
        fields: [
          { key: "Prefix", label: "Prefix", type: "text", placeholder: "e.g., Mrs., Miss, Mr., Dr." },
          { key: "FirstName", label: "First Name", type: "text" },
          { key: "LastName", label: "Last Name", type: "text" },
          { key: "Phone", label: "Phone", type: "text", placeholder: "e.g., 0812345678" },
          { key: "LineID", label: "Line ID", type: "text" },
          { key: "ORCID", label: "ORCID iD", type: "text", placeholder: "e.g., 0000-0001-XXXX-XXXX" }
        ]
      },
      {
        number: 1.2,
        title: "Academic Background",
        fields: [
          { key: "Field1", label: "Degree Earned", type: "text", placeholder: "e.g., Master of Science in Nursing" },
          { key: "Field2", label: "Institution", type: "text" },
          { key: "Field3", label: "Graduation Year", type: "text" },
          { key: "Field4", label: "GPA or Honors", type: "text" },
          { key: "LongText", label: "Thesis Title / Academic Achievements", type: "textarea" }
        ]
      },
      {
        number: 1.3,
        title: "Professional Background",
        fields: [
          { key: "Field1", label: "Job Title", type: "text", placeholder: "e.g., Registered Nurse, Lecturer" },
          { key: "Field2", label: "Organization / Affiliation", type: "text" },
          { key: "Field3", label: "Start Year", type: "text" },
          { key: "Field4", label: "End Year", type: "text", placeholder: "Present / Year" },
          { key: "LongText", label: "Key Responsibilities & Clinical Specializations", type: "textarea" }
        ]
      },
      {
        number: 1.4,
        title: "Goals for Doctoral Study",
        fields: [
          { key: "LongText", label: "What do you hope to accomplish during and after your doctoral study?", type: "textarea" }
        ]
      }
    ]
  },
  {
    number: 2,
    title: "Program of Study and Academic Milestones",
    subsections: [
      {
        number: 2.1,
        title: "Planned Program of Study",
        fields: [
          { key: "Field1", label: "Study Plan Scheme", type: "select", options: ["Scheme 1.1 (Research Only)", "Scheme 1.2 (Research + Coursework)", "Scheme 2.1", "Scheme 2.2"] },
          { key: "Field2", label: "Program Track", type: "text", placeholder: "e.g., International Track, Thai Track" },
          { key: "LongText", label: "General Course Plan & Dissertation Goals", type: "textarea" }
        ]
      },
      {
        number: 2.2,
        title: "Doctoral Milestones and Timeline",
        fields: [
          { key: "Field1", label: "Milestone Name", type: "select", options: ["Qualifying Exam", "Proposal Defense", "Ethics Clearance", "Progress Defense", "Dissertation Defense", "English Threshold Pass"] },
          { key: "Field2", label: "Target Completion Sem/Year", type: "text", placeholder: "e.g., Semester 1/2026" },
          { key: "Field3", label: "Status", type: "select", options: ["Not Started", "In Progress", "Completed", "Delayed"] },
          { key: "LongText", label: "Progress Details & Remarks", type: "textarea" }
        ]
      },
      {
        number: 2.3,
        title: "Personal Learning and Development Plan",
        fields: [
          { key: "LongText", label: "Describe your personal developmental milestones and self-learning objectives", type: "textarea" }
        ]
      }
    ]
  },
  {
    number: 3,
    title: "English Language Proficiency Requirement",
    subsections: [
      {
        number: 3.1,
        title: "Record of English Language Test",
        fields: [
          { key: "Field1", label: "Test Type", type: "select", options: ["TOEFL ITP", "TOEFL iBT", "IELTS", "CU-TEP", "PSU-TEP"] },
          { key: "Field2", label: "Score Obtained", type: "text" },
          { key: "Field3", label: "Result Status", type: "select", options: ["Passed", "Failed", "Pending Result", "Not Met"] },
          { key: "Field4", label: "Date of Exam", type: "date" }
        ]
      },
      {
        number: 3.2,
        title: "English Development Activities",
        fields: [
          { key: "Field1", label: "Activity / Course Name", type: "text", placeholder: "e.g., Academic Writing Workshop" },
          { key: "Field2", label: "Organizer", type: "text" },
          { key: "Field3", label: "Duration / Hours", type: "text" },
          { key: "LongText", label: "Brief outline and outcomes", type: "textarea" }
        ]
      },
      {
        number: 3.3,
        title: "Reflection on English Development",
        fields: [
          { key: "LongText", label: "Reflect on how these activities helped improve your English language abilities for academic use", type: "textarea" }
        ]
      }
    ]
  },
  {
    number: 4,
    title: "Coursework and Academic Development",
    subsections: [
      {
        number: 4.1,
        title: "Courses Completed",
        fields: [
          { key: "Field1", label: "Course Code & Name", type: "text", placeholder: "e.g., NUR901 Advanced Nursing Research" },
          { key: "Field2", label: "Credits", type: "text" },
          { key: "Field3", label: "Grade", type: "text" },
          { key: "Field4", label: "Semester/Academic Year", type: "text" }
        ]
      },
      {
        number: 4.2,
        title: "Key Learning from Coursework",
        fields: [
          { key: "Field1", label: "Course Name", type: "text" },
          { key: "LongText", label: "Summarize major concepts mastered and how they inform your PhD dissertation topic", type: "textarea" }
        ]
      },
      {
        number: 4.3,
        title: "Workshops, Training, and Short Courses",
        fields: [
          { key: "Field1", label: "Workshop/Seminar Title", type: "text" },
          { key: "Field2", label: "Organizer", type: "text" },
          { key: "Field3", label: "Date", type: "date" },
          { key: "Field4", label: "Hours", type: "text" },
          { key: "LongText", label: "Certificate / Learning details", type: "textarea" }
        ]
      },
      {
        number: 4.4,
        title: "Certifications",
        fields: [
          { key: "Field1", label: "Certification Name", type: "text" },
          { key: "Field2", label: "Issuing Organization", type: "text" },
          { key: "Field3", label: "Issue Date", type: "date" },
          { key: "Field4", label: "Credential ID / URL", type: "text" }
        ]
      }
    ]
  },
  {
    number: 5,
    title: "Research Development and Dissertation Progress",
    subsections: [
      {
        number: 5.1,
        title: "Development of Research Topic",
        fields: [
          { key: "LongText", label: "Describe how your research ideas evolved from admission up to your current focus", type: "textarea" }
        ]
      },
      {
        number: 5.2,
        title: "Dissertation Information",
        fields: [
          { key: "Field1", label: "Working Title", type: "text" },
          { key: "Field2", label: "Current Progress Stage", type: "select", options: ["Drafting Chapter 1-3", "Proposal Approved", "Ethics Submission", "Data Collecting", "Data Analysis", "Drafting Dissertation", "Defense Approved"] },
          { key: "LongText", label: "Brief Background & Objectives overview", type: "textarea" }
        ]
      },
      {
        number: 5.3,
        title: "Dissertation Progress Record",
        fields: [
          { key: "Field1", label: "Chapter / Activity Name", type: "text", placeholder: "e.g., Chapter 2 Literature Review" },
          { key: "Field2", label: "Percentage Done", type: "text", placeholder: "e.g., 85%" },
          { key: "Field3", label: "Latest status update", type: "select", options: ["Drafting", "Under Review by Advisor", "Revision Needed", "Approved"] },
          { key: "LongText", label: "Tasks accomplished & remaining plans", type: "textarea" }
        ]
      },
      {
        number: 5.4,
        title: "Meetings with Advisor / Committee",
        fields: [
          { key: "Field1", label: "Meeting Date", type: "date" },
          { key: "Field2", label: "Main Topic discussed", type: "text" },
          { key: "Field3", label: "Meeting Duration (Hours)", type: "text" },
          { key: "LongText", label: "Key comments, guidance, and agreed action items", type: "textarea" }
        ]
      },
      {
        number: 5.5,
        title: "Ethics and Research Governance",
        fields: [
          { key: "Field1", label: "Ethics Committee Name", type: "text" },
          { key: "Field2", label: "Application Date", type: "date" },
          { key: "Field3", label: "Approval Date (if applicable)", type: "date" },
          { key: "Field4", label: "Ethics Approval Number", type: "text" },
          { key: "LongText", label: "Ethics observations or challenges", type: "textarea" }
        ]
      },
      {
        number: 5.6,
        title: "Challenges Encountered and Solutions",
        fields: [
          { key: "Field1", label: "Problem category", type: "select", options: ["Recruitment", "Technical/App issues", "Data quality", "Time limits", "Budget", "Other"] },
          { key: "LongText", label: "Describe the specific challenge and what solutions were formulated", type: "textarea" }
        ]
      }
    ]
  },
  {
    number: 6,
    title: "Research Experience Requirement",
    subsections: [
      {
        number: 6.1,
        title: "Record of Research Experience Hours",
        fields: [
          { key: "Field1", label: "Research Activity", type: "text", placeholder: "e.g., Literature Search, RA Assistantship" },
          { key: "Field2", label: "Advisor/Supervisor verifying", type: "text" },
          { key: "Field3", label: "Hours logged", type: "number" },
          { key: "Field4", label: "Date of activity", type: "date" },
          { key: "LongText", label: "Work description and skills practiced", type: "textarea" }
        ]
      },
      {
        number: 6.2,
        title: "Reflection on Research Experience",
        fields: [
          { key: "LongText", label: "Reflect on how these research experience hours contributed to your development as a PhD student", type: "textarea" }
        ]
      }
    ]
  },
  {
    number: 7,
    title: "Scholarly Output",
    subsections: [
      {
        number: 7.1,
        title: "Conference Presentations",
        fields: [
          { key: "Field1", label: "Presentation Title", type: "text" },
          { key: "Field2", label: "Conference Name", type: "text" },
          { key: "Field3", label: "Date of Presentation", type: "date" },
          { key: "Field4", label: "Format", type: "select", options: ["Oral Presentation", "Poster Presentation", "Invited Keynote"] },
          { key: "Field5", label: "Location / Country", type: "text" }
        ]
      },
      {
        number: 7.2,
        title: "Publications",
        fields: [
          { key: "Field1", label: "Paper Title", type: "text" },
          { key: "Field2", label: "Journal Name", type: "text" },
          { key: "Field3", label: "Index/Database", type: "select", options: ["Scopus Q1", "Scopus Q2", "Scopus Q3/Q4", "TCI Tier 1", "TCI Tier 2", "Other International"] },
          { key: "Field4", label: "Author Status", type: "select", options: ["First Author", "Co-Author", "Corresponding Author"] },
          { key: "Field5", label: "Publication Status", type: "select", options: ["Published", "Accepted / In Press", "Under Review", "Submitted"] },
          { key: "Field6", label: "Volume, Issue, Year", type: "text" }
        ]
      },
      {
        number: 7.3,
        title: "Manuscripts in Preparation",
        fields: [
          { key: "Field1", label: "Draft Paper Title", type: "text" },
          { key: "Field2", label: "Target Journal", type: "text" },
          { key: "Field3", label: "Estimated Submission Date", type: "date" },
          { key: "LongText", label: "Current outline / status notes", type: "textarea" }
        ]
      },
      {
        number: 7.4,
        title: "Research Grants and Funding",
        fields: [
          { key: "Field1", label: "Grant Project Title", type: "text" },
          { key: "Field2", label: "Funding Agency", type: "text" },
          { key: "Field3", label: "Amount Received (Baht)", type: "text" },
          { key: "Field4", label: "Role", type: "select", options: ["Principal Investigator", "Co-Investigator", "PhD Grant Recipient"] }
        ]
      },
      {
        number: 7.5,
        title: "Awards and Recognition",
        fields: [
          { key: "Field1", label: "Award Name", type: "text" },
          { key: "Field2", label: "Awarding Body", type: "text" },
          { key: "Field3", label: "Date Awarded", type: "date" },
          { key: "LongText", label: "Brief description of achievements recognized", type: "textarea" }
        ]
      }
    ]
  },
  {
    number: 8,
    title: "Teaching, Mentoring, and Academic Service",
    subsections: [
      {
        number: 8.1,
        title: "Teaching Experience During PhD",
        fields: [
          { key: "Field1", label: "Course Taught", type: "text" },
          { key: "Field2", label: "Level", type: "select", options: ["Bachelor's Degree", "Master's Degree", "Training Workshop"] },
          { key: "Field3", label: "Your Role", type: "select", options: ["Co-Lecturer", "Teaching Assistant", "Guest Speaker", "Lab Supervisor"] },
          { key: "Field4", label: "Hours taught", type: "text" }
        ]
      },
      {
        number: 8.2,
        title: "Student Supervision or Mentoring",
        fields: [
          { key: "Field1", label: "Mentee Name / Group", type: "text" },
          { key: "Field2", label: "Project Title", type: "text" },
          { key: "LongText", label: "Brief mentorship description & outcome", type: "textarea" }
        ]
      },
      {
        number: 8.3,
        title: "Academic and Professional Service",
        fields: [
          { key: "Field1", label: "Service / Event Name", type: "text" },
          { key: "Field2", label: "Your Role", type: "text" },
          { key: "Field3", label: "Date Range", type: "text" },
          { key: "LongText", label: "Service contribution details", type: "textarea" }
        ]
      }
    ]
  },
  {
    number: 9,
    title: "Professional Development and Leadership",
    subsections: [
      {
        number: 9.1,
        title: "Leadership Experiences",
        fields: [
          { key: "Field1", label: "Leadership Position/Role", type: "text" },
          { key: "Field2", label: "Organization/Context", type: "text" },
          { key: "LongText", label: "Outline of actions taken and skills built", type: "textarea" }
        ]
      },
      {
        number: 9.2,
        title: "Professional Networking and Collaboration",
        fields: [
          { key: "Field1", label: "Organization / Partner Institution", type: "text" },
          { key: "LongText", label: "Describe collaboration activities (joint research, study visits, seminars)", type: "textarea" }
        ]
      },
      {
        number: 9.3,
        title: "Communication and Dissemination Skills",
        fields: [
          { key: "LongText", label: "Describe your efforts to communicate your nursing research findings to standard communities or clinical staff", type: "textarea" }
        ]
      }
    ]
  },
  {
    number: 10,
    title: "Reflective Practice",
    subsections: [
      {
        number: 10.1,
        title: "Reflection on Academic Growth",
        fields: [
          { key: "LongText", label: "Reflect on how your theoretical insights and scholarly stance evolved this year", type: "textarea" }
        ]
      },
      {
        number: 10.2,
        title: "Reflection on Research Identity",
        fields: [
          { key: "LongText", label: "How do you view yourself now as a nurse researcher? What is your scientific identity?", type: "textarea" }
        ]
      },
      {
        number: 10.3,
        title: "Reflection on Challenges and Resilience",
        fields: [
          { key: "LongText", label: "How did you manage difficulties, setbacks, or emotional stresses during your PhD journey?", type: "textarea" }
        ]
      },
      {
        number: 10.4,
        title: "Reflection on Transformation",
        fields: [
          { key: "LongText", label: "In what ways has this doctoral program changed your personal and professional values?", type: "textarea" }
        ]
      }
    ]
  },
  {
    number: 11,
    title: "Evidence and Supporting Documents",
    subsections: [
      {
        number: 11.1,
        title: "Upload Portfolio Supporting Materials",
        fields: [
          { key: "Field1", label: "File Description", type: "text", placeholder: "e.g., qualifying exam pass certificate" },
          { key: "Field2", label: "Associated Section", type: "select", options: ["Section 1 (Profile)", "Section 2 (Milestones)", "Section 3 (English)", "Section 4 (Coursework)", "Section 5 (Dissertation)", "Section 6 (Hours)", "Section 7 (Scholarly)", "Section 8 (Service)", "Section 9 (Leadership)", "Section 10 (Reflections)"] }
        ]
      }
    ]
  },
  {
    number: 12,
    title: "Self-Assessment of Doctoral Competencies",
    subsections: [
      {
        number: 12.1,
        title: "Annual Competency Self-Evaluation",
        fields: [
          { key: "Field1", label: "Select Competency Type", type: "select", options: [
            "Advanced disciplinary knowledge",
            "Critical analysis and synthesis",
            "Research design and methodology",
            "Data analysis",
            "Academic writing",
            "English communication for academic purposes",
            "Scholarly presentation",
            "Teaching ability",
            "Leadership",
            "Ethical conduct in research",
            "Professionalism",
            "Collaboration and networking",
            "Lifelong learning and self-development"
          ]},
          { key: "Field2", label: "Level", type: "select", options: ["Beginning", "Developing", "Competent", "Proficient"] },
          { key: "LongText", label: "Evidence, achievements, and remarks verifying this rating", type: "textarea" }
        ]
      }
    ]
  },
  {
    number: 13,
    title: "Annual Review Summary",
    subsections: [
      {
        number: 13.1,
        title: "Achievements During the Review Period",
        fields: [
          { key: "LongText", label: "Summarize your key achievements of this year", type: "textarea" }
        ]
      },
      {
        number: 13.2,
        title: "Areas of Improvement",
        fields: [
          { key: "LongText", label: "Identify skills, coursework or language barriers you need to improve next year", type: "textarea" }
        ]
      },
      {
        number: 13.3,
        title: "Action Plan for the Next Review Period",
        fields: [
          { key: "LongText", label: "Set concrete goals and timelines for the next 12 months", type: "textarea" }
        ]
      }
    ]
  },
  {
    number: 14,
    title: "Future Career Plan",
    subsections: [
      {
        number: 14.1,
        title: "Short-Term Career Goals",
        fields: [
          { key: "LongText", label: "Goals immediately post-graduation (0-2 years)", type: "textarea" }
        ]
      },
      {
        number: 14.2,
        title: "Long-Term Career Aspirations",
        fields: [
          { key: "LongText", label: "Career expectations (3-10 years post-graduation)", type: "textarea" }
        ]
      },
      {
        number: 14.3,
        title: "Preparation Needed for Future Goals",
        fields: [
          { key: "LongText", label: "Explain the post-doctoral networks, certificates, or fellowship training required", type: "textarea" }
        ]
      }
    ]
  }
];

export const COMPETENCIES = [
  "Advanced disciplinary knowledge",
  "Critical analysis and synthesis",
  "Research design and methodology",
  "Data analysis",
  "Academic writing",
  "English communication for academic purposes",
  "Scholarly presentation",
  "Teaching ability",
  "Leadership",
  "Ethical conduct in research",
  "Professionalism",
  "Collaboration and networking",
  "Lifelong learning and self-development"
];
