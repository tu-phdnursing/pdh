/**
 * Google Apps Script Web App for Thammasat University Nursing PhD Portfolio
 *
 * INSTRUCTIONS:
 * 1. Open Extensions > Apps Script in your Google Sheet.
 * 2. Replace all code in Code.gs with this script.
 * 3. Run the "setupDatabase" function once inside the Apps Script editor to create all sheets with columns and 5-6 sample rows!
 * 4. Deploy as a Web App:
 *    - Execute as: "Me" (your email)
 *    - Who has access: "Anyone"
 * 5. Copy the generated Web App URL and paste it into System Settings panel.
 */

function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById("1Sa9C7gbImdq5B-g131S6IdM7ITW4cPNvpXrf_eOkcGA");
  } catch (err) {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

function doGet(e) {
  var action = e.parameter.action;
  if (action === 'forgotPassword') {
    return handleForgotPassword(e.parameter.email);
  }
  if (action === 'registerEmail') {
    return handleRegisterEmail(e.parameter.email, e.parameter.password, e.parameter.name);
  }

  var type = e.parameter.type;
  var ss = getSpreadsheet();
  var sheet;
  var data = [];
  
  try {
    if (type === 'users') {
      sheet = getOrCreateSheet('Users');
      var rawUsers = getSheetDataAsJson(sheet);
      data = rawUsers.map(function(u) {
        if (u.AdditionalPhotos) {
          try {
            u.AdditionalPhotos = JSON.parse(u.AdditionalPhotos);
          } catch(e) {
            u.AdditionalPhotos = [];
          }
        } else {
          u.AdditionalPhotos = [];
        }
        return u;
      });
    } else if (type === 'certificates') {
      sheet = getOrCreateSheet('Certificates');
      data = getSheetDataAsJson(sheet);
    } else if (type === 'activities') {
      sheet = getOrCreateSheet('Activities');
      var raw = getSheetDataAsJson(sheet);
      data = raw.map(function(item) {
        if (item.ImagesURL) {
          try {
            item.ImagesURL = JSON.parse(item.ImagesURL);
          } catch(e) {
            item.ImagesURL = [];
          }
        } else {
          item.ImagesURL = [];
        }
        return item;
      });
    } else if (type === 'configOptions') {
      sheet = getOrCreateSheet('ConfigOptions');
      data = getSheetDataAsJson(sheet);
    } else if (type === 'chats') {
      sheet = getOrCreateSheet('Chats');
      data = getSheetDataAsJson(sheet);
    } else if (type === 'notifications') {
      sheet = getOrCreateSheet('Notifications');
      var raw = getSheetDataAsJson(sheet);
      data = raw.map(function(item) {
        item.IsRead = item.IsRead === 'true' || item.IsRead === true;
        return item;
      });
    } else if (type === 'portfolio') {
      var studentId = e.parameter.studentId;
      var portData = loadPortfolioFromSheets(studentId);
      return ContentService.createTextOutput(JSON.stringify(portData))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  var ss = getSpreadsheet();
  var response = { success: false };
  
  try {
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action;
    
    if (action === 'saveUser') {
      var sheet = getOrCreateSheet('Users');
      var usr = postData.user;
      if (usr && Array.isArray(usr.AdditionalPhotos)) {
        usr.AdditionalPhotos = JSON.stringify(usr.AdditionalPhotos);
      }
      upsertRow(sheet, 'UserID', usr);
      response.success = true;
    } else if (action === 'deleteUser') {
      var sheet = getOrCreateSheet('Users');
      deleteRow(sheet, 'UserID', postData.userId);
      response.success = true;
    } else if (action === 'saveCertificate') {
      var sheet = getOrCreateSheet('Certificates');
      upsertRow(sheet, 'CertID', postData.certificate);
      response.success = true;
    } else if (action === 'saveActivity') {
      var sheet = getOrCreateSheet('Activities');
      var act = postData.activity;
      if (Array.isArray(act.ImagesURL)) {
        act.ImagesURL = JSON.stringify(act.ImagesURL);
      }
      upsertRow(sheet, 'ActivityID', act);
      response.success = true;
    } else if (action === 'saveConfigOption') {
      var sheet = getOrCreateSheet('ConfigOptions');
      upsertRow(sheet, 'id', postData.config);
      response.success = true;
    } else if (action === 'deleteConfigOption') {
      var sheet = getOrCreateSheet('ConfigOptions');
      deleteRow(sheet, 'id', postData.id);
      response.success = true;
    } else if (action === 'savePortfolio') {
      savePortfolioToSheets(postData.studentId, postData.portfolio);
      response.success = true;
    } else if (action === 'saveChat') {
      var sheet = getOrCreateSheet('Chats');
      upsertRow(sheet, 'MessageID', postData.message);
      response.success = true;
    } else if (action === 'saveNotification') {
      var sheet = getOrCreateSheet('Notifications');
      var notif = postData.notification;
      notif.IsRead = String(notif.IsRead);
      upsertRow(sheet, 'NotificationID', notif);
      response.success = true;
    } else if (action === 'logActivity') {
      var sheet = getOrCreateSheet('ActivityLogs');
      sheet.appendRow([
        postData.log.LogID,
        postData.log.Timestamp,
        postData.log.Action,
        postData.log.UserID,
        postData.log.Details
      ]);
      response.success = true;
    } else if (action === 'uploadFile') {
      var studentId = postData.studentId || "";
      var studentName = postData.studentName || "Student";
      var uploaderId = postData.uploaderId || "";
      var uploaderRole = (postData.uploaderRole || "").toUpperCase();
      var filename = postData.filename || postData.fileName || "file";
      var mimeType = postData.mimeType || "application/octet-stream";
      var base64Data = postData.base64Data || postData.fileData;
      
      if (!base64Data) {
        throw new Error("Missing file data (base64Data)");
      }
      
      // 1. Get or create root folder (using the specific Google Drive ID)
      var birdFolder;
      try {
        birdFolder = DriveApp.getFolderById("1dScQeS37WRB0tn6zH5uM1zjZj4M0bTHA");
      } catch (err) {
        var rootFolders = DriveApp.getFoldersByName("Bird");
        if (rootFolders.hasNext()) {
          birdFolder = rootFolders.next();
        } else {
          birdFolder = DriveApp.createFolder("Bird");
          birdFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        }
      }
      
      // 2. Get or create student subfolder: "StudentID_StudentName"
      var folderName = (studentId ? studentId : "Unknown") + "_" + studentName;
      var studentFolder = getOrCreateFolder(birdFolder, folderName);
      
      // 3. Compute final filename based on specified uploader role rules
      var finalFileName = "";
      if (uploaderRole === 'STUDENT') {
        finalFileName = studentId + "_" + filename;
      } else if (uploaderRole === 'ADVISOR' || uploaderRole === 'CO_ADVISOR') {
        if (!studentId) {
          finalFileName = uploaderId + "_" + filename; // Broadcast mode
        } else {
          finalFileName = uploaderId + "_" + studentId + "_" + filename;
        }
      } else {
        finalFileName = uploaderId + "_" + (studentId ? studentId + "_" : "") + filename;
      }
      
      // 4. Save file to Google Drive and grant view access
      var decodedBytes = Utilities.base64Decode(base64Data);
      var blob = Utilities.newBlob(decodedBytes, mimeType, finalFileName);
      var file = studentFolder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      response.success = true;
      response.fileUrl = "https://lh3.googleusercontent.com/d/" + file.getId();
      response.fileName = finalFileName;
    }
    
  } catch(err) {
    response.error = err.toString();
  }
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateFolder(parent, folderName) {
  var folders = parent.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    var folder = parent.createFolder(folderName);
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return folder;
  }
}

function getOrCreateSheet(sheetName) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    var schemas = {
      "Users": ["UserID", "Email", "FullName", "Role", "StudentID", "Major", "Advisor", "CoAdvisor", "ThesisTitle", "LineID", "DateOfSubmission", "ResearchInterests", "ExpectedGraduationYear", "YearOfAdmission", "PhotoURL", "AdditionalPhotos", "Password"],
      "Certificates": ["CertID", "StudentID", "Name", "Date", "Category", "ImageURL", "Status", "ApprovedBy", "Feedback"],
      "Activities": ["ActivityID", "StudentID", "Title", "Date", "Description", "ImagesURL", "Status", "ApprovedBy", "Feedback"],
      "ConfigOptions": ["id", "OptionType", "OptionValue"],
      "ActivityLogs": ["LogID", "Timestamp", "Action", "UserID", "Details"],
      "Chats": ["MessageID", "SenderID", "SenderName", "ReceiverID", "MessageText", "Timestamp", "Attachment", "AttachmentName"],
      "Notifications": ["NotificationID", "SenderID", "SenderName", "ReceiverID", "Title", "MessageText", "Timestamp", "IsRead"],
      "P1_StudentProfile": ["StudentID", "RecordType", "Degree", "Field", "Institution", "Year", "Period", "Role", "Remarks", "LastUpdated"],
      "P2_Milestones": ["StudentID", "MilestoneKey", "MilestoneLabel_CourseTitle_Competency", "PlannedDate_Semester_TargetDate", "ActualDate_CourseCode_Activities", "Remarks_Credits_Description", "Status", "LastUpdated"],
      "P3_EnglishLanguage": ["StudentID", "RecordType", "TestName", "DateTaken", "ScoreAchieved", "RequiredScore", "TestStatus", "TestEvidence", "ActivityDate", "ActivityName", "ActivityOrganizer", "ActivityDescription", "ActivityEvidence", "EnglishReflection", "VerificationComments", "VerificationName", "VerificationDate", "LastUpdated"],
      "P4_Coursework": ["StudentID", "RecordType", "CourseCode", "CourseTitle", "Semester", "Credits", "Grade", "WorkshopDate", "WorkshopTitle", "WorkshopOrganizer", "WorkshopRole", "WorkshopKeyLearning", "LastUpdated"],
      "P5_Dissertation": ["StudentID", "RecordType", "InfoTitle", "InfoBackground", "InfoProblem", "InfoObjectives", "InfoHypotheses", "InfoConceptualFramework", "InfoMethodology", "InfoResearchTopic", "ProgressActivity", "ProgressDate", "ProgressDetails", "ProgressEvidence", "MeetingDate", "MeetingPersons", "MeetingIssues", "MeetingActionPoints", "LastUpdated", "ProgressObstacles"],
      "P6_ResearchExperience": ["StudentID", "RecordType", "EthicsDateApplied", "EthicsDateApproved", "EthicsApprovalNumber", "EthicsAmendments", "EthicsConfidentiality", "ExperienceDate", "ExperienceActivity", "ExperienceDescription", "ExperienceHours", "ExperienceSupervisor", "ExperienceEvidence", "ResearchReflection", "LastUpdated"],
      "P7_ScholarlyOutput": ["StudentID", "RecordType", "ConfDate", "ConfTitle", "ConfName", "ConfType", "ConfVenue", "PubYear", "PubTitle", "PubJournal", "PubStatus", "PubDoi", "MscTitle", "MscJournal", "MscStage", "MscPlannedSubmission", "GrantTitle", "GrantSource", "GrantRole", "GrantAmount", "GrantPeriod", "AwardDate", "AwardName", "AwardOrganizer", "AwardDescription", "LastUpdated"],
      "P8_TeachingService": ["StudentID", "RecordType", "TeachSemester", "TeachCourse", "TeachRole", "TeachStudentLevel", "TeachDescription", "SupervisionDate", "SupervisionType", "SupervisionStudentLevel", "SupervisionDescription", "ServiceDate", "ServiceActivity", "ServiceRole", "ServiceOrganization", "LastUpdated"],
      "P9_LeadershipNetworking": ["StudentID", "LeadershipDate", "LeadershipRole", "LeadershipOrganization", "LeadershipResponsibilities", "LastUpdated"],
      "P10_ReflectivePractice": ["StudentID", "RecordType", "ReflectionCourse", "ReflectionKeyLearning", "ReflectionApplication", "ReflectionAcademicGrowth", "ReflectionResearchIdentity", "ReflectionChallengesResilience", "ReflectionTransformation", "LastUpdated"],
      "P11_SupportingEvidence": ["StudentID", "FileName", "FileUrl", "FileTitle", "FileDate", "FileDescription", "LastUpdated"],
      "P12_CompetencySelfAssessment": ["StudentID", "CompetencyName", "CompetencyRating", "CompetencyRemarks", "LastUpdated"],
      "P13_AnnualReview": ["StudentID", "RecordType", "ReviewAchievements", "ReviewImprovements", "Goal", "Steps", "Timeline", "Support", "LastUpdated"],
      "P14_FutureCareerPlan": ["StudentID", "ShortTermGoal", "LongTermGoal", "Preparation", "LastUpdated"],
      "P15_AdvisorFeedback": ["StudentID", "AdvisorComments", "LastUpdated"],
      "P16_AdvisorEndorsement": ["StudentID", "EndorsementRole", "EndorsementName", "EndorsementSignatureDate", "LastUpdated"]
    };
    var headers = schemas[sheetName] || ["StudentID", "LastUpdated"];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e0f2fe");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// SETUP DATABASE AND SEED ALL 16 SECTIONS WITH SCHEMA HEADERS
function setupDatabase() {
  var ss = getSpreadsheet();
  
  var schemas = {
    "Users": ["UserID", "Email", "FullName", "Role", "StudentID", "Major", "Advisor", "CoAdvisor", "ThesisTitle", "LineID", "DateOfSubmission", "ResearchInterests", "ExpectedGraduationYear", "YearOfAdmission", "PhotoURL", "AdditionalPhotos", "Password"],
    "Certificates": ["CertID", "StudentID", "Name", "Date", "Category", "ImageURL", "Status", "ApprovedBy", "Feedback"],
    "Activities": ["ActivityID", "StudentID", "Title", "Date", "Description", "ImagesURL", "Status", "ApprovedBy", "Feedback"],
    "ConfigOptions": ["id", "OptionType", "OptionValue"],
    "ActivityLogs": ["LogID", "Timestamp", "Action", "UserID", "Details"],
    "Chats": ["MessageID", "SenderID", "SenderName", "ReceiverID", "MessageText", "Timestamp", "Attachment", "AttachmentName"],
    "Notifications": ["NotificationID", "SenderID", "SenderName", "ReceiverID", "Title", "MessageText", "Timestamp", "IsRead"],
    "P1_StudentProfile": ["StudentID", "RecordType", "Degree", "Field", "Institution", "Year", "Period", "Role", "Remarks", "LastUpdated"],
    "P2_Milestones": ["StudentID", "MilestoneKey", "MilestoneLabel_CourseTitle_Competency", "PlannedDate_Semester_TargetDate", "ActualDate_CourseCode_Activities", "Remarks_Credits_Description", "Status", "LastUpdated"],
    "P3_EnglishLanguage": ["StudentID", "RecordType", "TestName", "DateTaken", "ScoreAchieved", "RequiredScore", "TestStatus", "TestEvidence", "ActivityDate", "ActivityName", "ActivityOrganizer", "ActivityDescription", "ActivityEvidence", "EnglishReflection", "VerificationComments", "VerificationName", "VerificationDate", "LastUpdated"],
    "P4_Coursework": ["StudentID", "RecordType", "CourseCode", "CourseTitle", "Semester", "Credits", "Grade", "WorkshopDate", "WorkshopTitle", "WorkshopOrganizer", "WorkshopRole", "WorkshopKeyLearning", "LastUpdated"],
    "P5_Dissertation": ["StudentID", "RecordType", "InfoTitle", "InfoBackground", "InfoProblem", "InfoObjectives", "InfoHypotheses", "InfoConceptualFramework", "InfoMethodology", "InfoResearchTopic", "ProgressActivity", "ProgressDate", "ProgressDetails", "ProgressEvidence", "MeetingDate", "MeetingPersons", "MeetingIssues", "MeetingActionPoints", "LastUpdated", "ProgressObstacles"],
    "P6_ResearchExperience": ["StudentID", "RecordType", "EthicsDateApplied", "EthicsDateApproved", "EthicsApprovalNumber", "EthicsAmendments", "EthicsConfidentiality", "ExperienceDate", "ExperienceActivity", "ExperienceDescription", "ExperienceHours", "ExperienceSupervisor", "ExperienceEvidence", "ResearchReflection", "LastUpdated"],
    "P7_ScholarlyOutput": ["StudentID", "RecordType", "ConfDate", "ConfTitle", "ConfName", "ConfType", "ConfVenue", "PubYear", "PubTitle", "PubJournal", "PubStatus", "PubDoi", "MscTitle", "MscJournal", "MscStage", "MscPlannedSubmission", "GrantTitle", "GrantSource", "GrantRole", "GrantAmount", "GrantPeriod", "AwardDate", "AwardName", "AwardOrganizer", "AwardDescription", "LastUpdated"],
    "P8_TeachingService": ["StudentID", "RecordType", "TeachSemester", "TeachCourse", "TeachRole", "TeachStudentLevel", "TeachDescription", "SupervisionDate", "SupervisionType", "SupervisionStudentLevel", "SupervisionDescription", "ServiceDate", "ServiceActivity", "ServiceRole", "ServiceOrganization", "LastUpdated"],
    "P9_LeadershipNetworking": ["StudentID", "LeadershipDate", "LeadershipRole", "LeadershipOrganization", "LeadershipResponsibilities", "LastUpdated"],
    "P10_ReflectivePractice": ["StudentID", "RecordType", "ReflectionCourse", "ReflectionKeyLearning", "ReflectionApplication", "ReflectionAcademicGrowth", "ReflectionResearchIdentity", "ReflectionChallengesResilience", "ReflectionTransformation", "LastUpdated"],
    "P11_SupportingEvidence": ["StudentID", "FileName", "FileUrl", "FileTitle", "FileDate", "FileDescription", "LastUpdated"],
    "P12_CompetencySelfAssessment": ["StudentID", "CompetencyName", "CompetencyRating", "CompetencyRemarks", "LastUpdated"],
    "P13_AnnualReview": ["StudentID", "RecordType", "ReviewAchievements", "ReviewImprovements", "Goal", "Steps", "Timeline", "Support", "LastUpdated"],
    "P14_FutureCareerPlan": ["StudentID", "ShortTermGoal", "LongTermGoal", "Preparation", "LastUpdated"],
    "P15_AdvisorFeedback": ["StudentID", "AdvisorComments", "LastUpdated"],
    "P16_AdvisorEndorsement": ["StudentID", "EndorsementRole", "EndorsementName", "EndorsementSignatureDate", "LastUpdated"]
  };
  
  for (var sheetName in schemas) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    sheet.getRange(1, 1, 1, schemas[sheetName].length).setValues([schemas[sheetName]]);
    sheet.getRange(1, 1, 1, schemas[sheetName].length).setFontWeight("bold").setBackground("#e0f2fe");
    sheet.setFrozenRows(1);
  }
  
  return "SUCCESS: Database schema created and 16 separate portfolio sheets initialized successfully with flat columns!";
}

function insertExampleData() {
  var ss = getSpreadsheet();
  var headersMap = {
    "Users": ["UserID", "Email", "FullName", "Role", "StudentID", "Major", "Advisor", "CoAdvisor", "ThesisTitle", "LineID", "DateOfSubmission", "ResearchInterests", "ExpectedGraduationYear", "YearOfAdmission", "PhotoURL", "AdditionalPhotos", "Password"],
    "Certificates": ["CertID", "StudentID", "Name", "Date", "Category", "ImageURL", "Status", "ApprovedBy", "Feedback"],
    "Activities": ["ActivityID", "StudentID", "Title", "Date", "Description", "ImagesURL", "Status", "ApprovedBy", "Feedback"],
    "ConfigOptions": ["id", "OptionType", "OptionValue"],
    "ActivityLogs": ["LogID", "Timestamp", "Action", "UserID", "Details"],
    "Chats": ["MessageID", "SenderID", "SenderName", "ReceiverID", "MessageText", "Timestamp", "Attachment", "AttachmentName"],
    "Notifications": ["NotificationID", "SenderID", "SenderName", "ReceiverID", "Title", "MessageText", "Timestamp", "IsRead"]
  };
  
  var usersSheet = ss.getSheetByName("Users");
  if (usersSheet.getLastRow() <= 1) {
    var sampleUsers = [
      {"UserID": "STUDENT-1", "Email": "student@tu.ac.th", "FullName": "นางสาวอรพรรณ แก้วดี (Miss Orapan Kaewdee)", "Role": "STUDENT", "StudentID": "6601010024", "Major": "Doctor of Philosophy Program in Nursing Science (International Program)", "Advisor": "รศ.ดร. นงลักษณ์ วิเศษศิลป์ (Assoc. Prof. Dr. Nonglak Wisetsilp)", "CoAdvisor": "รศ.ดร. วิภา ชัยชาญ (Assoc. Prof. Dr. Wipa Chaichan)", "ThesisTitle": "Efficacy of Mindfulness-Based Tele-Nursing Intervention on Quality of Life and Coping Strategies in Thai Post-Stroke Caregivers: A Randomized Controlled Trial", "LineID": "orapan.k", "DateOfSubmission": "May 10, 2026", "ResearchInterests": "Gerontological Nursing, Mindfulness-Based Therapy, Tele-rehabilitation", "ExpectedGraduationYear": "2027", "YearOfAdmission": "2024", "PhotoURL": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80", "AdditionalPhotos": "[]", "Password": "1234"},
      {"UserID": "STUDENT-2", "Email": "ananya.s@tu.ac.th", "FullName": "นางสาวอนัญญา สมใจ (Miss Ananya Somjai)", "Role": "STUDENT", "StudentID": "6601010032", "Major": "หลักสูตรปรัชญาดุษฎีบัณฑิต สาขาวิชาพยาบาลศาสตร์ (PhD in Nursing Science - Thai Program)", "Advisor": "รศ.ดร. นงลักษณ์ วิเศษศิลป์ (Assoc. Prof. Dr. Nonglak Wisetsilp)", "CoAdvisor": "ดร. กิตติศักดิ์ รัตนวิทย์ (Dr. Kittisak Rattanawit)", "ThesisTitle": "ปัจจัยที่มีอิทธิพลต่อความพร้อมในการดูแลตนเองของผู้ป่วยภาวะหัวใจล้มเหลวเฉียบพลันในชุมชน", "LineID": "ananya.sj", "DateOfSubmission": "June 1, 2026", "ResearchInterests": "Cardiology Nursing, Self-Care, Chronic Care", "ExpectedGraduationYear": "2027", "YearOfAdmission": "2024", "PhotoURL": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80", "AdditionalPhotos": "[]", "Password": "1234"},
      {"UserID": "STUDENT-3", "Email": "natthapon.p@tu.ac.th", "FullName": "นายณัฐพล พูนทรัพย์ (Mr. Natthapon Poonsap)", "Role": "STUDENT", "StudentID": "6501010011", "Major": "Doctor of Philosophy Program in Nursing Science (International Program)", "Advisor": "ศ.ดร. สร้อยอนุสาสน์ สุขดี (Prof. Dr. Soianusat Sukdee)", "CoAdvisor": "ผศ.ดร. รพีพรรณ เลิศสมบูรณ์ (Asst. Prof. Dr. Rapeepan Lertsomboon)", "ThesisTitle": "Interactive Mobile-Health Guided Pulmonary Rehabilitation for Elderly COPD Patients", "LineID": "natthapon.p", "DateOfSubmission": "April 15, 2026", "ResearchInterests": "COPD Care, Mobile Health, Respiratory Care", "ExpectedGraduationYear": "2026", "YearOfAdmission": "2023", "PhotoURL": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80", "AdditionalPhotos": "[]", "Password": "1234"},
      {"UserID": "ADVISOR-1", "Email": "advisor@tu.ac.th", "FullName": "รศ.ดร. นงลักษณ์ วิเศษศิลป์ (Assoc. Prof. Dr. Nonglak Wisetsilp)", "Role": "ADVISOR", "StudentID": "", "Major": "", "Advisor": "", "CoAdvisor": "", "ThesisTitle": "", "LineID": "", "DateOfSubmission": "", "ResearchInterests": "", "ExpectedGraduationYear": "", "YearOfAdmission": "", "PhotoURL": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80", "AdditionalPhotos": "[]", "Password": "1234"},
      {"UserID": "CO_ADVISOR-1", "Email": "peach@tu.ac.th", "FullName": "ผศ.ดร. พิชญ์ อรุณแสง (Asst. Prof. Dr. Peach Arunsang)", "Role": "ADVISOR", "StudentID": "", "Major": "", "Advisor": "", "CoAdvisor": "", "ThesisTitle": "", "LineID": "", "DateOfSubmission": "", "ResearchInterests": "", "ExpectedGraduationYear": "", "YearOfAdmission": "", "PhotoURL": "https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&w=300&q=80", "AdditionalPhotos": "[]", "Password": "1234"},
      {"UserID": "ADMIN-1", "Email": "admin@tu.ac.th", "FullName": "ผศ.ดร. สุขุม พิพัฒน์โชติ (Asst. Prof. Dr. Sukhum Pipatchot) - แอดมินระบบ", "Role": "ADMIN", "StudentID": "", "Major": "", "Advisor": "", "CoAdvisor": "", "ThesisTitle": "", "LineID": "", "DateOfSubmission": "", "ResearchInterests": "", "ExpectedGraduationYear": "", "YearOfAdmission": "", "PhotoURL": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80", "AdditionalPhotos": "[]", "Password": "1234"}
    ];
    for (var i = 0; i < sampleUsers.length; i++) {
      appendObjectAsRow(usersSheet, headersMap["Users"], sampleUsers[i]);
    }
  }

  var certSheet = ss.getSheetByName("Certificates");
  if (certSheet.getLastRow() <= 1) {
    var sampleCerts = [
      {"CertID": "CERT-001", "StudentID": "6601010024", "Name": "ใบประกาศนียบัตรผ่านการอบรมจริยธรรมการวิจัยในมนุษย์ (CITI Programme Course)", "Date": "2024-02-10", "Category": "อบรมจริยธรรมการวิจัยในมนุษย์ (Human Research Ethics Training)", "ImageURL": "https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80", "Status": "APPROVED", "ApprovedBy": "รศ.ดร. นงลักษณ์ วิเศษศิลป์ (Assoc. Prof. Dr. Nonglak Wisetsilp)", "Feedback": "เอกสารหลักฐานครบถ้วนและสมบูรณ์ ดีมาก"},
      {"CertID": "CERT-002", "StudentID": "6601010024", "Name": "เกียรติบัตรการนำเสนองานวิจัยดีเด่น Oral Presentation Award 2024 - Chiang Mai Nursing Forum", "Date": "2024-11-21", "Category": "รางวัลระดับชาติ/นานาชาติ (National/International Award)", "ImageURL": "https://images.unsplash.com/photo-1571171637578-41bc2dd4dcd2?auto=format&fit=crop&w=800&q=80", "Status": "APPROVED", "ApprovedBy": "รศ.ดร. นงลักษณ์ วิเศษศิลป์ (Assoc. Prof. Dr. Nonglak Wisetsilp)", "Feedback": "ยินดีด้วยกับการนำเสนอที่ดีเยี่ยม"},
      {"CertID": "CERT-003", "StudentID": "6601010024", "Name": "ใบประกาศร่วมอบรม Clinical Trial Management in Remote Nursing Sites", "Date": "2025-03-05", "Category": "อบรมวิชาการเฉพาะทาง (Specialized Training)", "ImageURL": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80", "Status": "PENDING", "ApprovedBy": "", "Feedback": ""},
      {"CertID": "CERT-004", "StudentID": "6601010032", "Name": "ใบประกาศผ่านหลักสูตรช่วยฟื้นคืนชีพขั้นสูง (Advanced Life Support)", "Date": "2024-05-12", "Category": "อบรมวิชาการเฉพาะทาง (Specialized Training)", "ImageURL": "https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80", "Status": "APPROVED", "ApprovedBy": "รศ.ดร. นงลักษณ์ วิเศษศิลป์", "Feedback": "หลักฐานถูกต้องครบถ้วน"},
      {"CertID": "CERT-005", "StudentID": "6501010011", "Name": "รางวัลชมเชยนวัตกรรมการพยาบาลจากสภาการพยาบาลแห่งชาติ", "Date": "2024-12-01", "Category": "รางวัลระดับชาติ/นานาชาติ (National/International Award)", "ImageURL": "https://images.unsplash.com/photo-1571171637578-41bc2dd4dcd2?auto=format&fit=crop&w=800&q=80", "Status": "APPROVED", "ApprovedBy": "ศ.ดร. สร้อยอนุสาสน์ สุขดี", "Feedback": "สร้างชื่อเสียงให้คณะและสถาบันดีมาก"},
      {"CertID": "CERT-006", "StudentID": "6601010024", "Name": "ใบสำคัญการแต่งตั้งคณะกรรมการจริยธรรมในมนุษย์ (IRB Approval Number 112/2568)", "Date": "2025-06-15", "Category": "อบรมจริยธรรมการวิจัยในมนุษย์ (Human Research Ethics Training)", "ImageURL": "https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80", "Status": "APPROVED", "ApprovedBy": "รศ.ดร. นงลักษณ์ วิเศษศิลป์", "Feedback": "เรียบร้อยดี สามารถลุยทำวิทยานิพนธ์ต่อได้เลย"}
    ];
    for (var i = 0; i < sampleCerts.length; i++) {
      appendObjectAsRow(certSheet, headersMap["Certificates"], sampleCerts[i]);
    }
  }

  var actSheet = ss.getSheetByName("Activities");
  if (actSheet.getLastRow() <= 1) {
    var sampleActs = [
      {"ActivityID": "ACT-001", "StudentID": "6601010024", "Title": "พรีเซนต์ความคืบหน้าหัวข้อวิทยานิพนธ์ประจำไตรมาสกับคณะที่ปรึกษา", "Date": "2025-04-10", "Description": "รายงานแผนการรับสมัครกลุ่มตัวอย่างผู้ดูแลผู้ป่วยโรคหลอดเลือดสมอง และการติดตั้งระบบระบบพยาบาลทางไกล (Tele-Nursing App)", "ImagesURL": '["https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&w=600&q=80"]', "Status": "APPROVED", "ApprovedBy": "รศ.ดร. นงลักษณ์ วิเศษศิลป์ (Assoc. Prof. Dr. Nonglak Wisetsilp)", "Feedback": "แนวทางการทำงานชัดเจน ติดตามกลุ่มผู้ดูแลอย่างใกล้ชิด"},
      {"ActivityID": "ACT-002", "StudentID": "6601010024", "Title": "จัดกิจกรรมกลุ่มแนะแนวพยาบาลวิชาชีพเพื่อเตรียมความพร้อมวิจัยในชุมชน", "Date": "2025-05-15", "Description": "ลงพื้นที่จัดอบรมทักษะสติ (Mindfulness) ร่วมกับบุคลากรทางการแพทย์ ณ รพ.สต. ปทุมธานี", "ImagesURL": '["https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80"]', "Status": "PENDING", "ApprovedBy": "", "Feedback": ""},
      {"ActivityID": "ACT-003", "StudentID": "6601010032", "Title": "ลงพื้นที่เก็บข้อมูลหัวใจล้มเหลวเฉียบพลัน ณ รพ.ปทุมธานี", "Date": "2025-02-18", "Description": "เก็บรวบรวมแบบประเมินผู้ป่วยที่จำหน่ายกลับบ้านจำนวน 15 คน", "ImagesURL": '["https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80"]', "Status": "APPROVED", "ApprovedBy": "รศ.ดร. นงลักษณ์ วิเศษศิลป์", "Feedback": "เก็บข้อมูลเรียบร้อยดีเยี่ยม"},
      {"ActivityID": "ACT-004", "StudentID": "6501010011", "Title": "ทดสอบระบบ Pulmonary Rehab App ร่วมกับทีมแพทย์โรงพยาบาลธรรมศาสตร์เฉลิมพระเกียรติ", "Date": "2025-01-20", "Description": "ทดสอบฟังก์ชันตรวจวัดปริมาตรปอดอัตโนมัติ", "ImagesURL": '["https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80"]', "Status": "APPROVED", "ApprovedBy": "ศ.ดร. สร้อยอนุสาสน์ สุขดี", "Feedback": "แอปพลิเคชันทำงานได้สมบูรณ์แบบมาก คอยตรวจสอบบั๊กต่อเนื่องด้วย"},
      {"ActivityID": "ACT-005", "StudentID": "6601010024", "Title": "เข้าร่วมสัมมนาระเบียบวิธีวิจัยขั้นสูงสำหรับพยาบาลดุษฎีบัณฑิต", "Date": "2025-06-02", "Description": "เรียนรู้เทคนิค Structural Equation Modeling และการใช้โปรแกรม AMOS เบื้องต้น", "ImagesURL": '["https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80"]', "Status": "APPROVED", "ApprovedBy": "รศ.ดร. นงลักษณ์ วิเศษศิลป์", "Feedback": "ดีมากที่ใฝ่รู้ศึกษาเทคนิคขั้นสูงต่อยอดวิทยานิพนธ์"},
      {"ActivityID": "ACT-006", "StudentID": "6601010024", "Title": "ประชุมกลุ่มย่อยร่วมกับผู้ร่วมวิจัยจาก Faculty of Nursing, University of Michigan", "Date": "2025-06-20", "Description": "หารือความเป็นไปได้ในการจัดทำ International Student Exchange program สำหรับการแลกเปลี่ยนวิชาการ", "ImagesURL": '["https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80"]', "Status": "APPROVED", "ApprovedBy": "รศ.ดร. นงลักษณ์ วิเศษศิลป์", "Feedback": "เป็นโอกาสที่ยอดเยี่ยมมาก ขอให้เตรียมความพร้อมด้านภาษาอังกฤษด้วย"}
    ];
    for (var i = 0; i < sampleActs.length; i++) {
      appendObjectAsRow(actSheet, headersMap["Activities"], sampleActs[i]);
    }
  }

  var confSheet = ss.getSheetByName("ConfigOptions");
  if (confSheet.getLastRow() <= 1) {
    var sampleConfigs = [
      {"id": "cfg-1", "OptionType": "ADVISOR", "OptionValue": "รศ.ดร. นงลักษณ์ วิเศษศิลป์ (Assoc. Prof. Dr. Nonglak Wisetsilp)"},
      {"id": "cfg-2", "OptionType": "ADVISOR", "OptionValue": "ศ.ดร. สร้อยอนุสาสน์ สุขดี (Prof. Dr. Soianusat Sukdee)"},
      {"id": "cfg-3", "OptionType": "ADVISOR", "OptionValue": "ผศ.ดร. สมศรี เกียรติพงษ์ (Asst. Prof. Dr. Somsri Kiatiphong)"},
      {"id": "cfg-4", "OptionType": "CO_ADVISOR", "OptionValue": "รศ.ดร. วิภา ชัยชาญ (Assoc. Prof. Dr. Wipa Chaichan)"},
      {"id": "cfg-5", "OptionType": "CO_ADVISOR", "OptionValue": "ดร. กิตติศักดิ์ รัตนวิทย์ (Dr. Kittisak Rattanawit)"},
      {"id": "cfg-6", "OptionType": "CO_ADVISOR", "OptionValue": "ผศ.ดร. รพีพรรณ เลิศสมบูรณ์ (Asst. Prof. Dr. Rapeepan Lertsomboon)"}
    ];
    for (var i = 0; i < sampleConfigs.length; i++) {
      appendObjectAsRow(confSheet, headersMap["ConfigOptions"], sampleConfigs[i]);
    }
  }

  // Seed portfolio data directly across the 16 separate sheets
  var sampleStudentIDs = ["6601010024", "6601010032", "6501010011"];
  for (var i = 0; i < sampleStudentIDs.length; i++) {
    var sId = sampleStudentIDs[i];
    var defaultPort = getDefaultPortfolio(sId);
    savePortfolioToSheets(sId, defaultPort);
  }
}

function appendObjectAsRow(sheet, headers, obj) {
  var rowValues = headers.map(function(h) {
    var val = obj[h] !== undefined ? obj[h] : "";
    if (typeof val === 'string' && /^[123]\/\d{4}$/.test(val)) {
      return "'" + val; // Prevent Google Sheets from formatting as Date
    }
    return val;
  });
  sheet.appendRow(rowValues);
}

// HELPERS FOR SEPARATE PORTFOLIO SHEETS
function handleForgotPassword(email) {
  if (!email) return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Email missing' })).setMimeType(ContentService.MimeType.JSON);
  
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet("Users");
  if (!sheet) return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Sheet not found' })).setMimeType(ContentService.MimeType.JSON);
  
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify({ success: false })).setMimeType(ContentService.MimeType.JSON);
  
  var emailIdx = data[0].indexOf("Email");
  var pwdIdx = data[0].indexOf("Password");
  var nameIdx = data[0].indexOf("FullName");
  
  if (emailIdx === -1) return ContentService.createTextOutput(JSON.stringify({ success: false })).setMimeType(ContentService.MimeType.JSON);
  
  var foundPwd = null;
  var foundName = null;
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][emailIdx] && data[i][emailIdx].toString().trim().toLowerCase() === email.trim().toLowerCase()) {
      foundPwd = pwdIdx > -1 ? data[i][pwdIdx] : '1234';
      foundName = nameIdx > -1 ? data[i][nameIdx] : 'User';
      break;
    }
  }
  
  if (foundPwd) {
    try {
      MailApp.sendEmail({
        to: email,
        subject: "Your PhD Portfolio System Password",
        htmlBody: "Hello " + foundName + ",<br><br>Your password for the PhD Portfolio Management System is: <b>" + foundPwd + "</b><br><br>Please keep this safe.<br><br>Best regards,<br>Faculty of Nursing, Thammasat University"
      });
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    } catch(e) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: e.toString() })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false })).setMimeType(ContentService.MimeType.JSON);
}

