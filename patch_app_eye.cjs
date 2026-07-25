const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const stateTarget = `  const [loginError, setLoginError] = useState('');`;
const stateReplace = `  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState<'idle' | 'sending' | 'success' | 'failed'>('idle');`;

if (!content.includes('showLoginPassword')) {
  content = content.replace(stateTarget, stateReplace);
}

const loginPwdTarget = `<input
                    type="password"
                    placeholder="Enter your personal access code"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tu-red/50 focus:border-transparent text-sm transition"
                    required
                  />`;

const loginPwdReplace = `<div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Enter your personal access code"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tu-red/50 focus:border-transparent text-sm transition pr-10"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showLoginPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>`;
content = content.replace(loginPwdTarget, loginPwdReplace);

const regPwdTarget = `<input
                      type="password"
                      placeholder="Create a strong password"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                      required
                    />`;
const regPwdReplace = `<div className="relative">
                      <input
                        type={showRegPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm pr-10"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showRegPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </div>`;
content = content.replace(regPwdTarget, regPwdReplace);

const loginBtnsTarget = `<button
                    type="submit"
                    className="w-full bg-tu-red hover:bg-red-800 text-white font-bold py-3.5 px-6 rounded-xl transition duration-200 cursor-pointer"
                  >
                    Log In to Portfolio &rarr;
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setIsRegistering(true)}
                      className="text-sm font-bold text-tu-red hover:underline flex items-center justify-center gap-1.5 w-full cursor-pointer"
                    >
                      <UserPlus size={16} />
                      Don't have an account? Sign Up / Register
                    </button>
                  </div>`;
const loginBtnsReplace = `<button
                    type="submit"
                    className="w-full bg-tu-red hover:bg-red-800 text-white font-bold py-3.5 px-6 rounded-xl transition duration-200 cursor-pointer shadow-md"
                  >
                    Log In to Portfolio &rarr;
                  </button>

                  <div className="flex flex-col items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs font-semibold text-gray-500 hover:text-tu-red hover:underline cursor-pointer"
                    >
                      Forgot your password?
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsRegistering(true)}
                      className="text-sm font-bold text-tu-red hover:underline flex items-center justify-center gap-1.5 w-full cursor-pointer"
                    >
                      <UserPlus size={16} />
                      Don't have an account? Sign Up / Register
                    </button>
                  </div>`;
content = content.replace(loginBtnsTarget, loginBtnsReplace);

fs.writeFileSync('src/App.tsx', content);
console.log("Done");
