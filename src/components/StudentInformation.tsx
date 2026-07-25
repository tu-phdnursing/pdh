/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Certificate, Activity, ConfigOption, StudentPortfolioData } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, Award, Image as ImageIcon, Plus, Edit2, CheckCircle2, AlertCircle, Trash2, ExternalLink, Calendar, PlusCircle, Check, Loader2, HeartHandshake, Paperclip, X, FileText } from 'lucide-react';
import FileUploader, { AttachedFile } from './FileUploader';
import DatePickerField from './DatePickerField';
import EditPortfolio from './EditPortfolio';
import PrintReport from './PrintReport';
import { getAppsScriptUrl, uploadFileToDrive, resolvePhotoUrl, resolveFileUrl, formatDisplayDate } from '../lib/googleSheets';

interface StudentInformationProps {
  currentUser: User;
  certificates: Certificate[];
  activities: Activity[];
  portfolioData?: StudentPortfolioData | null;
  configOptions: ConfigOption[];
  onUpdateProfile: (updatedProfile: User) => Promise<void>;
  onAddCertificate: (cert: Certificate) => Promise<void>;
  onAddActivity: (act: Activity) => Promise<void>;
  onDeleteCertificate?: (certId: string) => Promise<void>;
  onDeleteActivity?: (actId: string) => Promise<void>;
  isReadOnly?: boolean;
}

