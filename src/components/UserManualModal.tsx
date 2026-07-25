import React, { useState } from 'react';
import { 
  BookOpen, X, GraduationCap, Users, CheckCircle2, FileText, Upload, 
  Printer, Clock, MessageSquare, ShieldCheck, ChevronRight, Database, 
  Award, HelpCircle, FileCheck, Key, AlertTriangle, Lightbulb
} from 'lucide-react';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserManualModal({ isOpen, onClose }: UserManualModalProps) {
  const [activeTab, setActiveTab] = useState<'student' | 'advisor' | 'features' | 'faq'>('student');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden relative">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-tu-red via-red-700 to-tu-red text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <BookOpen size={24} className="text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">คู่มือการใช้งานระบบแฟ้มสะสมผลงานดุษฎีบัณฑิต (User Manual)</h2>
              <p className="text-xs text-red-100/90 font-medium">
                คำแนะนำขั้นตอนการใช้งานอย่างละเอียด สำหรับนักศึกษาและอาจารย์ที่ปรึกษา คณะพยาบาลศาสตร์ มหาวิทยาลัยธรรมศาสตร์
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            title="ปิดคู่มือ"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50/80 px-4 pt-2 gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('student')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'student'
                ? 'bg-white text-tu-red border-tu-red shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 border-transparent'
            }`}
          >
            <GraduationCap size={16} />
            คู่มือสำหรับนักศึกษา (Student Guide)
          </button>

          <button
            onClick={() => setActiveTab('advisor')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'advisor'
                ? 'bg-white text-tu-red border-tu-red shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 border-transparent'
            }`}
          >
            <Users size={16} />
            คู่มือสำหรับอาจารย์ที่ปรึกษา (Advisor Guide)
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'features'
                ? 'bg-white text-tu-red border-tu-red shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 border-transparent'
            }`}
          >
            <FileCheck size={16} />
            การรับรองชั่วโมงวิจัย 180 ชม. & พิมพ์รายงาน
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-white text-tu-red border-tu-red shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 border-transparent'
            }`}
          >
            <HelpCircle size={16} />
            คำถามที่พบบ่อย (FAQ)
          </button>
        </div>

        {/* Manual Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-gray-800 text-xs leading-relaxed bg-white">
          {/* TAB 1: STUDENT MANUAL */}
          {activeTab === 'student' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 flex items-start gap-3">
                <Lightbulb size={20} className="text-tu-red shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-gray-900">ภาพรวมการใช้งานสำหรับนักศึกษาดุษฎีบัณฑิต</h3>
                  <p className="text-gray-600 mt-1">
                    ระบบ Doctoral Portfolio ช่วยบันทึกความก้าวหน้าทางวิชาการ ติดตามชั่วโมงวิจัย 180 ชั่วโมง บันทึกวิทยานิพนธ์ และสื่อสารกับอาจารย์ที่ปรึกษาได้อย่างครบถ้วนในที่เดียว
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-2 text-tu-red font-bold text-sm mb-2">
                    <span className="w-6 h-6 rounded-full bg-tu-red text-white flex items-center justify-center text-xs font-mono">1</span>
                    การเข้าสู่ระบบและการจัดการโปรไฟล์ (Login & Profile)
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 text-gray-700 pl-2">
                    <li>เข้าสู่ระบบด้วยรหัสนักศึกษา (เช่น <code className="bg-white px-1.5 py-0.5 rounded border border-gray-300 font-mono">6814320187</code>) และรหัสผ่านที่ได้รับจัดสรร</li>
                    <li>ตรวจสอบประวัติส่วนตัวใน Section 1 (Personal Info) และประวัติการศึกษาใน Section 2 (Academic Background)</li>
                    <li>เลือกอาจารย์ที่ปรึกษาหลัก (Major Advisor) และอาจารย์ที่ปรึกษาร่วม (Co-Advisor) เพื่อการบันทึกข้อมูลอย่างถูกต้อง</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-2 text-tu-red font-bold text-sm mb-2">
                    <span className="w-6 h-6 rounded-full bg-tu-red text-white flex items-center justify-center text-xs font-mono">2</span>
                    การบันทึกและอัปเดตความก้าวหน้า Portfolio 16 หมวด
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 text-gray-700 pl-2">
                    <li><strong>แผนการเรียน (Study Plan & Coursework):</strong> กรอกรายวิชา ผลการเรียน (Grade) และแผนพัฒนาความสามารถ</li>
                    <li><strong>หมวดวิทยานิพนธ์ (Section 5 Dissertation):</strong> อัปเดตความก้าวหน้าหัวข้อ วัตถุประสงค์ ผลการวิเคราะห์ และบันทึกการพบอาจารย์ที่ปรึกษา</li>
                    <li><strong>หมวดประสบการณ์การวิจัย (Section 6 Research Experience):</strong> บันทึกกิจกรรมชั่วโมงวิจัย และแนบไฟล์หลักฐาน (Evidence) เพื่อส่งให้อาจารย์ลงนามรับรอง</li>
                    <li><strong>หมวดผลงานวิชาการและการตีพิมพ์ (Section 7 - 9):</strong> บันทึกบทความวิจัย รางวัล การนำเสนอในงานประชุม และการบริการวิชาการ</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-2 text-tu-red font-bold text-sm mb-2">
                    <span className="w-6 h-6 rounded-full bg-tu-red text-white flex items-center justify-center text-xs font-mono">3</span>
                    การอัปโหลดใบประกาศนียบัตร และ กิจกรรม (Certificates & Activities)
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 text-gray-700 pl-2">
                    <li>คลิกปุ่ม <strong>"+ เพิ่มประกาศนียบัตร"</strong> เพื่อแนบภาพใบประกาศ (เช่น ใบผ่านการอบรม CITI / Ethics / รางวัล)</li>
                    <li>สถานะจะขึ้นเป็น <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">รอการอนุมัติ</span> จนกว่าอาจารย์ที่ปรึกษาจะกดอนุมัติ</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-2 text-tu-red font-bold text-sm mb-2">
                    <span className="w-6 h-6 rounded-full bg-tu-red text-white flex items-center justify-center text-xs font-mono">4</span>
                    การปรึกษาและส่งข้อความหาอาจารย์ (Advisory Chat Room)
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 text-gray-700 pl-2">
                    <li>ไปที่เมนู <strong>"💬 แชทที่ปรึกษา (Advisory Chat)"</strong> เพื่อพูดคุยสอบถามอาจารย์ที่ปรึกษา</li>
                    <li>แถบสีแดงด้านล่างกล่องพิมพ์จะแสดงชื่ออาจารย์ที่คุณกำลังคุยด้วยเสมอ ไม่ต้องสโครลขึ้นลง</li>
                    <li>สามารถแนบไฟล์เอกสารร่างวิทยานิพนธ์หรือรูปภาพส่งให้อาจารย์ได้ทันที</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADVISOR MANUAL */}
          {activeTab === 'advisor' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 flex items-start gap-3">
                <ShieldCheck size={20} className="text-tu-red shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-gray-900">ภาพรวมการใช้งานสำหรับอาจารย์ที่ปรึกษา (Advisor)</h3>
                  <p className="text-gray-600 mt-1">
                    อาจารย์สามารถติดตาม ตรวจสอบ ให้ข้อเสนอแนะ และลงนามรับรองกิจกรรมวิจัยของนักศึกษาในความดูแลได้อย่างสะดวก สะดวด ปลอดภัย
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-2 text-tu-red font-bold text-sm mb-2">
                    <span className="w-6 h-6 rounded-full bg-tu-red text-white flex items-center justify-center text-xs font-mono">1</span>
                    การเลือกดูข้อมูลนักศึกษาในความดูแล (Supervised Students)
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 text-gray-700 pl-2">
                    <li>เมื่อเข้าสู่ระบบด้วยบัญชีอาจารย์ จะพบการ์ดรายชื่อนักศึกษาในความดูแลทั้งหมด</li>
                    <li>คลิกเลือกนักศึกษาเพื่อดูความก้าวหน้ารายบุคคล, ความคืบหน้า Milestone และ Portfolio ทั้ง 16 หมวด</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-2 text-tu-red font-bold text-sm mb-2">
                    <span className="w-6 h-6 rounded-full bg-tu-red text-white flex items-center justify-center text-xs font-mono">2</span>
                    การตรวจและรับรองชั่วโมงวิจัย 180 ชั่วโมง (Section 6 Endorsement)
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 text-gray-700 pl-2">
                    <li>เลือกแท็บ <strong>"Review Research (Sec 6)"</strong> บนแดชบอร์ดอาจารย์</li>
                    <li>ระบบจะแสดงรายการกิจกรรมวิจัย ชั่วโมงที่บันทึก และไฟล์หลักฐานที่นักศึกษาอัปโหลด</li>
                    <li>คลิกปุ่ม <strong>"🖊️ Confirm Endorsement (Enter Password)"</strong></li>
                    <li>ใส่รหัสผ่านบัญชีอาจารย์ (เช่น <code className="bg-white px-1.5 py-0.5 rounded border border-gray-300 font-mono">1234</code>) แล้วกดปุ่มรับรอง</li>
                    <li>ระบบจะบันทึกสถานะการรับรอง พร้อมชื่ออาจารย์และวันที่รับรองอย่างสมบูรณ์แบบโดยไม่มีการค้างหรือหน่วง</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-2 text-tu-red font-bold text-sm mb-2">
                    <span className="w-6 h-6 rounded-full bg-tu-red text-white flex items-center justify-center text-xs font-mono">3</span>
                    การอนุมัติใบประกาศนียบัตร และ ให้ข้อเสนอแนะ (Certificates & Feedback)
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 text-gray-700 pl-2">
                    <li>แท็บ <strong>"Certificates & Awards"</strong>: คลิกอนุมัติ (Approve) หรือปฏิเสธ (Reject) พร้อมพิมพ์ข้อเสนอแนะเพิ่มเติม</li>
                    <li>แท็บ <strong>"Advisor Feedback"</strong>: สามารถบันทึกความเห็น คำแนะนำวิทยานิพนธ์ หรือข้อเสนอแนะประจำปีให้นักศึกษาเปิดดูได้</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-2 text-tu-red font-bold text-sm mb-2">
                    <span className="w-6 h-6 rounded-full bg-tu-red text-white flex items-center justify-center text-xs font-mono">4</span>
                    การแชทและการส่งการแจ้งเตือนด่วน (Chat & Urgent Alerts)
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 text-gray-700 pl-2">
                    <li>แถบพิมพ์แชทจะมีป้ายระบุชื่อนักศึกษาที่คุณกำลังคุยด้วยเสมอ ป้องกันการส่งผิดคน</li>
                    <li>สามารถกดแท็บ <strong>"Send Urgent Alert"</strong> เพื่อส่งข้อความแจ้งเตือนด่วน (เช่น นัดหมายตรวจวิทยานิพนธ์) ให้นักศึกษาได้ทันที</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ENDORSEMENT & REPORT PRINTING */}
          {activeTab === 'features' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-3">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Key className="text-tu-red" size={18} />
                  ขั้นตอนการรับรองชั่วโมงวิจัย (180 Hours Research Endorsement)
                </h3>
                <p className="text-gray-700">
                  ตามหลักสูตรดุษฎีบัณฑิต นักศึกษาต้องสะสมชั่วโมงประสบการณ์การวิจัยไม่น้อยกว่า 180 ชั่วโมง โดยต้องผ่านการตรวจสอบและลงนามรับรองจากอาจารย์ที่ปรึกษา:
                </p>
                <ol className="list-decimal list-inside space-y-2 font-medium text-gray-800 pl-2">
                  <li><strong>นักศึกษากรอกข้อมูล:</strong> ใน Section 6 เลือกอาจารย์ ระบุวันที่ รายละเอียดกิจกรรม และแนบไฟล์หลักฐาน (PDF/PNG)</li>
                  <li><strong>อาจารย์เปิดตรวจ:</strong> ไปที่หน้า อาจารย์ที่ปรึกษา เลือกนักศึกษา และคลิกแท็บ <strong>"Review Research (Sec 6)"</strong></li>
                  <li><strong>ยืนยันด้วยรหัสผ่าน:</strong> คลิกปุ่มยืนยันรับรอง กรอกรหัสผ่านของอาจารย์เพื่อยืนยันลายเซ็นดิจิทัล</li>
                  <li><strong>บันทึกข้อมูลสำเร็จ:</strong> ระบบจะอัปเดตเป็น <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">✓ Certified & Signed</span> พร้อมจัดเก็บบนระบบทันที</li>
                </ol>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Printer className="text-tu-red" size={18} />
                  การพิมพ์รายงาน Portfolio ฉบับเต็ม (Print & Export Report)
                </h3>
                <p className="text-gray-700">
                  ระบบรองรับการพิมพ์และส่งออกรายงาน Doctoral Portfolio ออกมาเป็นเอกสารทางการแบบครอบคลุม:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-gray-700 pl-2">
                  <li>ไปที่เมนู <strong>"🖨️ พิมพ์รายงาน (Print Report)"</strong> หรือกดปุ่ม Print ในหน้า Portfolio</li>
                  <li>เลือกหัวข้อที่ต้องการรวมในเล่มรายงาน (เช่น ข้อมูลส่วนตัว, Milestone, ชั่วโมงวิจัย 180h, ผลงานวิชาการ)</li>
                  <li>สามารถกดปุ่ม <strong>"Print / Save as PDF"</strong> ในเบราว์เซอร์เพื่อบันทึกเป็นไฟล์ PDF สำหรับส่งบัณฑิตวิทยาลัยได้ทันที</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
                <h4 className="font-bold text-gray-900 text-xs flex items-center gap-2">
                  <HelpCircle className="text-tu-red shrink-0" size={16} />
                  Q: ทำไมกดรับรองชั่วโมงวิจัยแล้วระบบหมุนนาน หรือไม่ตอบสนอง?
                </h4>
                <p className="text-gray-600 pl-6">
                  A: ปัจจุบันระบบได้รับการปรับปรุงให้บันทึกข้อมูลเข้าสู่ Local Storage และซิงค์เบื้องหลังอัตโนมัติ ทำให้การรับรองสำเร็จในทันทีแบบไม่ค้าง หมุน หรือหน่วงอีกต่อไป
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
                <h4 className="font-bold text-gray-900 text-xs flex items-center gap-2">
                  <HelpCircle className="text-tu-red shrink-0" size={16} />
                  Q: รหัสผ่านยืนยันการรับรองของอาจารย์คืออะไร?
                </h4>
                <p className="text-gray-600 pl-6">
                  A: รหัสผ่านคือรหัสผ่านเข้าสู่ระบบของอาจารย์ (ค่าเริ่มต้นระบบทดสอบคือ <code className="bg-white px-1 py-0.5 rounded border border-gray-300 font-mono">1234</code>)
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
                <h4 className="font-bold text-gray-900 text-xs flex items-center gap-2">
                  <HelpCircle className="text-tu-red shrink-0" size={16} />
                  Q: ข้อมูลใน Google Sheets ซิงค์กันอย่างไร?
                </h4>
                <p className="text-gray-600 pl-6">
                  A: ข้อมูล Portfolio และสถานะการรับรอง (ExperienceEndorsed, ExperienceEndorsedBy, ExperienceEndorsementDate) จะถูกเชื่อมโยงและจัดเก็บลงในชีต <code className="bg-white px-1 py-0.5 rounded border border-gray-300 font-mono">P6_ResearchExperience</code> ใน Google Sheets ของคณะโดยอัตโนมัติ
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-gray-500 text-[11px]">
            <Database size={14} className="text-tu-red" />
            <span>ระบบติดตามและสะสมผลงานนักศึกษาปริญญาเอก คณะพยาบาลศาสตร์ มหาวิทยาลัยธรรมศาสตร์</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-tu-red hover:bg-tu-red-hover text-white rounded-xl font-bold transition text-xs cursor-pointer shadow-xs"
          >
            เข้าใจแล้ว (Close Manual)
          </button>
        </div>
      </div>
    </div>
  );
}
