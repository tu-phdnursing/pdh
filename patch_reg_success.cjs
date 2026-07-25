const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `    try {
      await saveUser(newUser);
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setActiveTab('dashboard');
      setIsRegistering(false);
      logActivity(newUser.UserID, 'REGISTER', \`New user \${newUser.FullName} registered as \${newUser.Role}\`);
    } catch (err: any) {`;

const replace = `    try {
      await saveUser(newUser);
      setUsers(prev => [...prev, newUser]);
      
      // Trigger Welcome Email
      try {
        await fetch(\`\${apiUrl}?action=registerEmail&email=\${encodeURIComponent(newUser.Email)}&password=\${encodeURIComponent(newUser.Password || '')}&name=\${encodeURIComponent(newUser.FullName)}\`, {
          method: 'GET'
        });
      } catch (e) {
        // ignore email errors
      }

      alert('Registration Successful! We have sent a welcome email with your login link.');
      
      setCurrentUser(newUser);
      setActiveTab('dashboard');
      setIsRegistering(false);
      logActivity(newUser.UserID, 'REGISTER', \`New user \${newUser.FullName} registered as \${newUser.Role}\`);
    } catch (err: any) {`;

content = content.replace(target, replace);
fs.writeFileSync('src/App.tsx', content);
console.log("Done");