function handleRegisterEmail(email, password, name) {
  try {
    MailApp.sendEmail({
      to: email,
      subject: "Welcome to PhD Portfolio System",
      htmlBody: "Hello " + (name || '') + ",<br><br>Welcome to the PhD Portfolio Management System!<br><br>Your account has been created successfully. You can log in using your email and the password you created.<br><br>Access the portal here: <b><a href='https://ais-pre-kukrn5jhfdbsrobmbvxguj-102252394350.asia-southeast1.run.app'>Login to Portfolio</a></b><br><br>Best regards,<br>Faculty of Nursing, Thammasat University"
    });
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: e.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function loadPortfolioFromSheets(studentId) {
  var ss = getSpreadsheet();
  var defaultPort = getDefaultPortfolio(studentId);
  var portfolio = JSON.parse(JSON.stringify(defaultPort)); // Clone default

  function formatDate(val, isSemester) {
    if (!val) return "";
    if (val instanceof Date) {
      var y = val.getFullYear();
      var m = val.getMonth() + 1;
      if (isSemester) {
        return m + "/" + y;
      }
      var strM = ("0" + m).slice(-2);
      var d = ("0" + val.getDate()).slice(-2);
      return y + "-" + strM + "-" + d;
    }
    return String(val).trim();
  }

  function findRowsByStudentID(sheet, sId) {
    var data = getSheetDataAsJson(sheet);
    var matched = [];
    for (var i = 0; i < data.length; i++) {
      if (String(data[i].StudentID) === String(sId)) {
        matched.push(data[i]);
      }
    }
    return matched;
  }

  try {
    // 1. Student Profile
    var s1 = ss.getSheetByName("P1_StudentProfile");
    if (s1) {
      var rows = findRowsByStudentID(s1, studentId);
      if (rows.length > 0) {
        portfolio.academicBackground = [];
        portfolio.professionalBackground = [];
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          if (r.RecordType === "ACADEMIC") {
            portfolio.academicBackground.push({
              degree: r.Degree || "",
              field: r.Field || "",
              institution: r.Institution || "",
              year: String(r.Year || "")
            });
          } else if (r.RecordType === "PROFESSIONAL") {
            portfolio.professionalBackground.push({
              period: r.Period || "",
              role: r.Role || "",
              remarks: (r.Remarks_Credits_Description || r.Remarks) || ""
            });
          }
        }
      }
    }

    // 2. Milestones
    var s2 = ss.getSheetByName("P2_Milestones");
    if (s2) {
      var rows = findRowsByStudentID(s2, studentId);
      if (rows.length > 0) {
        var standardMilestones = [];
        var progCourses = [];
        var lPlans = [];
        var progName = "ชุด 1";

        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          var key = r.MilestoneKey || "";
          
          if (key === "program_of_study_name") {
            progName = r.Status || "ชุด 1";
          } else if (key.indexOf("program_course_") === 0) {
            progCourses.push({
              semester: formatDate((r.PlannedDate_Semester_TargetDate || r.PlannedDate), true),
              code: formatDate((r.ActualDate_CourseCode_Activities || r.ActualDate)),
              title: (r.MilestoneLabel_CourseTitle_Competency || r.MilestoneLabel) || "",
              credits: (r.Remarks_Credits_Description || r.Remarks) || "",
              status: r.Status || "Not Started"
            });
          } else if (key.indexOf("learning_plan_") === 0) {
            lPlans.push({
              competency: (r.MilestoneLabel_CourseTitle_Competency || r.MilestoneLabel) || "",
              description: (r.Remarks_Credits_Description || r.Remarks) || "",
              targetDate: formatDate((r.PlannedDate_Semester_TargetDate || r.PlannedDate)),
              status: r.Status || "Not Started",
              activities: (r.ActualDate_CourseCode_Activities || r.ActualDate) || ""
            });
          } else {
            standardMilestones.push({
              key: key,
              label: (r.MilestoneLabel_CourseTitle_Competency || r.MilestoneLabel) || "",
              plannedDate: formatDate((r.PlannedDate_Semester_TargetDate || r.PlannedDate)),
              actualDate: formatDate((r.ActualDate_CourseCode_Activities || r.ActualDate)),
              remarks: (r.Remarks_Credits_Description || r.Remarks) || "",
              status: r.Status || ""
            });
          }
        }

        if (standardMilestones.length > 0) {
          portfolio.milestones = standardMilestones;
        }
        portfolio.programOfStudyName = progName;
        if (progCourses.length > 0) {
          portfolio.programCourses = progCourses;
        }
        if (lPlans.length > 0) {
          portfolio.learningPlans = lPlans;
        }
      }
    }

    // 3. English Language
    var s3 = ss.getSheetByName("P3_EnglishLanguage");
    if (s3) {
      var rows = findRowsByStudentID(s3, studentId);
      if (rows.length > 0) {
        portfolio.englishActivities = [];
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          if (r.RecordType === "TEST") {
            portfolio.englishTest = {
              testName: r.TestName || "",
              dateTaken: formatDate(r.DateTaken),
              scoreAchieved: String(r.ScoreAchieved || ""),
              requiredScore: String(r.RequiredScore || ""),
              status: r.TestStatus || "",
              evidence: r.TestEvidence || ""
            };
            if (r.EnglishReflection !== undefined) {
              portfolio.englishReflection = r.EnglishReflection;
            }
          } else if (r.RecordType === "ACTIVITY") {
            portfolio.englishActivities.push({
              date: formatDate(r.ActivityDate),
              activity: r.ActivityName || "",
              organizer: r.ActivityOrganizer || "",
              description: r.ActivityDescription || "",
              evidence: r.ActivityEvidence || ""
            });
          } else if (r.RecordType === "VERIFICATION") {
            portfolio.englishVerification = {
              comments: r.VerificationComments || "",
              name: r.VerificationName || "",
              signatureDate: formatDate(r.VerificationDate)
            };
          }
        }
      }
    }

    // 4. Coursework
    var s4 = ss.getSheetByName("P4_Coursework");
    if (s4) {
      var rows = findRowsByStudentID(s4, studentId);
      if (rows.length > 0) {
        portfolio.completedCourses = [];
        portfolio.workshops = [];
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          if (r.RecordType === "COURSE") {
            portfolio.completedCourses.push({
              code: r.CourseCode || "",
              title: r.CourseTitle || "",
              semester: formatDate(r.Semester, true) || "",
              credits: String(r.Credits || ""),
              grade: r.Grade || ""
            });
          } else if (r.RecordType === "WORKSHOP") {
            portfolio.workshops.push({
              date: formatDate(r.WorkshopDate),
              title: r.WorkshopTitle || "",
              organizer: r.WorkshopOrganizer || "",
              role: r.WorkshopRole || "",
              keyLearning: r.WorkshopKeyLearning || ""
            });
          }
        }
      }
    }

    // 5. Dissertation
    var s5 = ss.getSheetByName("P5_Dissertation");
    if (s5) {
      var rows = findRowsByStudentID(s5, studentId);
      if (rows.length > 0) {
        portfolio.dissertationProgress = [];
        portfolio.advisorMeetings = [];
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          if (r.RecordType === "INFO") {
            portfolio.dissertationInfo = {
              title: r.InfoTitle || "",
              background: r.InfoBackground || "",
              problem: r.InfoProblem || "",
              objectives: r.InfoObjectives || "",
              hypotheses: r.InfoHypotheses || "",
              conceptualFramework: r.InfoConceptualFramework || "",
              methodology: r.InfoMethodology || "",
              researchTopic: r.InfoResearchTopic || ""
            };
          } else if (r.RecordType === "PROGRESS") {
            portfolio.dissertationProgress.push({
              activity: r.ProgressActivity || "",
              date: formatDate(r.ProgressDate),
              progress: r.ProgressDetails || "",
              obstacles: r.ProgressObstacles || "",
              evidence: r.ProgressEvidence || ""
            });
          } else if (r.RecordType === "MEETING") {
            portfolio.advisorMeetings.push({
              date: formatDate(r.MeetingDate),
              persons: r.MeetingPersons || "",
              issues: r.MeetingIssues || "",
              actionPoints: r.MeetingActionPoints || ""
            });
          }
        }
      }
    }

    // 6. Research Experience
    var s6 = ss.getSheetByName("P6_ResearchExperience");
    if (s6) {
      var rows = findRowsByStudentID(s6, studentId);
      if (rows.length > 0) {
        portfolio.researchExperience = [];
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          if (r.RecordType === "ETHICS") {
            portfolio.ethicsGovernance = {
              dateApplied: formatDate(r.EthicsDateApplied),
              dateApproved: formatDate(r.EthicsDateApproved),
              approvalNumber: r.EthicsApprovalNumber || "",
              amendments: r.EthicsAmendments || "",
              confidentiality: r.EthicsConfidentiality || ""
            };
            if (r.ResearchReflection !== undefined) {
              portfolio.researchReflection = r.ResearchReflection;
            }
          } else if (r.RecordType === "EXPERIENCE") {
            portfolio.researchExperience.push({
              date: formatDate(r.ExperienceDate),
              activity: r.ExperienceActivity || "",
              description: r.ExperienceDescription || "",
              hours: Number(r.ExperienceHours || 0),
              supervisor: r.ExperienceSupervisor || "",
              evidence: r.ExperienceEvidence || ""
            });
          }
        }
      }
    }

    // 7. Scholarly Output
    var s7 = ss.getSheetByName("P7_ScholarlyOutput");
    if (s7) {
      var rows = findRowsByStudentID(s7, studentId);
      if (rows.length > 0) {
        portfolio.conferencePresentations = [];
        portfolio.publications = [];
        portfolio.manuscripts = [];
        portfolio.grants = [];
        portfolio.awards = [];
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          if (r.RecordType === "CONFERENCE") {
            portfolio.conferencePresentations.push({
              date: formatDate(r.ConfDate),
              title: r.ConfTitle || "",
              conference: r.ConfName || "",
              type: r.ConfType || "",
              venue: r.ConfVenue || ""
            });
          } else if (r.RecordType === "PUBLICATION") {
            portfolio.publications.push({
              year: String(r.PubYear || ""),
              title: r.PubTitle || "",
              journal: r.PubJournal || "",
              status: r.PubStatus || "",
              doi: r.PubDoi || ""
            });
          } else if (r.RecordType === "MANUSCRIPT") {
            portfolio.manuscripts.push({
              title: r.MscTitle || "",
              journal: r.MscJournal || "",
              stage: r.MscStage || "",
              plannedSubmission: formatDate(r.MscPlannedSubmission)
            });
          } else if (r.RecordType === "GRANT") {
            portfolio.grants.push({
              title: r.GrantTitle || "",
              source: r.GrantSource || "",
              role: r.GrantRole || "",
              amount: r.GrantAmount || "",
              period: r.GrantPeriod || ""
            });
          } else if (r.RecordType === "AWARD") {
            portfolio.awards.push({
              date: formatDate(r.AwardDate),
              award: r.AwardName || "",
              organizer: r.AwardOrganizer || "",
              description: r.AwardDescription || ""
            });
          }
        }
      }
    }

    // 8. Teaching Service
    var s8 = ss.getSheetByName("P8_TeachingService");
    if (s8) {
      var rows = findRowsByStudentID(s8, studentId);
      if (rows.length > 0) {
        portfolio.teachingExperiences = [];
        portfolio.supervisions = [];
        portfolio.academicServices = [];
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          if (r.RecordType === "TEACHING") {
            portfolio.teachingExperiences.push({
              semester: formatDate(r.TeachSemester, true) || "",
              course: r.TeachCourse || "",
              role: r.TeachRole || "",
              studentLevel: r.TeachStudentLevel || "",
              description: r.TeachDescription || ""
            });
          } else if (r.RecordType === "SUPERVISION") {
            portfolio.supervisions.push({
              date: formatDate(r.SupervisionDate),
              type: r.SupervisionType || "",
              studentLevel: r.SupervisionStudentLevel || "",
              description: r.SupervisionDescription || ""
            });
          } else if (r.RecordType === "SERVICE") {
            portfolio.academicServices.push({
              date: formatDate(r.ServiceDate),
              activity: r.ServiceActivity || "",
              role: r.ServiceRole || "",
              organization: r.ServiceOrganization || ""
            });
          }
        }
      }
    }

    // 9. Leadership
    var s9 = ss.getSheetByName("P9_LeadershipNetworking");
    if (s9) {
      var rows = findRowsByStudentID(s9, studentId);
      if (rows.length > 0) {
        portfolio.leaderships = rows.map(function(r) {
          return {
            date: r.LeadershipDate || "",
            role: r.LeadershipRole || "",
            organization: r.LeadershipOrganization || "",
            responsibilities: r.LeadershipResponsibilities || ""
          };
        });
      }
    }

    // 10. Reflective Practice
    var s10 = ss.getSheetByName("P10_ReflectivePractice");
    if (s10) {
      var rows = findRowsByStudentID(s10, studentId);
      if (rows.length > 0) {
        portfolio.keyLearnings = [];
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          var rType = r.RecordType || "";
          if (rType === "KEY_LEARNING") {
            portfolio.keyLearnings.push({
              course: r.ReflectionCourse || "",
              keyLearning: r.ReflectionKeyLearning || "",
              application: r.ReflectionApplication || ""
            });
          } else if (rType === "GENERAL" || !rType) {
            if (r.ReflectionAcademicGrowth) portfolio.reflectionAcademicGrowth = r.ReflectionAcademicGrowth;
            if (r.ReflectionResearchIdentity) portfolio.reflectionResearchIdentity = r.ReflectionResearchIdentity;
            if (r.ReflectionChallengesResilience) portfolio.reflectionChallengesResilience = r.ReflectionChallengesResilience;
            if (r.ReflectionTransformation) portfolio.reflectionTransformation = r.ReflectionTransformation;
            if (r.ReflectionCourse && !rType) {
              portfolio.keyLearnings.push({
                course: r.ReflectionCourse || "",
                keyLearning: r.ReflectionKeyLearning || "",
                application: r.ReflectionApplication || ""
              });
            }
          }
        }
      }
    }

    // 11. Supporting Evidence
    var s11 = ss.getSheetByName("P11_SupportingEvidence");
    if (s11) {
      var rows = findRowsByStudentID(s11, studentId);
      portfolio.supportingFiles = rows.map(function(r) {
        return {
          name: r.FileName || "",
          url: r.FileUrl || "",
          title: r.FileTitle || "",
          date: r.FileDate ? formatDate(r.FileDate) : "",
          description: r.FileDescription || ""
        };
      });
    }

    // 12. Competencies
    var s12 = ss.getSheetByName("P12_CompetencySelfAssessment");
    if (s12) {
      var rows = findRowsByStudentID(s12, studentId);
      if (rows.length > 0) {
        portfolio.competencySelfAssessment = rows.map(function(r) {
          return {
            competency: r.CompetencyName || "",
            rating: r.CompetencyRating || "",
            remarks: r.CompetencyRemarks || ""
          };
        });
      }
    }

    // 13. Annual Review
    var s13 = ss.getSheetByName("P13_AnnualReview");
    if (s13) {
      var rows = findRowsByStudentID(s13, studentId);
      if (rows.length > 0) {
        portfolio.annualReview = { achievements: "", improvements: "", actionPlans: [] };
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          if (r.RecordType === "REVIEW") {
            portfolio.annualReview.achievements = r.ReviewAchievements || "";
            portfolio.annualReview.improvements = r.ReviewImprovements || "";
          } else if (r.RecordType === "ACTION_PLAN") {
            portfolio.annualReview.actionPlans.push({
              goal: r.Goal || "",
              steps: r.Steps || "",
              timeline: r.Timeline || "",
              support: r.Support || ""
            });
          }
        }
      }
    }

    // 14. Future Career Plan
    var s14 = ss.getSheetByName("P14_FutureCareerPlan");
    if (s14) {
      var rows = findRowsByStudentID(s14, studentId);
      if (rows.length > 0) {
        portfolio.futureCareer = {
          shortTerm: rows[0].ShortTermGoal || "",
          longTerm: rows[0].LongTermGoal || "",
          preparation: rows[0].Preparation || ""
        };
      }
    }

    // 15. Advisor Feedback
    var s15 = ss.getSheetByName("P15_AdvisorFeedback");
    if (s15) {
      var rows = findRowsByStudentID(s15, studentId);
      if (rows.length > 0) {
        portfolio.advisorComments = rows[0].AdvisorComments || "";
      }
    }

    // 16. Advisor Endorsement
    var s16 = ss.getSheetByName("P16_AdvisorEndorsement");
    if (s16) {
      var rows = findRowsByStudentID(s16, studentId);
      if (rows.length > 0) {
        portfolio.endorsements = rows.map(function(r) {
          return {
            role: r.EndorsementRole || "",
            name: r.EndorsementName || "",
            signatureDate: formatDate(r.EndorsementSignatureDate)
          };
        });
      }
    }
  } catch (err) {
    Logger.log("Error loading portfolio sections: " + err.toString());
  }

  return portfolio;
}

