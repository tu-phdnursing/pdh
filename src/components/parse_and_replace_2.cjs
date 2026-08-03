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
      marker: '{formData.completedCourses.map((course, idx) => {',
      prop: 'completedCourses',
      columns: `[
        { header: 'Semester / Year', key: 'semester' },
        { header: 'Course Code', key: 'code' },
        { header: 'Course Title', key: 'title' },
        { header: 'Grade', key: 'grade' },
        { header: 'Credits', key: 'credits' }
      ]`
    },
    {
      marker: '{(formData.keyLearnings || []).map((kl, idx) => (',
      prop: 'keyLearnings',
      columns: `[
        { header: 'Subject / Topic', key: 'subject' },
        { header: 'Key Learning Points', key: 'learning' }
      ]`
    },
    {
      marker: '{(formData.workshops || []).map((ws, idx) => (',
      prop: 'workshops',
      columns: `[
        { header: 'Date', key: 'date' },
        { header: 'Workshop / Training Topic', key: 'topic' },
        { header: 'Organizer', key: 'organizer' }
      ]`
    },
    {
      marker: '{(formData.conferencePresentations || []).map((conf, idx) => (',
      prop: 'conferencePresentations',
      columns: `[
        { header: 'Date', key: 'date' },
        { header: 'Conference Name', key: 'conference' },
        { header: 'Title of Presentation', key: 'title' },
        { header: 'Level', key: 'level' }
      ]`
    },
    {
      marker: '{(formData.manuscripts || []).map((msc, idx) => (',
      prop: 'manuscripts',
      columns: `[
        { header: 'Date', key: 'date' },
        { header: 'Title', key: 'title' },
        { header: 'Target Journal', key: 'journal' },
        { header: 'Status', key: 'status' }
      ]`
    },
    {
      marker: '{(formData.grants || []).map((gr, idx) => (',
      prop: 'grants',
      columns: `[
        { header: 'Year', key: 'year' },
        { header: 'Grant Name / Source', key: 'name' },
        { header: 'Amount', key: 'amount' },
        { header: 'Role', key: 'role' }
      ]`
    },
    {
      marker: '{formData.competencySelfAssessment.map((comp, idx) => (',
      prop: 'competencySelfAssessment',
      columns: `[
        { header: 'Competency Area', key: 'area' },
        { header: 'Score (1-5)', key: 'score' },
        { header: 'Evidence / Example', key: 'evidence' }
      ]`
    },
    {
      marker: '{(formData.supervisions || []).map((sup, idx) => (',
      prop: 'supervisions',
      columns: `[
        { header: 'Student Name / Level', key: 'student' },
        { header: 'Topic / Thesis Title', key: 'topic' },
        { header: 'Role', key: 'role' },
        { header: 'Year', key: 'year' }
      ]`
    },
    {
      marker: '{(formData.leaderships || []).map((ldr, idx) => (',
      prop: 'leaderships',
      columns: `[
        { header: 'Role / Position', key: 'role' },
        { header: 'Organization / Committee', key: 'organization' },
        { header: 'Year(s)', key: 'year' },
        { header: 'Key Contributions', key: 'contribution' }
      ]`
    }
  ];

  for (const repl of replacements) {
    let startIdx = content.indexOf(repl.marker);
    if (startIdx === -1) {
      console.log("NOT FOUND: " + repl.marker);
      // fallback search with space variations
      continue;
    }
    const blockStartIdx = content.lastIndexOf('{', startIdx);
    const endIdx = findMatchingBraceEnd(content, blockStartIdx);
    if (endIdx === -1) {
      console.log("NO MATCHING BRACE: " + repl.marker);
      continue;
    }

    const originalBlock = content.substring(blockStartIdx, endIdx + 1);
    
    const newBlock = "{isReadOnly ? (\\n" +
      "      <ReadOnlyTable data={formData." + repl.prop + " || []} columns={" + repl.columns + "} />\\n" +
      "    ) : (\\n      " + originalBlock.substring(1, originalBlock.length - 1) + "\\n    )}";

    content = content.substring(0, blockStartIdx) + newBlock + content.substring(endIdx + 1);
  }

  fs.writeFileSync('src/components/EditPortfolio.tsx', content.replace(/\\n/g, '\n'));
  console.log("Done replacing arrays part 2.");
}

processFile();
