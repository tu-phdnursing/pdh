const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const forgotModal = `
      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-fade-in relative">
            <button 
              onClick={() => {
                setShowForgotPassword(false);
                setForgotPasswordStatus('idle');
                setForgotPasswordEmail('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Forgot Password?</h3>
            <p className="text-sm text-gray-500 mb-6">Enter your registered email. We will send your username and password to this address.</p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setForgotPasswordStatus('sending');
              try {
                const res = await fetch(\`\${apiUrl}?action=forgotPassword&email=\${encodeURIComponent(forgotPasswordEmail)}\`, {
                  method: 'GET'
                });
                const result = await res.json();
                if (result.success) {
                  setForgotPasswordStatus('success');
                } else {
                  setForgotPasswordStatus('failed');
                }
              } catch (e) {
                setForgotPasswordStatus('failed');
              }
            }} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Registered Email</label>
                <input
                  type="email"
                  required
                  value={forgotPasswordEmail}
                  onChange={e => setForgotPasswordEmail(e.target.value)}
                  placeholder="student@domain.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  disabled={forgotPasswordStatus === 'sending' || forgotPasswordStatus === 'success'}
                />
              </div>

              {forgotPasswordStatus === 'failed' && (
                <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-lg border border-red-100 flex items-start gap-2">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>Email not found or error occurred. Please try again.</span>
                </div>
              )}
              
              {forgotPasswordStatus === 'success' && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-100 flex items-start gap-2">
                  <CheckCircle size={14} className="mt-0.5 shrink-0" />
                  <span>Password sent successfully to your email. Please check your inbox!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={forgotPasswordStatus === 'sending' || forgotPasswordStatus === 'success'}
                className="w-full bg-tu-red hover:bg-red-800 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition cursor-pointer"
              >
                {forgotPasswordStatus === 'sending' ? 'Sending...' : forgotPasswordStatus === 'success' ? 'Sent!' : 'Send Password'}
              </button>
            </form>
          </div>
        </div>
      )}
`;

content = content.replace('{/* Application Main View */}', forgotModal + '\n      {/* Application Main View */}');
fs.writeFileSync('src/App.tsx', content);
console.log("Done");