function savePortfolioToSheets(studentId, portfolio) {
  var ss = getSpreadsheet();
  var nowStr = new Date().toISOString();

  function formatDate(val, isSemester) {
    if (!val) return "";
    if (val instanceof Date) {
      var y = val.getFullYear();
      var m = val.getMonth() + 1;
      if (isSemester) {
        return m + "/" + y;
      }
      var strM = ("0" + m).slice(-2);
      var d = ("0" + val.getDate()).slice(-2);
      return y + "-" + strM + "-" + d;
    }
    return String(val).trim();
  }

  // 1. Student Profile
  var s1 = ss.getSheetByName("P1_StudentProfile");
  if (s1) {
    deleteRow(s1, "StudentID", studentId);
    var acs = portfolio.academicBackground || [];
    for (var i = 0; i < acs.length; i++) {
      var ac = acs[i];
      appendObjectAsRow(s1, ["StudentID", "RecordType", "Degree", "Field", "Institution", "Year", "Period", "Role", "Remarks", "LastUpdated"], {
        StudentID: studentId, RecordType: "ACADEMIC", Degree: ac.degree, Field: ac.field, Institution: ac.institution, Year: ac.year, LastUpdated: nowStr
      });
    }
    var prs = portfolio.professionalBackground || [];
    for (var i = 0; i < prs.length; i++) {
      var pr = prs[i];
      appendObjectAsRow(s1, ["StudentID", "RecordType", "Degree", "Field", "Institution", "Year", "Period", "Role", "Remarks", "LastUpdated"], {
        StudentID: studentId, RecordType: "PROFESSIONAL", Period: pr.period, Role: pr.role, Remarks_Credits_Description: pr.remarks, LastUpdated: nowStr
      });
    }
  }

  // 2. Milestones
  var s2 = ss.getSheetByName("P2_Milestones");
  if (s2) {
    deleteRow(s2, "StudentID", studentId);
    
    // Save standard milestones
    var ms = portfolio.milestones || [];
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i];
      appendObjectAsRow(s2, ["StudentID", "MilestoneKey", "MilestoneLabel_CourseTitle_Competency", "PlannedDate_Semester_TargetDate", "ActualDate_CourseCode_Activities", "Remarks_Credits_Description", "Status", "LastUpdated"], {
        StudentID: studentId, MilestoneKey: m.key, MilestoneLabel_CourseTitle_Competency: m.label, PlannedDate_Semester_TargetDate: formatDate(m.plannedDate), ActualDate_CourseCode_Activities: formatDate(m.actualDate), Remarks_Credits_Description: m.remarks, Status: m.status, LastUpdated: nowStr
      });
    }

    // Save Program of Study Name
    appendObjectAsRow(s2, ["StudentID", "MilestoneKey", "MilestoneLabel_CourseTitle_Competency", "PlannedDate_Semester_TargetDate", "ActualDate_CourseCode_Activities", "Remarks_Credits_Description", "Status", "LastUpdated"], {
      StudentID: studentId, MilestoneKey: "program_of_study_name", MilestoneLabel_CourseTitle_Competency: "Program of Study Name", PlannedDate_Semester_TargetDate: "", ActualDate_CourseCode_Activities: "", Remarks_Credits_Description: "", Status: portfolio.programOfStudyName || "ชุด 1", LastUpdated: nowStr
    });

    // Save Program Courses
    var pcs = portfolio.programCourses || [];
    for (var i = 0; i < pcs.length; i++) {
      var pc = pcs[i];
      appendObjectAsRow(s2, ["StudentID", "MilestoneKey", "MilestoneLabel_CourseTitle_Competency", "PlannedDate_Semester_TargetDate", "ActualDate_CourseCode_Activities", "Remarks_Credits_Description", "Status", "LastUpdated"], {
        StudentID: studentId, MilestoneKey: "program_course_" + i, MilestoneLabel_CourseTitle_Competency: pc.title, PlannedDate_Semester_TargetDate: pc.semester, ActualDate_CourseCode_Activities: pc.code, Remarks_Credits_Description: pc.credits, Status: pc.status, LastUpdated: nowStr
      });
    }

    // Save Learning Plans
    var lps = portfolio.learningPlans || [];
    for (var i = 0; i < lps.length; i++) {
      var lp = lps[i];
      appendObjectAsRow(s2, ["StudentID", "MilestoneKey", "MilestoneLabel_CourseTitle_Competency", "PlannedDate_Semester_TargetDate", "ActualDate_CourseCode_Activities", "Remarks_Credits_Description", "Status", "LastUpdated"], {
        StudentID: studentId, MilestoneKey: "learning_plan_" + i, MilestoneLabel_CourseTitle_Competency: lp.competency, PlannedDate_Semester_TargetDate: lp.targetDate, ActualDate_CourseCode_Activities: lp.activities, Remarks_Credits_Description: lp.description, Status: lp.status, LastUpdated: nowStr
      });
    }
  }

  // 3. English Language
  var s3 = ss.getSheetByName("P3_EnglishLanguage");
  if (s3) {
    deleteRow(s3, "StudentID", studentId);
    var et = portfolio.englishTest || {};
    var sheet3Headers = ["StudentID", "RecordType", "TestName", "DateTaken", "ScoreAchieved", "RequiredScore", "TestStatus", "TestEvidence", "ActivityDate", "ActivityName", "ActivityOrganizer", "ActivityDescription", "ActivityEvidence", "EnglishReflection", "VerificationComments", "VerificationName", "VerificationDate", "LastUpdated"];
    appendObjectAsRow(s3, sheet3Headers, {
      StudentID: studentId, RecordType: "TEST", TestName: et.testName, DateTaken: formatDate(et.dateTaken), ScoreAchieved: et.scoreAchieved, RequiredScore: et.requiredScore, TestStatus: et.status, TestEvidence: et.evidence, EnglishReflection: portfolio.englishReflection || "", LastUpdated: nowStr
    });
    var acts = portfolio.englishActivities || [];
    for (var i = 0; i < acts.length; i++) {
      var act = acts[i];
      appendObjectAsRow(s3, sheet3Headers, {
        StudentID: studentId, RecordType: "ACTIVITY", ActivityDate: formatDate(act.date), ActivityName: act.activity, ActivityOrganizer: act.organizer, ActivityDescription: act.description, ActivityEvidence: act.evidence, LastUpdated: nowStr
      });
    }
    var ev = portfolio.englishVerification || {};
    appendObjectAsRow(s3, sheet3Headers, {
      StudentID: studentId, RecordType: "VERIFICATION", VerificationComments: ev.comments || "", VerificationName: ev.name || "", VerificationDate: formatDate(ev.signatureDate), LastUpdated: nowStr
    });
  }

  // 4. Coursework
  var s4 = ss.getSheetByName("P4_Coursework");
  if (s4) {
    deleteRow(s4, "StudentID", studentId);
    var crs = portfolio.completedCourses || [];
    for (var i = 0; i < crs.length; i++) {
      var cr = crs[i];
      appendObjectAsRow(s4, ["StudentID", "RecordType", "CourseCode", "CourseTitle", "Semester", "Credits", "Grade", "WorkshopDate", "WorkshopTitle", "WorkshopOrganizer", "WorkshopRole", "WorkshopKeyLearning", "LastUpdated"], {
        StudentID: studentId, RecordType: "COURSE", CourseCode: cr.code, CourseTitle: cr.title, Semester: cr.semester, Credits: cr.credits, Grade: cr.grade, LastUpdated: nowStr
      });
    }
    var wks = portfolio.workshops || [];
    for (var i = 0; i < wks.length; i++) {
      var wk = wks[i];
      appendObjectAsRow(s4, ["StudentID", "RecordType", "CourseCode", "CourseTitle", "Semester", "Credits", "Grade", "WorkshopDate", "WorkshopTitle", "WorkshopOrganizer", "WorkshopRole", "WorkshopKeyLearning", "LastUpdated"], {
        StudentID: studentId, RecordType: "WORKSHOP", WorkshopDate: formatDate(wk.date), WorkshopTitle: wk.title, WorkshopOrganizer: wk.organizer, WorkshopRole: wk.role, WorkshopKeyLearning: wk.keyLearning, LastUpdated: nowStr
      });
    }
  }

  // 5. Dissertation
  var s5 = ss.getSheetByName("P5_Dissertation");
  if (s5) {
    deleteRow(s5, "StudentID", studentId);
    s5.getRange(1, 1, 1, 20).setValues([["StudentID", "RecordType", "InfoTitle", "InfoBackground", "InfoProblem", "InfoObjectives", "InfoHypotheses", "InfoConceptualFramework", "InfoMethodology", "InfoResearchTopic", "ProgressActivity", "ProgressDate", "ProgressDetails", "ProgressEvidence", "MeetingDate", "MeetingPersons", "MeetingIssues", "MeetingActionPoints", "LastUpdated", "ProgressObstacles"]]);
    var di = portfolio.dissertationInfo || {};
    appendObjectAsRow(s5, ["StudentID", "RecordType", "InfoTitle", "InfoBackground", "InfoProblem", "InfoObjectives", "InfoHypotheses", "InfoConceptualFramework", "InfoMethodology", "InfoResearchTopic", "ProgressActivity", "ProgressDate", "ProgressDetails", "ProgressEvidence", "MeetingDate", "MeetingPersons", "MeetingIssues", "MeetingActionPoints", "LastUpdated", "ProgressObstacles"], {
      StudentID: studentId, RecordType: "INFO", InfoTitle: di.title, InfoBackground: di.background, InfoProblem: di.problem, InfoObjectives: di.objectives, InfoHypotheses: di.hypotheses, InfoConceptualFramework: di.conceptualFramework, InfoMethodology: di.methodology, InfoResearchTopic: di.researchTopic || "", LastUpdated: nowStr
    });
    var dps = portfolio.dissertationProgress || [];
    for (var i = 0; i < dps.length; i++) {
      var dp = dps[i];
      appendObjectAsRow(s5, ["StudentID", "RecordType", "InfoTitle", "InfoBackground", "InfoProblem", "InfoObjectives", "InfoHypotheses", "InfoConceptualFramework", "InfoMethodology", "InfoResearchTopic", "ProgressActivity", "ProgressDate", "ProgressDetails", "ProgressEvidence", "MeetingDate", "MeetingPersons", "MeetingIssues", "MeetingActionPoints", "LastUpdated", "ProgressObstacles"], {
        StudentID: studentId, RecordType: "PROGRESS", ProgressActivity: dp.activity, ProgressDate: formatDate(dp.date), ProgressDetails: dp.progress, ProgressEvidence: dp.evidence, ProgressObstacles: dp.obstacles || "", LastUpdated: nowStr
      });
    }
    var ams = portfolio.advisorMeetings || [];
    for (var i = 0; i < ams.length; i++) {
      var am = ams[i];
      appendObjectAsRow(s5, ["StudentID", "RecordType", "InfoTitle", "InfoBackground", "InfoProblem", "InfoObjectives", "InfoHypotheses", "InfoConceptualFramework", "InfoMethodology", "InfoResearchTopic", "ProgressActivity", "ProgressDate", "ProgressDetails", "ProgressEvidence", "MeetingDate", "MeetingPersons", "MeetingIssues", "MeetingActionPoints", "LastUpdated", "ProgressObstacles"], {
        StudentID: studentId, RecordType: "MEETING", MeetingDate: formatDate(am.date), MeetingPersons: am.persons, MeetingIssues: am.issues, MeetingActionPoints: am.actionPoints, LastUpdated: nowStr
      });
    }
  }

  // 6. Research Experience
  var s6 = ss.getSheetByName("P6_ResearchExperience");
  if (s6) {
    deleteRow(s6, "StudentID", studentId);
    var eg = portfolio.ethicsGovernance || {};
    appendObjectAsRow(s6, ["StudentID", "RecordType", "EthicsDateApplied", "EthicsDateApproved", "EthicsApprovalNumber", "EthicsAmendments", "EthicsConfidentiality", "ExperienceDate", "ExperienceActivity", "ExperienceDescription", "ExperienceHours", "ExperienceSupervisor", "ExperienceEvidence", "ResearchReflection", "LastUpdated"], {
      StudentID: studentId, RecordType: "ETHICS", EthicsDateApplied: formatDate(eg.dateApplied), EthicsDateApproved: formatDate(eg.dateApproved), EthicsApprovalNumber: eg.approvalNumber, EthicsAmendments: eg.amendments, EthicsConfidentiality: eg.confidentiality, ResearchReflection: portfolio.researchReflection || "", LastUpdated: nowStr
    });
    var resExp = portfolio.researchExperience || [];
    for (var i = 0; i < resExp.length; i++) {
      var re = resExp[i];
      appendObjectAsRow(s6, ["StudentID", "RecordType", "EthicsDateApplied", "EthicsDateApproved", "EthicsApprovalNumber", "EthicsAmendments", "EthicsConfidentiality", "ExperienceDate", "ExperienceActivity", "ExperienceDescription", "ExperienceHours", "ExperienceSupervisor", "ExperienceEvidence", "ResearchReflection", "LastUpdated"], {
        StudentID: studentId, RecordType: "EXPERIENCE", ExperienceDate: formatDate(re.date), ExperienceActivity: re.activity, ExperienceDescription: re.description, ExperienceHours: re.hours, ExperienceSupervisor: re.supervisor, ExperienceEvidence: re.evidence, LastUpdated: nowStr
      });
    }
  }

  // 7. Scholarly Output
  var s7 = ss.getSheetByName("P7_ScholarlyOutput");
  if (s7) {
    deleteRow(s7, "StudentID", studentId);
    var confs = portfolio.conferencePresentations || [];
    for (var i = 0; i < confs.length; i++) {
      var c = confs[i];
      appendObjectAsRow(s7, ["StudentID", "RecordType", "ConfDate", "ConfTitle", "ConfName", "ConfType", "ConfVenue", "PubYear", "PubTitle", "PubJournal", "PubStatus", "PubDoi", "MscTitle", "MscJournal", "MscStage", "MscPlannedSubmission", "GrantTitle", "GrantSource", "GrantRole", "GrantAmount", "GrantPeriod", "AwardDate", "AwardName", "AwardOrganizer", "AwardDescription", "LastUpdated"], {
        StudentID: studentId, RecordType: "CONFERENCE", ConfDate: formatDate(c.date), ConfTitle: c.title, ConfName: c.conference, ConfType: c.type, ConfVenue: c.venue, LastUpdated: nowStr
      });
    }
    var pubs = portfolio.publications || [];
    for (var i = 0; i < pubs.length; i++) {
      var p = pubs[i];
      appendObjectAsRow(s7, ["StudentID", "RecordType", "ConfDate", "ConfTitle", "ConfName", "ConfType", "ConfVenue", "PubYear", "PubTitle", "PubJournal", "PubStatus", "PubDoi", "MscTitle", "MscJournal", "MscStage", "MscPlannedSubmission", "GrantTitle", "GrantSource", "GrantRole", "GrantAmount", "GrantPeriod", "AwardDate", "AwardName", "AwardOrganizer", "AwardDescription", "LastUpdated"], {
        StudentID: studentId, RecordType: "PUBLICATION", PubYear: p.year, PubTitle: p.title, PubJournal: p.journal, PubStatus: p.status, PubDoi: p.doi, LastUpdated: nowStr
      });
    }
    var mscs = portfolio.manuscripts || [];
    for (var i = 0; i < mscs.length; i++) {
      var m = mscs[i];
      appendObjectAsRow(s7, ["StudentID", "RecordType", "ConfDate", "ConfTitle", "ConfName", "ConfType", "ConfVenue", "PubYear", "PubTitle", "PubJournal", "PubStatus", "PubDoi", "MscTitle", "MscJournal", "MscStage", "MscPlannedSubmission", "GrantTitle", "GrantSource", "GrantRole", "GrantAmount", "GrantPeriod", "AwardDate", "AwardName", "AwardOrganizer", "AwardDescription", "LastUpdated"], {
        StudentID: studentId, RecordType: "MANUSCRIPT", MscTitle: m.title, MscJournal: m.journal, MscStage: m.stage, MscPlannedSubmission: formatDate(m.plannedSubmission), LastUpdated: nowStr
      });
    }
    var grs = portfolio.grants || [];
    for (var i = 0; i < grs.length; i++) {
      var g = grs[i];
      appendObjectAsRow(s7, ["StudentID", "RecordType", "ConfDate", "ConfTitle", "ConfName", "ConfType", "ConfVenue", "PubYear", "PubTitle", "PubJournal", "PubStatus", "PubDoi", "MscTitle", "MscJournal", "MscStage", "MscPlannedSubmission", "GrantTitle", "GrantSource", "GrantRole", "GrantAmount", "GrantPeriod", "AwardDate", "AwardName", "AwardOrganizer", "AwardDescription", "LastUpdated"], {
        StudentID: studentId, RecordType: "GRANT", GrantTitle: g.title, GrantSource: g.source, GrantRole: g.role, GrantAmount: g.amount, GrantPeriod: g.period, LastUpdated: nowStr
      });
    }
    var aws = portfolio.awards || [];
    for (var i = 0; i < aws.length; i++) {
      var a = aws[i];
      appendObjectAsRow(s7, ["StudentID", "RecordType", "ConfDate", "ConfTitle", "ConfName", "ConfType", "ConfVenue", "PubYear", "PubTitle", "PubJournal", "PubStatus", "PubDoi", "MscTitle", "MscJournal", "MscStage", "MscPlannedSubmission", "GrantTitle", "GrantSource", "GrantRole", "GrantAmount", "GrantPeriod", "AwardDate", "AwardName", "AwardOrganizer", "AwardDescription", "LastUpdated"], {
        StudentID: studentId, RecordType: "AWARD", AwardDate: formatDate(a.date), AwardName: a.award, AwardOrganizer: a.organizer, AwardDescription: a.description, LastUpdated: nowStr
      });
    }
  }

  // 8. Teaching Service
  var s8 = ss.getSheetByName("P8_TeachingService");
  if (s8) {
    deleteRow(s8, "StudentID", studentId);
    var tchs = portfolio.teachingExperiences || [];
    for (var i = 0; i < tchs.length; i++) {
      var t = tchs[i];
      appendObjectAsRow(s8, ["StudentID", "RecordType", "TeachSemester", "TeachCourse", "TeachRole", "TeachStudentLevel", "TeachDescription", "SupervisionDate", "SupervisionType", "SupervisionStudentLevel", "SupervisionDescription", "ServiceDate", "ServiceActivity", "ServiceRole", "ServiceOrganization", "LastUpdated"], {
        StudentID: studentId, RecordType: "TEACHING", TeachSemester: t.semester, TeachCourse: t.course, TeachRole: t.role, TeachStudentLevel: t.studentLevel, TeachDescription: t.description, LastUpdated: nowStr
      });
    }
    var sups = portfolio.supervisions || [];
    for (var i = 0; i < sups.length; i++) {
      var s = sups[i];
      appendObjectAsRow(s8, ["StudentID", "RecordType", "TeachSemester", "TeachCourse", "TeachRole", "TeachStudentLevel", "TeachDescription", "SupervisionDate", "SupervisionType", "SupervisionStudentLevel", "SupervisionDescription", "ServiceDate", "ServiceActivity", "ServiceRole", "ServiceOrganization", "LastUpdated"], {
        StudentID: studentId, RecordType: "SUPERVISION", SupervisionDate: formatDate(s.date), SupervisionType: s.type, SupervisionStudentLevel: s.studentLevel, SupervisionDescription: s.description, LastUpdated: nowStr
      });
    }
    var svcs = portfolio.academicServices || [];
    for (var i = 0; i < svcs.length; i++) {
      var sv = svcs[i];
      appendObjectAsRow(s8, ["StudentID", "RecordType", "TeachSemester", "TeachCourse", "TeachRole", "TeachStudentLevel", "TeachDescription", "SupervisionDate", "SupervisionType", "SupervisionStudentLevel", "SupervisionDescription", "ServiceDate", "ServiceActivity", "ServiceRole", "ServiceOrganization", "LastUpdated"], {
        StudentID: studentId, RecordType: "SERVICE", ServiceDate: formatDate(sv.date), ServiceActivity: sv.activity, ServiceRole: sv.role, ServiceOrganization: sv.organization, LastUpdated: nowStr
      });
    }
  }

  // 9. Leadership
  var s9 = ss.getSheetByName("P9_LeadershipNetworking");
  if (s9) {
    deleteRow(s9, "StudentID", studentId);
    var ldrs = portfolio.leaderships || [];
    for (var i = 0; i < ldrs.length; i++) {
      var l = ldrs[i];
      appendObjectAsRow(s9, ["StudentID", "LeadershipDate", "LeadershipRole", "LeadershipOrganization", "LeadershipResponsibilities", "LastUpdated"], {
        StudentID: studentId, LeadershipDate: l.date, LeadershipRole: l.role, LeadershipOrganization: l.organization, LeadershipResponsibilities: l.responsibilities, LastUpdated: nowStr
      });
    }
  }

  // 10. Reflective Practice
  var s10 = ss.getSheetByName("P10_ReflectivePractice");
  if (s10) {
    deleteRow(s10, "StudentID", studentId);
    var kls = portfolio.keyLearnings || [];
    var p10Headers = ["StudentID", "RecordType", "ReflectionCourse", "ReflectionKeyLearning", "ReflectionApplication", "ReflectionAcademicGrowth", "ReflectionResearchIdentity", "ReflectionChallengesResilience", "ReflectionTransformation", "LastUpdated"];
    for (var i = 0; i < kls.length; i++) {
      var kl = kls[i];
      appendObjectAsRow(s10, p10Headers, {
        StudentID: studentId, RecordType: "KEY_LEARNING", ReflectionCourse: kl.course, ReflectionKeyLearning: kl.keyLearning, ReflectionApplication: kl.application, LastUpdated: nowStr
      });
    }
    appendObjectAsRow(s10, p10Headers, {
      StudentID: studentId, RecordType: "GENERAL",
      ReflectionAcademicGrowth: portfolio.reflectionAcademicGrowth || "",
      ReflectionResearchIdentity: portfolio.reflectionResearchIdentity || "",
      ReflectionChallengesResilience: portfolio.reflectionChallengesResilience || "",
      ReflectionTransformation: portfolio.reflectionTransformation || "",
      LastUpdated: nowStr
    });
  }

  // 11. Supporting Evidence
  var s11 = ss.getSheetByName("P11_SupportingEvidence");
  if (s11) {
    deleteRow(s11, "StudentID", studentId);
    var files = portfolio.supportingFiles || [];
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      appendObjectAsRow(s11, ["StudentID", "FileName", "FileUrl", "FileTitle", "FileDate", "FileDescription", "LastUpdated"], {
        StudentID: studentId,
        FileName: f.name || "",
        FileUrl: f.url || "",
        FileTitle: f.title || "",
        FileDate: f.date ? formatDate(f.date) : "",
        FileDescription: f.description || "",
        LastUpdated: nowStr
      });
    }
  }

  // 12. Competencies
  var s12 = ss.getSheetByName("P12_CompetencySelfAssessment");
  if (s12) {
    deleteRow(s12, "StudentID", studentId);
    var comps = portfolio.competencySelfAssessment || [];
    for (var i = 0; i < comps.length; i++) {
      var c = comps[i];
      appendObjectAsRow(s12, ["StudentID", "CompetencyName", "CompetencyRating", "CompetencyRemarks", "LastUpdated"], {
        StudentID: studentId, CompetencyName: c.competency, CompetencyRating: c.rating, CompetencyRemarks_Credits_Description: c.remarks, LastUpdated: nowStr
      });
    }
  }

  // 13. Annual Review
  var s13 = ss.getSheetByName("P13_AnnualReview");
  if (s13) {
    deleteRow(s13, "StudentID", studentId);
    var ar = portfolio.annualReview || {};
    appendObjectAsRow(s13, ["StudentID", "RecordType", "ReviewAchievements", "ReviewImprovements", "Goal", "Steps", "Timeline", "Support", "LastUpdated"], {
      StudentID: studentId, RecordType: "REVIEW", ReviewAchievements: ar.achievements, ReviewImprovements: ar.improvements, LastUpdated: nowStr
    });
    var aps = ar.actionPlans || [];
    for (var i = 0; i < aps.length; i++) {
      var ap = aps[i];
      appendObjectAsRow(s13, ["StudentID", "RecordType", "ReviewAchievements", "ReviewImprovements", "Goal", "Steps", "Timeline", "Support", "LastUpdated"], {
        StudentID: studentId, RecordType: "ACTION_PLAN", Goal: ap.goal, Steps: ap.steps, Timeline: ap.timeline, Support: ap.support, LastUpdated: nowStr
      });
    }
  }

  // 14. Future Career Plan
  var s14 = ss.getSheetByName("P14_FutureCareerPlan");
  if (s14) {
    deleteRow(s14, "StudentID", studentId);
    var fc = portfolio.futureCareer || {};
    appendObjectAsRow(s14, ["StudentID", "ShortTermGoal", "LongTermGoal", "Preparation", "LastUpdated"], {
      StudentID: studentId, ShortTermGoal: fc.shortTerm, LongTermGoal: fc.longTerm, Preparation: fc.preparation, LastUpdated: nowStr
    });
  }

  // 15. Advisor Feedback
  var s15 = ss.getSheetByName("P15_AdvisorFeedback");
  if (s15) {
    deleteRow(s15, "StudentID", studentId);
    appendObjectAsRow(s15, ["StudentID", "AdvisorComments", "LastUpdated"], {
      StudentID: studentId, AdvisorComments: portfolio.advisorComments || "", LastUpdated: nowStr
    });
  }

  // 16. Advisor Endorsement
  var s16 = ss.getSheetByName("P16_AdvisorEndorsement");
  if (s16) {
    deleteRow(s16, "StudentID", studentId);
    var eds = portfolio.endorsements || [];
    for (var i = 0; i < eds.length; i++) {
      var ed = eds[i];
      appendObjectAsRow(s16, ["StudentID", "EndorsementRole", "EndorsementName", "EndorsementSignatureDate", "LastUpdated"], {
        StudentID: studentId, EndorsementRole: ed.role, EndorsementName: ed.name, EndorsementSignatureDate: formatDate(ed.signatureDate), LastUpdated: nowStr
      });
    }
  }
}

