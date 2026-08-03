const fs = require('fs');
let content = fs.readFileSync('src/components/FileUploader.tsx', 'utf8');

const replacement = `      {/* Uploaded File List */}
      {safeFiles.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {safeFiles.map((file, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition text-xs shadow-xs"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Paperclip size={12} className="text-tu-red shrink-0" />
                <span className="text-[11px] font-medium text-gray-700 truncate" title={file.name}>
                  {file.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 ml-2 shrink-0">
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noreferrer referrer" 
                  className="p-1 text-gray-400 hover:text-tu-red hover:bg-gray-50 rounded-md transition"
                  title="Open file in new tab"
                >
                  <ExternalLink size={12} />
                </a>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition"
                  title="Remove attachment"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      <div 
        onClick={triggerFileInput}
        className={\`mt-2 border border-dashed border-gray-300 hover:border-tu-red/60 rounded-xl bg-gray-50/50 p-2.5 transition duration-200 cursor-pointer text-center flex flex-col items-center justify-center space-y-1.5 \${
          isUploading ? 'pointer-events-none opacity-80' : ''
        }\`}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple 
          accept={accept} 
          className="hidden" 
        />
        {isUploading ? (
          <>
            <Loader2 size={16} className="animate-spin text-tu-red" />
            <span className="text-[10px] font-semibold text-gray-600">Uploading attachment to Google Drive...</span>
            <span className="text-[9px] text-gray-400 leading-none">Saving into student folder</span>
          </>
        ) : (
          <>
            <Upload size={16} className="text-gray-400" />
            <span className="text-[10px] font-semibold text-gray-700">Attach file (Click or Drag & Drop)</span>
            <span className="text-[9px] text-gray-400 leading-none">Max {maxFiles} files</span>
          </>
        )}
      </div>

      {error && (
        <div className="text-[10px] text-red-500 font-semibold bg-red-50 p-2 rounded-lg flex items-center gap-1">
          <AlertCircle size={12} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}`;

content = content.replace(/\{\/\* Uploaded File List \*\/\}[\s\S]*\}\s*<\/div>\s*\);\s*\}/g, replacement);

fs.writeFileSync('src/components/FileUploader.tsx', content);
console.log("Done");
