const fs = require('fs');

function findMatchingBraceEnd(str, startIdx) {
  let count = 0;
  for (let i = startIdx; i < str.length; i++) {
    if (str[i] === '{') count++;
    else if (str[i] === '}') {
      count--;
      if (count === 0) return i;
    }
  }
  return -1;
}

function processFile() {
  let content = fs.readFileSync('src/components/EditPortfolio.tsx', 'utf8');

  const replacements = [
    {
      marker: '{formData.academicBackground.map((item, idx) => (',
      prop: 'academicBackground',
      columns: `[
        { header: 'Degree Name', key: 'degree' },
        { header: 'Field of Study', key: 'field' },
        { header: 'Institution', key: 'institution' },
        { header: 'Graduation Year', key: 'year' }
      ]`
    },
    {
      marker: '{formData.professionalBackground.map((item, idx) => (',
      prop: 'professionalBackground',
      columns: `[
        { header: 'Position', key: 'position' },
        { header: 'Institution / Organization', key: 'institution' },
        { header: 'Years', key: 'years' }
      ]`
    },
    {
      marker: '{formData.milestones.map((milestone, idx) => (',
      prop: 'milestones',
      columns: `[
        { header: 'Milestone', key: 'name' },
        { header: 'Target Date', key: 'date' },
        { header: 'Status', key: 'status', render: (val) => <span className={'px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ' + (val.status === 'Completed' ? 'bg-green-100 text-green-700' : val.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700')}>{val.status}</span> }
      ]`
    },
    {
      marker: '{(formData.learningPlans || []).map((plan, idx) => (',
      prop: 'learningPlans',
      columns: `[
        { header: 'Competency Area', key: 'competency' },
        { header: 'Description', key: 'description' },
        { header: 'Activities', key: 'activities' },
        { header: 'Target Date', key: 'targetDate' },
        { header: 'Status', key: 'status', render: (val) => <span className={'px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ' + (val.status === 'Completed' ? 'bg-green-100 text-green-700' : val.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700')}>{val.status}</span> }
      ]`
    },
    {
      marker: '{(formData.dissertationProgress || []).map((prog, idx) => {',
      prop: 'dissertationProgress',
      columns: `[
        { header: 'Activity / Milestone', key: 'activity' },
        { header: 'Date', key: 'date' },
        { header: 'Progress', key: 'progress' },
        { header: 'Obstacles / Solutions', key: 'obstacles' }
      ]`
    },
    {
      marker: '{formData.advisorMeetings.map((meet, idx) => (',
      prop: 'advisorMeetings',
      columns: `[
        { header: 'Meeting Date', key: 'date' },
        { header: 'Topic(s) Discussed', key: 'topic' },
        { header: 'Summary of Advice / Outcomes', key: 'summary' },
        { header: 'Next Steps', key: 'nextSteps' }
      ]`
    },
    {
      marker: '{formData.researchExperience.map((item, idx) => (',
      prop: 'researchExperience',
      columns: `[
        { header: 'Research Title', key: 'title' },
        { header: 'Role', key: 'role' },
        { header: 'Year', key: 'year' },
        { header: 'Funding', key: 'funding' }
      ]`
    },
    {
      marker: '{(formData.publications || []).map((pub, idx) => (',
      prop: 'publications',
      columns: `[
        { header: 'Publication Type', key: 'type' },
        { header: 'Title', key: 'title' },
        { header: 'Authors', key: 'authors' },
        { header: 'Journal / Publisher', key: 'journal' },
        { header: 'Year', key: 'year' },
        { header: 'Quartile / Impact', key: 'quartile' }
      ]`
    },
    {
      marker: '{(formData.teachingExperiences || []).map((tch, idx) => (',
      prop: 'teachingExperiences',
      columns: `[
        { header: 'Course Name', key: 'course' },
        { header: 'Program Level', key: 'level' },
        { header: 'Role', key: 'role' },
        { header: 'Year / Semester', key: 'year' },
        { header: 'Hours', key: 'hours' }
      ]`
    },
    {
      marker: '{(formData.academicServices || []).map((srv, idx) => (',
      prop: 'academicServices',
      columns: `[
        { header: 'Activity / Event', key: 'activity' },
        { header: 'Role', key: 'role' },
        { header: 'Date', key: 'date' },
        { header: 'Organization', key: 'organization' }
      ]`
    },
    {
      marker: '{(formData.awards || []).map((aw, idx) => (',
      prop: 'awards',
      columns: `[
        { header: 'Award / Scholarship', key: 'award' },
        { header: 'Organization', key: 'organization' },
        { header: 'Year', key: 'year' }
      ]`
    }
  ];

  for (const repl of replacements) {
    const startIdx = content.indexOf(repl.marker);
    if (startIdx === -1) {
      console.log("NOT FOUND: " + repl.marker);
      continue;
    }
    const blockStartIdx = content.lastIndexOf('{', startIdx);
    const endIdx = findMatchingBraceEnd(content, blockStartIdx);
    if (endIdx === -1) {
      console.log("NO MATCHING BRACE: " + repl.marker);
      continue;
    }

    const originalBlock = content.substring(blockStartIdx, endIdx + 1);
    
    // We replace the original block with a ternary
    const newBlock = "{isReadOnly ? (\\n" +
      "      <ReadOnlyTable data={formData." + repl.prop + " || []} columns={" + repl.columns + "} />\\n" +
      "    ) : (\\n      " + originalBlock.substring(1, originalBlock.length - 1) + "\\n    )}";

    content = content.substring(0, blockStartIdx) + newBlock + content.substring(endIdx + 1);
  }

  fs.writeFileSync('src/components/EditPortfolio.tsx', content.replace(/\\n/g, '\n'));
  console.log("Done replacing arrays.");
}

processFile();
