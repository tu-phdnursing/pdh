import React, { useState, useRef } from 'react';
import { Upload, Trash2, ExternalLink, Loader2, Paperclip, AlertCircle } from 'lucide-react';
import { uploadFileToDrive } from '../lib/googleSheets';

export interface AttachedFile {
  name: string;
  url: string;
}

interface FileUploaderProps {
  label?: string;
  files: AttachedFile[] | undefined | null;
  onChange: (files: AttachedFile[]) => void;
  studentId: string;
  studentName: string;
  uploaderId: string;
  uploaderRole: string;
  maxFiles?: number;
  accept?: string;
  isReadOnly?: boolean;
}

export default function FileUploader({
  label,
  files = [],
  onChange,
  studentId,
  studentName,
  uploaderId,
  uploaderRole,
  maxFiles = 10,
  accept = "*/*",
  isReadOnly = false
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const safeFiles = Array.isArray(files) ? files : [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || isReadOnly) return;
    
    setError(null);
    const chosenFiles: File[] = Array.from(e.target.files) as File[];
    
    if (safeFiles.length + chosenFiles.length > maxFiles) {
      setError(`Maximum file limit reached (${maxFiles} files allowed)`);
      return;
    }

    setIsUploading(true);
    try {
      const updatedFiles = [...safeFiles];
      
      for (const file of chosenFiles) {
        const result = await uploadFileToDrive(
          file,
          studentId,
          studentName,
          uploaderId,
          uploaderRole
        );
        if (result.success && result.fileUrl && result.fileName) {
          updatedFiles.push({
            name: result.fileName,
            url: result.fileUrl
          });
        } else {
          setError(result.error || `Failed to upload "${file.name}"`);
        }
      }
      onChange(updatedFiles);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    if (isReadOnly) return;
    const updated = safeFiles.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const triggerFileInput = () => {
    if (!isReadOnly) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
          {label}
        </span>
      )}
      
      {/* Uploaded File List */}
      {safeFiles.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {safeFiles.map((file, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition text-xs shadow-sm"
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
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition"
                    title="Remove attachment"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      {!isReadOnly && safeFiles.length < maxFiles && (
        <div 
          onClick={triggerFileInput}
          className={`mt-2 border-2 border-dashed border-gray-300 hover:border-tu-red/60 rounded-xl bg-gray-50 hover:bg-red-50/30 p-4 transition-all duration-200 cursor-pointer text-center flex flex-col items-center justify-center space-y-2 shadow-sm ${
            isUploading ? 'pointer-events-none opacity-80' : ''
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple={maxFiles > 1}
            accept={accept} 
            className="hidden" 
          />
          {isUploading ? (
            <>
              <Loader2 size={18} className="animate-spin text-tu-red" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-700">Uploading...</span>
                <span className="text-[10px] text-gray-500 mt-0.5">Please wait</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100 text-tu-red">
                <Upload size={16} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-gray-700">Click to attach file</span>
                <span className="text-[10px] text-gray-500 font-medium">Max {maxFiles} file(s)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-[10px] text-red-500 font-semibold bg-red-50 p-2 rounded-lg flex items-center gap-1">
          <AlertCircle size={12} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