function findRowByStudentID(sheet, studentId) {
  var data = getSheetDataAsJson(sheet);
  for (var i = 0; i < data.length; i++) {
    if (String(data[i].StudentID) === String(studentId)) {
      return data[i];
    }
  }
  return null;
}

function getSheetDataAsJson(sheet) {
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  
  var headers = values[0];
  var list = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      obj[headers[c]] = row[c];
    }
    list.push(obj);
  }
  return list;
}

function upsertRow(sheet, keyColumnName, rowObject) {
  var data = getSheetDataAsJson(sheet);
  var headers = sheet.getDataRange().getValues()[0];
  var keyColIndex = headers.indexOf(keyColumnName);
  
  var existingRowIndex = -1;
  for (var r = 0; r < data.length; r++) {
    if (data[r][keyColumnName] == rowObject[keyColumnName]) {
      existingRowIndex = r + 2; // +1 header, +1 1-based index
      break;
    }
  }
  
  var rowValues = headers.map(function(header) {
    return rowObject[header] !== undefined ? rowObject[header] : "";
  });
  
  if (existingRowIndex !== -1) {
    sheet.getRange(existingRowIndex, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
}

function deleteRow(sheet, keyColumnName, keyValue) {
  var headers = sheet.getDataRange().getValues()[0];
  var keyColIndex = headers.indexOf(keyColumnName);
  var values = sheet.getDataRange().getValues();
  
  for (var r = values.length - 1; r >= 1; r--) {
    if (values[r][keyColIndex] == keyValue) {
      sheet.deleteRow(r + 1);
    }
  }
}

function getDefaultPortfolio(studentId) {
  return {
    academicBackground: [],
    professionalBackground: [],
    programOfStudyName: 'ชุด 1',
    programCourses: [
      { semester: '1/2025', code: 'NS802', title: 'Advanced Gerontology: Nursing Research and Innovation', credits: '2', status: 'Completed' },
      { semester: '1/2025', code: 'NS811', title: 'Philosophy and Theory Development in Nursing', credits: '3', status: 'Completed' },
      { semester: '1/2025', code: 'NS812', title: 'Advanced Research in Nursing', credits: '3', status: 'Completed' },
      { semester: '1/2025', code: 'NS815', title: 'Seminar in Nursing and Health Issues', credits: '1', status: 'Completed' },
      { semester: '2/2025', code: 'NS807', title: 'Innovation in Health and Nursing', credits: '2', status: 'Completed' },
      { semester: '2/2025', code: 'NS813', title: 'Advanced Statistics', credits: '3', status: 'Completed' },
      { semester: '2/2025', code: 'NS814', title: 'Healthcare Leaders', credits: '3', status: 'Completed' }
    ],
    learningPlans: [
      { competency: 'Advanced research methodology', description: 'Improve knowledge and skills in quantitative and qualitative research design, research ethics, and evidence-based nursing research.', targetDate: '2026-12-15', status: 'In Progress', activities: 'Participate in qualitative workshops and draft methodology chapter.' },
      { competency: 'Statistics and data analysis', description: 'Develop skills in statistical analysis, data interpretation, and the use of statistical software for healthcare research.', targetDate: '2026-10-30', status: 'In Progress', activities: 'Complete advanced SPSS/AMOS training and practice SEM models.' },
      { competency: 'Academic writing and publication', description: 'Strengthen academic writing skills for international publication, manuscript preparation, and scientific communication.', targetDate: '2027-03-20', status: 'Not Started', activities: 'Draft first manuscript for peer-reviewed Scopus journal.' },
      { competency: 'English language skills', description: 'Improve academic English communication, presentation skills, and confidence in international academic settings.', targetDate: '2026-08-15', status: 'Completed', activities: 'Present at the International Nursing Conference.' },
      { competency: 'Teaching and academic supervision', description: 'Enhance teaching strategies, student supervision, and learning management in nursing education.', targetDate: '2027-05-10', status: 'Not Started', activities: 'Assist advisor with undergraduate lecture series.' },
      { competency: 'Leadership and project management', description: 'Develop leadership, teamwork, and project management skills for academic and healthcare settings.', targetDate: '2026-11-20', status: 'In Progress', activities: 'Lead community outreach program for caregiver support.' }
    ],
    milestones: [
      { key: 'coursework', label: 'Coursework completion', plannedDate: '', actualDate: '', remarks: '', status: 'Not Started' },
      { key: 'english', label: 'Meeting the English language proficiency requirement', plannedDate: '', actualDate: '', remarks: '', status: 'Not Started' },
      { key: 'research_hours', label: 'Completion of at least 180 research experience hours', plannedDate: '', actualDate: '', remarks: '', status: 'Not Started' },
      { key: 'qe', label: 'Qualifying examination', plannedDate: '', actualDate: '', remarks: '', status: 'Not Started' },
      { key: 'study_abroad', label: 'Studying abroad', plannedDate: '', actualDate: '', remarks: '', status: 'Not Started' },
      { key: 'proposal_dev', label: 'Dissertation proposal development', plannedDate: '', actualDate: '', remarks: '', status: 'Not Started' },
      { key: 'proposal_defense', label: 'Proposal defense', plannedDate: '', actualDate: '', remarks: '', status: 'Not Started' },
      { key: 'ethics', label: 'Ethics approval', plannedDate: '', actualDate: '', remarks: '', status: 'Not Started' },
      { key: 'data_collection', label: 'Data collection', plannedDate: '', actualDate: '', remarks: '', status: 'Not Started' },
      { key: 'data_analysis', label: 'Data analysis', plannedDate: '', actualDate: '', remarks: '', status: 'Not Started' },
      { key: 'manuscript_prep', label: 'Manuscript preparation', plannedDate: '', actualDate: '', remarks: '', status: 'Not Started' },
      { key: 'dissertation_writing', label: 'Dissertation writing', plannedDate: '', actualDate: '', remarks: '', status: 'Not Started' },
      { key: 'final_defense', label: 'Final defense', plannedDate: '', actualDate: '', remarks: '', status: 'Not Started' },
      { key: 'graduation', label: 'Graduation', plannedDate: '', actualDate: '', remarks: '', status: 'Not Started' }
    ],
    englishTest: {
      testName: '', dateTaken: '', scoreAchieved: '', requiredScore: '', status: 'Not Started', evidence: ''
    },
    englishActivities: [],
    englishReflection: '',
    completedCourses: [],
    keyLearnings: [],
    workshops: [],
    dissertationInfo: {
      title: '', background: '', problem: '', objectives: '', hypotheses: '', conceptualFramework: '', methodology: '', researchTopic: ''
    },
    dissertationProgress: [],
    advisorMeetings: [],
    ethicsGovernance: {
      dateApplied: '', dateApproved: '', approvalNumber: '', amendments: '', confidentiality: ''
    },
    researchExperience: [],
    researchReflection: '',
    conferencePresentations: [],
    publications: [],
    manuscripts: [],
    grants: [],
    awards: [],
    teachingExperiences: [],
    supervisions: [],
    academicServices: [],
    leaderships: [],
    competencySelfAssessment: [
      { competency: 'Advanced disciplinary knowledge', rating: 'Beginning', remarks: '' },
      { competency: 'Critical analysis and synthesis', rating: 'Beginning', remarks: '' },
      { competency: 'Research design and methodology', rating: 'Beginning', remarks: '' },
      { competency: 'Data analysis', rating: 'Beginning', remarks: '' },
      { competency: 'Academic writing', rating: 'Beginning', remarks: '' },
      { competency: 'English communication for academic purposes', rating: 'Beginning', remarks: '' },
      { competency: 'Scholarly presentation', rating: 'Beginning', remarks: '' },
      { competency: 'Teaching ability', rating: 'Beginning', remarks: '' },
      { competency: 'Leadership', rating: 'Beginning', remarks: '' },
      { competency: 'Ethical conduct in research', rating: 'Beginning', remarks: '' },
      { competency: 'Professionalism', rating: 'Beginning', remarks: '' },
      { competency: 'Collaboration and networking', rating: 'Beginning', remarks: '' },
      { competency: 'Lifelong learning and self-development', rating: 'Beginning', remarks: '' }
    ],
    annualReview: {
      achievements: '', improvements: '', actionPlans: []
    },
    futureCareer: {
      shortTerm: '', longTerm: '', preparation: ''
    },
    advisorComments: '',
    endorsements: [],
    supportingFiles: []
  };
}