// Helper to compress image down to max 800px width/height and JPEG format with 0.75 quality for space saving
const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.75): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function StudentInformation({
  currentUser,
  certificates,
  activities,
  portfolioData,
  configOptions,
  onUpdateProfile,
  onAddCertificate,
  onAddActivity,
  onDeleteCertificate,
  onDeleteActivity,
  isReadOnly = false
}: StudentInformationProps) {
  const [activeSubTab, setActiveSubTab] = useState<'demographics' | 'certificates' | 'activities' | 'portfolio' | 'report'>('demographics');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Additional Photos states
  const safeParsePhotos = (photos: any): string[] => {
    if (Array.isArray(photos)) return photos;
    if (typeof photos === 'string' && photos.trim()) {
      try {
        const parsed = JSON.parse(photos);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  };

  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>(safeParsePhotos(currentUser.AdditionalPhotos));
  const [isUploadingAdditional, setIsUploadingAdditional] = useState(false);
  const [selectedFullImage, setSelectedFullImage] = useState<string | null>(null);
  
  // Forms state
  const [profileForm, setProfileForm] = useState<User>({ ...currentUser });
  const [certFiles, setCertFiles] = useState<AttachedFile[]>([]);
  const [actFiles, setActFiles] = useState<AttachedFile[]>([]);

  const [newCertForm, setNewCertForm] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    imageUrl: ''
  });
  const [newActForm, setNewActForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    images: [] as string[]
  });

  React.useEffect(() => {
    setProfileForm({ ...currentUser });
    setAdditionalPhotos(safeParsePhotos(currentUser.AdditionalPhotos));
  }, [currentUser]);

  // Filter dynamic dropdown list options from dynamic ConfigOptions
  const advisorOptions = configOptions.filter(c => c.OptionType.trim() === 'ADVISOR').map(c => c.OptionValue);
  const coAdvisorOptions = configOptions.filter(c => c.OptionType.trim() === 'CO_ADVISOR').map(c => c.OptionValue);
  const certCategoryOptions = configOptions.filter(c => c.OptionType.trim() === 'CERT_CATEGORY').map(c => c.OptionValue);
  const degreeOptions = configOptions.filter(c => c.OptionType.trim() === 'DEGREE').map(c => c.OptionValue);

  // Profile save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    const updatedProfile = { ...profileForm, AdditionalPhotos: additionalPhotos };
    await onUpdateProfile(updatedProfile);
    setIsEditingProfile(false);
    setIsUploading(false);
  };

  // Actual Google Drive image upload with local base64 fallback
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);
    const file = e.target.files[0];

    try {
      // Compress the image before uploading to save tons of storage space!
      const compressedFile = await compressImage(file, 800, 800, 0.75);

      // Read local file as Data URL first
      const localUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(compressedFile);
      });

      // Update local state instantly with base64 first to keep it super responsive
      setProfileForm(prev => ({ ...prev, PhotoURL: localUrl }));

      // Attempt to upload to Drive if Apps Script is configured
      const scriptUrl = getAppsScriptUrl();
      if (scriptUrl) {
        const result = await uploadFileToDrive(
          compressedFile,
          currentUser.StudentID || '6601010024',
          currentUser.FullName || 'Student',
          currentUser.UserID,
          currentUser.Role
        );
        if (result.success && result.fileUrl) {
          setProfileForm(prev => ({ ...prev, PhotoURL: result.fileUrl }));
          if (result.fileUrl.startsWith('LOCAL_FILE_')) {
            setUploadError(
              '⚠️ อัปโหลดลง Google Drive ล้มเหลว (รูปถูกบันทึกไว้เฉพาะในบราวเซอร์นี้ชั่วคราว) ' +
              'กรุณาตรวจสอบว่าท่านได้อัปเดตและกดยืนยันสิทธิ์ (Authorize) ใน Google Apps Script เรียบร้อยแล้ว (ดูวิธีด้านล่างที่แถบช่วยเหลือ)'
            );
          }
        } else {
          setUploadError('⚠️ การอัปโหลดไฟล์ขัดข้อง กรุณาตรวจสอบการเชื่อมต่อ Apps Script');
        }
      } else {
        setUploadError('⚠️ ไม่พบ Apps Script URL รูปภาพจะถูกเก็บเฉพาะในอุปกรณ์นี้เท่านั้น');
      }
    } catch (err: any) {
      console.error('Failed uploading profile image:', err);
      setUploadError(`⚠️ เกิดข้อผิดพลาดในการอัปโหลด: ${err.message || err}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle upload of additional photos
  const handleAdditionalPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (additionalPhotos.length >= 4) {
      setUploadError('⚠️ สามารถอัปโหลดรูปภาพได้สูงสุด 4 รูปเท่านั้น');
      return;
    }

    setIsUploadingAdditional(true);
    setUploadError(null);
    const file = e.target.files[0];

    try {
      // Compress the image before uploading to save tons of storage space!
      const compressedFile = await compressImage(file, 800, 800, 0.75);

      // Read local file as Data URL first
      const localUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(compressedFile);
      });

      // Update local state instantly with base64 first to keep it super responsive
      const updatedPhotos = [...additionalPhotos, localUrl];
      setAdditionalPhotos(updatedPhotos);
      setProfileForm(prev => ({ ...prev, AdditionalPhotos: updatedPhotos }));

      // Attempt to upload to Drive if Apps Script is configured
      const scriptUrl = getAppsScriptUrl();
      if (scriptUrl) {
        const result = await uploadFileToDrive(
          compressedFile,
          currentUser.StudentID || '6601010024',
          currentUser.FullName || 'Student',
          currentUser.UserID,
          currentUser.Role
        );
        if (result.success && result.fileUrl) {
          // Replace base64 URL with final Google Drive URL
          setAdditionalPhotos(prev => {
            const index = prev.indexOf(localUrl);
            const nextPhotos = [...prev];
            if (index !== -1) {
              nextPhotos[index] = result.fileUrl!;
            } else {
              nextPhotos.push(result.fileUrl!);
            }
            setProfileForm(p => ({ ...p, AdditionalPhotos: nextPhotos }));
            return nextPhotos;
          });
        } else {
          setUploadError('⚠️ การอัปโหลดไฟล์เพิ่มเติมขัดข้อง รูปที่อัปโหลดจะเก็บชั่วคราวในเครื่องนี้');
        }
      }
    } catch (err: any) {
      console.error('Failed uploading additional photo:', err);
      setUploadError(`⚠️ เกิดข้อผิดพลาดในการอัปโหลดรูปเพิ่มเติม: ${err.message || err}`);
    } finally {
      setIsUploadingAdditional(false);
    }
  };

  // Handle remove of additional photos
  const handleRemoveAdditionalPhoto = (idx: number) => {
    const nextPhotos = additionalPhotos.filter((_, i) => i !== idx);
    setAdditionalPhotos(nextPhotos);
    setProfileForm(prev => ({ ...prev, AdditionalPhotos: nextPhotos }));
  };

  // Add Certificate
  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertForm.name || !newCertForm.category) return;

    const newCert: Certificate = {
      CertID: `CERT-${Date.now()}`,
      StudentID: currentUser.StudentID || '6601010024',
      Name: newCertForm.name,
      Date: newCertForm.date,
      Category: newCertForm.category,
      ImageURL: certFiles.length > 0 ? JSON.stringify(certFiles) : 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80',
      Status: 'PENDING'
    };

    await onAddCertificate(newCert);
    
    // Reset form
    setNewCertForm({
      name: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      imageUrl: ''
    });
    setCertFiles([]);
  };

  // Add Activity Progress (Collage)
  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActForm.title || !newActForm.description) return;

    const newAct: Activity = {
      ActivityID: `ACT-${Date.now()}`,
      StudentID: currentUser.StudentID || '6601010024',
      Title: newActForm.title,
      Date: newActForm.date,
      Description: newActForm.description,
      ImagesURL: actFiles.length > 0 ? actFiles.map(f => ({ name: f.name, url: f.url })) : [
        'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80'
      ],
      Status: 'PENDING'
    };

    await onAddActivity(newAct);

    // Reset Form
    setNewActForm({
      title: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      images: []
    });
    setActFiles([]);
  };

  return (
    <div className="space-y-6">
      {/* Overdue Alerts */}
      {(() => {
        if (!portfolioData || !portfolioData.dissertationProgress) return null;
        
        const overdue = [];
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;

        portfolioData.dissertationProgress.forEach(prog => {
          if (prog.progress === 'Completed') return;
          if (!prog.date) return;
          
          const [y, m] = prog.date.split('-');
          if (y && m) {
            const year = parseInt(y, 10);
            const month = parseInt(m, 10);
            if (year < currentYear || (year === currentYear && month < currentMonth)) {
              overdue.push({
                activity: prog.activity,
                date: prog.date
              });
            }
          }
        });

        if (overdue.length === 0) return null;

        return (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-red-800 flex items-center gap-1.5 mb-2">
              <AlertCircle size={16} />
              Important: Overdue Dissertation Milestones
            </h3>
            <ul className="space-y-1 list-disc pl-8">
              {overdue.map((od, idx) => (
                <li key={idx} className="text-xs text-red-700">
                  <span className="font-semibold">{od.activity}</span> (Target: {od.date})
                </li>
              ))}
            </ul>
          </div>
        );
      })()}

      {/* Subtab selection */}
      <div className="flex border-b border-gray-200 no-print">
        <button
          onClick={() => setActiveSubTab('demographics')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-all duration-200 cursor-pointer ${
            activeSubTab === 'demographics'
              ? 'border-tu-red text-tu-red'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <UserIcon size={16} />
          {currentUser.Role === 'STUDENT' ? 'Student Demographics' : 'Personal Information'}
        </button>
        {(!isReadOnly && currentUser.Role === 'STUDENT') && (
          <>
            <button
              onClick={() => setActiveSubTab('certificates')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-all duration-200 cursor-pointer ${
                activeSubTab === 'certificates'
                  ? 'border-tu-red text-tu-red'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Award size={16} />
              My Certificates Portfolio
            </button>
            <button
              onClick={() => setActiveSubTab('activities')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-all duration-200 cursor-pointer ${
                activeSubTab === 'activities'
                  ? 'border-tu-red text-tu-red'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <ImageIcon size={16} />
              Activities Progress (Collage)
            </button>
          </>
        )}
        {(isReadOnly && portfolioData && currentUser.Role === 'STUDENT') && (
          <>
            <button
              onClick={() => setActiveSubTab('portfolio')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-all duration-200 cursor-pointer ${
                activeSubTab === 'portfolio'
                  ? 'border-tu-red text-tu-red'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <FileText size={16} />
              Full Portfolio (16 Sections)
            </button>
            <button
              onClick={() => setActiveSubTab('report')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-all duration-200 cursor-pointer ${
                activeSubTab === 'report'
                  ? 'border-tu-red text-tu-red'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <FileText size={16} />
              View Report (Print PDF)
            </button>
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* ----------------------------------------------------------------- */}
        {/* DEMOGRAPHICS SUBTAB */}
        {/* ----------------------------------------------------------------- */}
        {activeSubTab === 'demographics' && (
          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Side: Avatar and Quick Metadata */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                <img
                  src={resolvePhotoUrl(profileForm.PhotoURL)}
                  alt="Profile Photo"
                  className="w-36 h-36 rounded-2xl object-cover ring-4 ring-red-50"
                />
                {isEditingProfile && (
                  <label className="absolute inset-0 bg-black/50 hover:bg-black/60 cursor-pointer rounded-2xl flex flex-col items-center justify-center text-white text-xs transition duration-200">
                    <ImageIcon size={20} className="mb-1" />
                    <span>Upload Photo</span>
                    <span className="text-[9px] opacity-75">Saves directly to Drive</span>
                    <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                  </label>
                )}
              </div>

              {uploadError && (
                <div className="w-full text-left bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-xl flex items-start gap-1.5 text-[10px] leading-relaxed">
                  <AlertCircle size={14} className="shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900 block mb-0.5">แจ้งเตือนอัปโหลดลง Google Drive</span>
                    {uploadError}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-bold text-lg text-gray-900">{currentUser.FullName}</h3>
                {currentUser.Role === 'STUDENT' && (
                  <p className="text-sm text-gray-500 font-mono">ID: {currentUser.StudentID || 'Not specified'}</p>
                )}
                <p className="text-xs font-semibold text-tu-red bg-red-50 px-2.5 py-0.5 rounded-full mt-1.5 inline-block font-mono">
                  {currentUser.Role}
                </p>
              </div>

              <div className="w-full border-t border-gray-100 pt-4 space-y-3 text-left">
                <div className="text-xs">
                  <span className="text-gray-400 font-medium block">Registered Email</span>
                  <span className="text-gray-800 font-medium font-mono">{currentUser.Email}</span>
                </div>
                {currentUser.Role === 'STUDENT' && (
                  <>
                    <div className="text-xs">
                      <span className="text-gray-400 font-medium block">Year of Admission</span>
                      <span className="text-gray-800 font-medium font-mono">{currentUser.YearOfAdmission || 'Not specified'}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-400 font-medium block">Date of Submission</span>
                      <span className="text-gray-800 font-medium font-mono">{formatDisplayDate(currentUser.DateOfSubmission) || 'Not specified'}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Additional Photos Section */}
              <div className="w-full border-t border-gray-100 pt-4 text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-700 block">รูปภาพประกอบเพิ่มเติม (สูงสุด 4 รูป)</span>
                  {isEditingProfile && additionalPhotos.length < 4 && (
                    <label className="text-[11px] font-semibold text-tu-red hover:text-tu-red-hover flex items-center gap-1 cursor-pointer">
                      <Plus size={12} />
                      <span>เพิ่มรูป</span>
                      <input
                        type="file"
                        onChange={handleAdditionalPhotoUpload}
                        className="hidden"
                        accept="image/*"
                        disabled={isUploadingAdditional}
                      />
                    </label>
                  )}
                </div>

                {/* Grid of photos */}
                <div className="grid grid-cols-2 gap-2">
                  {additionalPhotos.map((url, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-150 bg-gray-50">
                      <img
                        src={resolvePhotoUrl(url)}
                        alt={`Additional ${idx + 1}`}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition duration-300"
                        onClick={() => setSelectedFullImage(url)}
                      />
                      {isEditingProfile && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAdditionalPhoto(idx)}
                          className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Empty placeholders */}
                  {Array.from({ length: 4 - additionalPhotos.length }).map((_, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-lg border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50"
                    >
                      <ImageIcon size={16} className="opacity-60 mb-1" />
                      <span className="text-[9px] opacity-75 font-medium font-mono">ว่าง</span>
                    </div>
                  ))}
                </div>

                {isUploadingAdditional && (
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-gray-500 font-medium">
                    <Loader2 size={12} className="animate-spin text-tu-red" />
                    <span>กำลังอัปโหลดและบีบอัดรูปภาพ...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Demographics Form / Detail view */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
                <h3 className="text-base font-bold text-gray-900">Academic Demographics & Records</h3>
                {!isReadOnly && (
                  !isEditingProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center gap-1 px-4 py-2 bg-tu-red hover:bg-tu-red-hover text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      <Edit2 size={12} />
                      Edit Profile Details
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setProfileForm({ ...currentUser });
                          setAdditionalPhotos(currentUser.AdditionalPhotos || []);
                          setIsEditingProfile(false);
                        }}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={isUploading}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        {isUploading && <Loader2 size={12} className="animate-spin" />}
                        Save Changes
                      </button>
                    </div>
                  )
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentUser.Role === 'STUDENT' && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Student ID</label>
                      <input
                        type="text"
                        disabled={!isEditingProfile}
                        value={profileForm.StudentID || ''}
                        onChange={e => setProfileForm({ ...profileForm, StudentID: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm disabled:opacity-75 focus:outline-tu-red font-mono"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Full Name (including title)</label>
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      value={profileForm.FullName || ''}
                      onChange={e => setProfileForm({ ...profileForm, FullName: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm disabled:opacity-75 focus:outline-tu-red"
                    />
                  </div>

                  {currentUser.Role === 'STUDENT' && (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Academic Major Program</label>
                        {isEditingProfile ? (
                          <select
                            value={profileForm.Major || ''}
                            onChange={e => setProfileForm({ ...profileForm, Major: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-tu-red"
                          >
                            <option value="">Select Major Program...</option>
                            {degreeOptions.length > 0 ? degreeOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            )) : (
                              <>
                                <option value="Doctor of Philosophy Program in Nursing Science (International Program)">PhD in Nursing Science (International Program)</option>
                                <option value="Doctor of Philosophy Program in Nursing Science (Thai Program)">PhD in Nursing Science (Thai Program)</option>
                              </>
                            )}
                          </select>
                        ) : (
                          <div className="px-3 py-2 bg-gray-50 border border-transparent rounded-xl text-sm font-medium text-gray-800">
                            {profileForm.Major || 'Not specified'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Year of Admission</label>
                        <input
                          type="text"
                          disabled={!isEditingProfile}
                          value={profileForm.YearOfAdmission || ''}
                          onChange={e => setProfileForm({ ...profileForm, YearOfAdmission: e.target.value })}
                          placeholder="e.g., 2025"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm disabled:opacity-75 focus:outline-tu-red"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Expected Graduation Year</label>
                        <input
                          type="text"
                          disabled={!isEditingProfile}
                          value={profileForm.ExpectedGraduationYear || ''}
                          onChange={e => setProfileForm({ ...profileForm, ExpectedGraduationYear: e.target.value })}
                          placeholder="e.g., 2029"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm disabled:opacity-75 focus:outline-tu-red"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Major Advisor</label>
                        {isEditingProfile ? (
                          <select
                            value={profileForm.Advisor || ''}
                            onChange={e => setProfileForm({ ...profileForm, Advisor: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-tu-red"
                          >
                            <option value="">Select Advisor...</option>
                            {advisorOptions.length > 0 ? advisorOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            )) : (
                              <option value="Assoc. Prof. Dr. Nonglak Wisetsilp">Assoc. Prof. Dr. Nonglak Wisetsilp</option>
                            )}
                          </select>
                        ) : (
                          <div className="px-3 py-2 bg-gray-50 border border-transparent rounded-xl text-sm font-medium text-gray-800">
                            {profileForm.Advisor || 'Not specified'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Co-Advisor</label>
                        {isEditingProfile ? (
                          <select
                            value={profileForm.CoAdvisor || ''}
                            onChange={e => setProfileForm({ ...profileForm, CoAdvisor: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-tu-red"
                          >
                            <option value="">Select Co-Advisor...</option>
                            {coAdvisorOptions.length > 0 ? coAdvisorOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            )) : (
                              <option value="Assoc. Prof. Dr. Wipa Chaichan">Assoc. Prof. Dr. Wipa Chaichan</option>
                            )}
                          </select>
                        ) : (
                          <div className="px-3 py-2 bg-gray-50 border border-transparent rounded-xl text-sm font-medium text-gray-800">
                            {profileForm.CoAdvisor || 'Not specified'}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Line ID</label>
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      value={profileForm.LineID || ''}
                      onChange={e => setProfileForm({ ...profileForm, LineID: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm disabled:opacity-75 focus:outline-tu-red font-mono"
                    />
                  </div>

                  {currentUser.Role === 'STUDENT' && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Date of Submission</label>
                      <DatePickerField
                        disabled={!isEditingProfile}
                        value={profileForm.DateOfSubmission || ''}
                        onChange={val => setProfileForm({ ...profileForm, DateOfSubmission: val })}
                        placeholder="e.g., May 16, 2026"
                      />
                    </div>
                  )}
                </div>

                {currentUser.Role === 'STUDENT' && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Thesis Title (Dissertation Draft)</label>
                    <textarea
                      disabled={!isEditingProfile}
                      rows={2}
                      value={profileForm.ThesisTitle || ''}
                      onChange={e => setProfileForm({ ...profileForm, ThesisTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm disabled:opacity-75 focus:outline-tu-red"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Personal Password / Access Code (รหัสผ่านเข้าสู่ระบบ)</label>
                  <input
                    type="password"
                    disabled={!isEditingProfile}
                    value={profileForm.Password || ''}
                    onChange={e => setProfileForm({ ...profileForm, Password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm disabled:opacity-75 focus:outline-tu-red font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Research Interests & Areas</label>
                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    value={profileForm.ResearchInterests || ''}
                    onChange={e => setProfileForm({ ...profileForm, ResearchInterests: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm disabled:opacity-75 focus:outline-tu-red"
                  />
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* CERTIFICATES SUBTAB */}
        {/* ----------------------------------------------------------------- */}
        {activeSubTab === 'certificates' && (
          <div
            className="space-y-6"
          >
            {/* Form to upload certificate */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5 mb-4">
                <PlusCircle size={18} className="text-tu-red" />
                Upload New Academic Certificate
              </h3>

              <form onSubmit={handleAddCert} className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Certificate Title / Course Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Advanced Statistics in Nursing Research Training"
                        value={newCertForm.name}
                        onChange={e => setNewCertForm({ ...newCertForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-tu-red"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Certificate Category</label>
                      <select
                        required
                        value={newCertForm.category}
                        onChange={e => setNewCertForm({ ...newCertForm, category: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-tu-red"
                      >
                        <option value="">Select Category...</option>
                        {certCategoryOptions.length > 0 ? certCategoryOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        )) : (
                          <>
                            <option value="English & Languages">English & Languages</option>
                            <option value="Research & Publications">Research & Publications</option>
                            <option value="Ethics & Governance">Ethics & Governance</option>
                            <option value="Academic Workshops">Academic Workshops</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Date Received</label>
                      <DatePickerField
                        required
                        value={newCertForm.date}
                        onChange={val => setNewCertForm({ ...newCertForm, date: val })}
                        placeholder="e.g., May 16, 2026"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Attach Certificate Files</label>
                      <FileUploader
                        studentId={currentUser.StudentID || '6601010024'}
                        studentName={currentUser.FullName || 'Student'}
                        uploaderId={currentUser.StudentID || '6601010024'}
                        uploaderRole="student"
                        files={certFiles}
                        onChange={setCertFiles}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-tu-red hover:bg-tu-red-hover text-white rounded-xl text-sm font-semibold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={16} />
                    Submit for Advisor Approval
                  </button>
                </div>
              </form>
            </div>

            {/* List certificates */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-700">Uploaded Academic Certificates</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {certificates
                  .filter(c => c.StudentID === currentUser.StudentID || currentUser.StudentID === '6601010024')
                  .map((cert) => (
                    <div key={cert.CertID} className="bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col justify-between shadow-xs">
                      {(() => {
                        let files: { name: string; url: string }[] = [];
                        if (cert.ImageURL) {
                          if (cert.ImageURL.trim().startsWith('[')) {
                            try {
                              files = JSON.parse(cert.ImageURL);
                            } catch(e) {
                              files = [{ name: cert.Name || 'Attachment', url: cert.ImageURL }];
                            }
                          } else {
                            files = [{ name: cert.Name || 'Attachment', url: cert.ImageURL }];
                          }
                        }
                        
                        const firstFile = files[0];
                        const isImg = firstFile && (/\.(png|jpe?g|gif|webp)$/i.test(firstFile.name) || firstFile.url.includes('images.unsplash.com') || firstFile.url.startsWith('LOCAL_FILE_'));
                        const coverUrl = isImg ? resolveFileUrl(firstFile.url) : 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80';
                        
                        return (
                          <>
                            <div className="relative h-44 bg-gray-100">
                              <img src={coverUrl} alt={cert.Name} className="w-full h-full object-cover" />
                              <div className="absolute top-3 right-3">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider shadow-sm flex items-center gap-1 ${
                                  cert.Status === 'APPROVED'
                                    ? 'bg-emerald-500 text-white'
                                    : cert.Status === 'REJECTED'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-amber-500 text-white'
                                }`}>
                                  {cert.Status === 'APPROVED' && <CheckCircle2 size={10} />}
                                  {cert.Status === 'REJECTED' && <AlertCircle size={10} />}
                                  {cert.Status}
                                </span>
                              </div>
                            </div>
                            
                            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between items-center text-center">
                              <div className="space-y-2 flex flex-col items-center">
                                <span className="text-[10px] uppercase font-bold text-tu-red block tracking-wider font-mono">
                                  {cert.Category}
                                </span>
                                <h4 className="text-[13px] font-semibold text-gray-800 line-clamp-3 leading-relaxed max-w-[280px]">
                                  {cert.Name}
                                </h4>
                                <div className="flex items-center gap-1.5 text-xs text-gray-400 justify-center">
                                  <Calendar size={12} />
                                  <span>Date Received: {formatDisplayDate(cert.Date)}</span>
                                </div>
                                
                                {files.length > 0 && (
                                  <div className="pt-2 border-t border-gray-100 space-y-1 w-full text-center">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Attachments ({files.length})</span>
                                    <div className="space-y-1 flex flex-col items-center">
                                      {files.map((file, i) => (
                                        <a
                                          key={i}
                                          href={resolveFileUrl(file.url)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1.5 text-xs text-tu-red hover:underline break-all"
                                        >
                                          <Paperclip size={12} className="shrink-0 text-gray-400" />
                                          <span className="truncate max-w-[180px]">{file.name}</span>
                                          <ExternalLink size={10} className="shrink-0" />
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {cert.Feedback && (
                                <div className="mt-3 p-2.5 w-full bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-600 space-y-1 text-left">
                                  <span className="font-semibold block text-gray-700">Feedback from Advisor ({cert.ApprovedBy || 'Advisor'}):</span>
                                  <p className="italic leading-normal text-[11px]">"{cert.Feedback}"</p>
                                </div>
                              )}
                              
                              {cert.Status === 'REJECTED' && onDeleteCertificate && (
                                <button
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this rejected certificate?')) {
                                      onDeleteCertificate(cert.CertID);
                                    }
                                  }}
                                  className="mt-3 w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                                >
                                  <Trash2 size={14} />
                                  Delete Certificate
                                </button>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* ACTIVITIES SUBTAB */}
        {/* ----------------------------------------------------------------- */}
        {activeSubTab === 'activities' && (
          <div
            className="space-y-6"
          >
            {/* Form to upload progress with collage images */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5 mb-4">
                <ImageIcon size={18} className="text-tu-red" />
                Record Doctoral Progress Activity
              </h3>

              <form onSubmit={handleAddActivity} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Activity Title / Description</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Seminar with Community Volunteers on Tele-Nursing Applications"
                      value={newActForm.title}
                      onChange={e => setNewActForm({ ...newActForm, title: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-tu-red"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Activity Date</label>
                    <DatePickerField
                      required
                      value={newActForm.date}
                      onChange={val => setNewActForm({ ...newActForm, date: val })}
                      placeholder="e.g., May 16, 2026"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Detailed Description</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Summarize key activity details, learning outcomes, and reflections..."
                    value={newActForm.description}
                    onChange={e => setNewActForm({ ...newActForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-tu-red"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 block">Upload Supporting Files (Images or Documents)</label>
                  <FileUploader
                    studentId={currentUser.StudentID || '6601010024'}
                    studentName={currentUser.FullName || 'Student'}
                    uploaderId={currentUser.StudentID || '6601010024'}
                    uploaderRole="student"
                    files={actFiles}
                    onChange={setActFiles}
                  />
                </div>

                <div className="text-right">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-tu-red hover:bg-tu-red-hover text-white rounded-xl text-sm font-semibold transition shadow-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                  >
                    <Plus size={16} />
                    Submit Progress Record
                  </button>
                </div>
              </form>
            </div>

            {/* List activities as collages */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-gray-700">Recorded Activities Collage History</h3>

              <div className="space-y-6">
                {activities
                  .filter(a => a.StudentID === currentUser.StudentID || currentUser.StudentID === '6601010024')
                  .map((act) => (
                    <div key={act.ActivityID} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
                      {(() => {
                        let files: { name: string; url: string }[] = [];
                        if (Array.isArray(act.ImagesURL)) {
                          files = act.ImagesURL.map((u, i) => {
                            if (typeof u === 'string') {
                              if (u.trim().startsWith('{')) {
                                try {
                                  return JSON.parse(u);
                                } catch (e) {
                                  return { name: `File ${i + 1}`, url: u };
                                }
                              }
                              return { name: `File ${i + 1}`, url: u };
                            }
                            return u;
                          });
                        } else if (typeof act.ImagesURL === 'string') {
                          if ((act.ImagesURL as string).trim().startsWith('[')) {
                            try {
                              files = JSON.parse(act.ImagesURL);
                            } catch(e) {
                              files = [{ name: 'Attachment', url: act.ImagesURL }];
                            }
                          } else {
                            files = [{ name: 'Attachment', url: act.ImagesURL }];
                          }
                        }

                        const imageFiles = files.filter(f => {
                          if (!f.url) return false;
                          const name = f.name || '';
                          const url = f.url || '';
                          return /\.(png|jpe?g|gif|webp)$/i.test(name) ||
                                 /\.(png|jpe?g|gif|webp)$/i.test(url.split('?')[0]) ||
                                 url.includes('images.unsplash.com') ||
                                 url.startsWith('LOCAL_FILE_') ||
                                 url.startsWith('data:image/') ||
                                 url.includes('lh3.googleusercontent.com');
                        });
                        const otherFiles = files.filter(f => !imageFiles.includes(f));

                        return (
                          <>
                            {/* Left: Collage representation of images */}
                            <div className="md:col-span-1 space-y-2">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-tu-red block font-mono">ACTIVITY ATTACHMENTS</span>
                              
                              {imageFiles.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2">
                                  {imageFiles.length === 1 && (
                                    <img src={resolveFileUrl(imageFiles[0].url)} alt="activity" className="w-full h-36 object-cover rounded-xl col-span-2" />
                                  )}
                                  {imageFiles.length === 2 && (
                                    <>
                                      <img src={resolveFileUrl(imageFiles[0].url)} alt="activity" className="w-full h-36 object-cover rounded-xl" />
                                      <img src={resolveFileUrl(imageFiles[1].url)} alt="activity" className="w-full h-36 object-cover rounded-xl" />
                                    </>
                                  )}
                                  {imageFiles.length >= 3 && (
                                    <>
                                      <img src={resolveFileUrl(imageFiles[0].url)} alt="activity" className="w-full h-36 object-cover rounded-xl col-span-2" />
                                      <img src={resolveFileUrl(imageFiles[1].url)} alt="activity" className="w-full h-20 object-cover rounded-xl" />
                                      <img src={resolveFileUrl(imageFiles[2].url)} alt="activity" className="w-full h-20 object-cover rounded-xl" />
                                    </>
                                  )}
                                </div>
                              ) : (
                                <div className="h-36 bg-gray-50 border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 p-4">
                                  <Paperclip size={24} className="mb-1" />
                                  <span className="text-xs">No image attachments</span>
                                </div>
                              )}
                            </div>

                            {/* Right: details and status */}
                            <div className="md:col-span-2 flex flex-col justify-between space-y-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-base font-bold text-gray-900 leading-snug">{act.Title}</h4>
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    act.Status === 'APPROVED'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : act.Status === 'REJECTED'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {act.Status}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                                  <Calendar size={12} />
                                  <span>Activity Date: {formatDisplayDate(act.Date)}</span>
                                </div>

                                <p className="text-sm text-gray-600 leading-relaxed pt-1">{act.Description}</p>

                                {/* List all files (including docs) as links */}
                                {files.length > 0 && (
                                  <div className="pt-3 border-t border-gray-100 space-y-1.5">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Attached Files ({files.length})</span>
                                    <div className="flex flex-wrap gap-2">
                                      {files.map((file, i) => (
                                        <a
                                          key={i}
                                          href={resolveFileUrl(file.url)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-tu-red hover:bg-gray-100 transition max-w-[200px]"
                                        >
                                          <Paperclip size={12} className="shrink-0 text-gray-400" />
                                          <span className="truncate">{file.name}</span>
                                          <ExternalLink size={10} className="shrink-0 text-gray-400" />
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {act.Feedback && (
                                <div className="p-3 bg-red-50/50 border border-red-100/50 rounded-xl text-xs text-gray-700 space-y-1">
                                  <span className="font-semibold block text-tu-red flex items-center gap-1">
                                    <HeartHandshake size={13} />
                                    Advisor Recommendations ({act.ApprovedBy || 'Advisor'}):
                                  </span>
                                  <p className="italic leading-normal">"{act.Feedback}"</p>
                                </div>
                              )}
                              
                              {act.Status === 'REJECTED' && onDeleteActivity && (
                                <button
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this rejected activity?')) {
                                      onDeleteActivity(act.ActivityID);
                                    }
                                  }}
                                  className="mt-3 w-auto self-start px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                                >
                                  <Trash2 size={13} />
                                  Delete Activity
                                </button>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* PORTFOLIO SUBTAB */}
        {/* ----------------------------------------------------------------- */}
        {(activeSubTab === 'portfolio' && portfolioData) && (
          <div
            key="portfolio"
            className="w-full print:block"
          >
            <div className="bg-gray-50/50 p-2 md:p-4 rounded-3xl border border-gray-100">
              <EditPortfolio
                currentUser={currentUser}
                portfolioData={portfolioData}
                onSavePortfolio={async () => {}}
                configOptions={configOptions}
                certificates={certificates}
                isReadOnly={true}
              />
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* REPORT SUBTAB */}
        {/* ----------------------------------------------------------------- */}
        {(activeSubTab === 'report' && portfolioData) && (
          <div
            key="report"
            className="w-full print:block"
          >
            <div className="bg-gray-50/50 p-2 md:p-4 rounded-3xl border border-gray-100">
              <PrintReport
                currentUser={currentUser}
                portfolioData={portfolioData}
                certificates={certificates}
                activities={activities}
                onBack={() => setActiveSubTab('portfolio')}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Photo Preview Overlay */}
      {selectedFullImage && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 cursor-zoom-out" 
          onClick={() => setSelectedFullImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img
              src={resolvePhotoUrl(selectedFullImage)}
              alt="Preview full"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => setSelectedFullImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider cursor-pointer bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition"
            >
              <X size={14} /> ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
