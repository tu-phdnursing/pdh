/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage, Notification } from '../types';
import { getChats, saveChat, getNotifications, saveNotification, logActivity, resolvePhotoUrl } from '../lib/googleSheets';
import { MessageSquare, Bell, Send, UserCheck, RefreshCw, Clock, AlertTriangle, AlertCircle, CheckCircle, ShieldAlert, Paperclip, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdvisoryChatProps {
  currentUser: User;
  allUsers: User[];
  onRefreshDB: () => Promise<void>;
}

export default function AdvisoryChat({
  currentUser,
  allUsers,
  onRefreshDB
}: AdvisoryChatProps) {
  // Database states
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Active interaction states
  const [activeContactId, setActiveContactId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'chat' | 'notif'>('chat');

  // Input states
  const [messageInput, setMessageInput] = useState('');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [sendingNotif, setSendingNotif] = useState(false);
  const [chatAttachment, setChatAttachment] = useState<{name: string, url: string, isUploading?: boolean} | null>(null);

  // Chat scroll anchor
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const allChats = await getChats();
      const allNotifs = await getNotifications();
      setChats(allChats);
      setNotifications(allNotifs);
    } catch (e) {
      console.error('Error fetching advisory chat/notif data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  // Scroll to bottom on new chats
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, activeContactId, activeTab]);

  // Determine contacts
  const myContacts: User[] = [];

  if (currentUser.Role === 'STUDENT') {
    const mainAdvisorName = currentUser.Advisor || '';
    const coAdvisorName = currentUser.CoAdvisor || '';

    // Main Advisor
    const mainAdvisorUser = allUsers.find(
      u => ['ADVISOR', 'CO_ADVISOR', 'SUPER_ADVISOR'].includes(u.Role) && mainAdvisorName.includes(u.FullName)
    );
    if (mainAdvisorUser) {
      myContacts.push({
        ...mainAdvisorUser,
        FullName: `[Major Advisor] ${mainAdvisorUser.FullName}`
      });
    } else if (mainAdvisorName) {
      myContacts.push({
        UserID: 'ADVISOR-VIRTUAL-MAIN',
        Email: 'advisor@tu.ac.th',
        FullName: `[Major Advisor] ${mainAdvisorName}`,
        Role: 'ADVISOR'
      });
    }

    // Co-Advisor
    const coAdvisorUser = allUsers.find(
      u => ['ADVISOR', 'CO_ADVISOR', 'SUPER_ADVISOR'].includes(u.Role) && coAdvisorName.includes(u.FullName)
    );
    if (coAdvisorUser) {
      myContacts.push({
        ...coAdvisorUser,
        FullName: `[Co-Advisor] ${coAdvisorUser.FullName}`
      });
    } else if (coAdvisorName) {
      myContacts.push({
        UserID: 'ADVISOR-VIRTUAL-CO',
        Email: 'coadvisor@tu.ac.th',
        FullName: `[Co-Advisor] ${coAdvisorName}`,
        Role: 'ADVISOR'
      });
    }
  } else if (['ADVISOR', 'CO_ADVISOR', 'SUPER_ADVISOR', 'ADMIN'].includes(currentUser.Role)) {
    const students = allUsers.filter(u => u.Role === 'STUDENT');
    students.forEach(s => {
      const isMain = s.Advisor && s.Advisor.includes(currentUser.FullName);
      const isCo = s.CoAdvisor && s.CoAdvisor.includes(currentUser.FullName);
      
      if (isMain || isCo || currentUser.Role === 'ADMIN' || currentUser.Role === 'SUPER_ADVISOR') {
        let rolePrefix = '';
        if (isMain) rolePrefix = '🎓 [Major Advisor] ';
        else if (isCo) rolePrefix = '🤝 [Co-Advisor] ';
        else rolePrefix = '👤 [Student] ';

        myContacts.push({
          ...s,
          FullName: `${rolePrefix}${s.FullName}`
        });
      }
    });
  }

  // Pre-select first contact
  useEffect(() => {
    if (myContacts.length > 0 && !activeContactId) {
      setActiveContactId(myContacts[0].UserID);
    }
  }, [myContacts, activeContactId]);

  const activeContact = myContacts.find(c => c.UserID === activeContactId) || myContacts[0];

  // Filter messages for current active conversation
  const activeMessages = chats.filter(msg => {
    if (!activeContact) return false;
    
    const isSentByMe = msg.SenderID === currentUser.UserID && msg.ReceiverID === activeContact.UserID;
    const isSentByContact = msg.SenderID === activeContact.UserID && msg.ReceiverID === currentUser.UserID;

    const currentUserIsAdvisor = ['ADVISOR', 'CO_ADVISOR', 'SUPER_ADVISOR'].includes(currentUser.Role);
    const contactIsAdvisor = ['ADVISOR', 'CO_ADVISOR', 'SUPER_ADVISOR'].includes(activeContact.Role);
    const isStudentAdvisor = (currentUser.Role === 'STUDENT' && contactIsAdvisor) || (currentUserIsAdvisor && activeContact.Role === 'STUDENT');
    if (isStudentAdvisor) {
      const studentId = currentUser.Role === 'STUDENT' ? currentUser.StudentID : activeContact.StudentID;
      const advisorUserId = currentUserIsAdvisor ? currentUser.UserID : activeContact.UserID;
      
      const isStudentToAdvisor = msg.SenderID === studentId && msg.ReceiverID === advisorUserId;
      const isAdvisorToStudent = msg.SenderID === advisorUserId && msg.ReceiverID === studentId;
      
      if (isStudentToAdvisor || isAdvisorToStudent) return true;
    }

    return isSentByMe || isSentByContact;
  });

  // Filter notifications
  const activeNotifications = notifications.filter(notif => {
    if (currentUser.Role === 'STUDENT') {
      return notif.ReceiverID === currentUser.StudentID || notif.ReceiverID === currentUser.UserID;
    } else {
      if (!activeContact) return false;
      const targetId = activeContact.StudentID || activeContact.UserID;
      return notif.ReceiverID === targetId && notif.SenderID === currentUser.UserID;
    }
  });

  // Actions
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageInput.trim() && !chatAttachment) || !activeContact) return;

    setSendingChat(true);
    const newMsg: ChatMessage = {
      MessageID: `MSG-${Date.now()}`,
      SenderID: currentUser.Role === 'STUDENT' && currentUser.StudentID ? currentUser.StudentID : currentUser.UserID,
      SenderName: currentUser.FullName,
      ReceiverID: activeContact.Role === 'STUDENT' && activeContact.StudentID ? activeContact.StudentID : activeContact.UserID,
      MessageText: messageInput,
      Timestamp: new Date().toISOString(),
      ...(chatAttachment ? { Attachment: chatAttachment.url, AttachmentName: chatAttachment.name } : {})
    };

    try {
      await saveChat(newMsg);
      setChats(prev => [...prev, newMsg]);
      setMessageInput('');
      setChatAttachment(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingChat(false);
    }
  };

  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setChatAttachment({ name: file.name, url: '', isUploading: true });
    const reader = new FileReader();
    reader.onload = () => {
      setChatAttachment({ name: file.name, url: reader.result as string, isUploading: false });
    };
    reader.readAsDataURL(file);
  };

  const handleSendNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim() || !activeContact) return;

    setSendingNotif(true);
    const targetStudentID = activeContact.StudentID || activeContact.UserID;
    const newNotif: Notification = {
      NotificationID: `NOT-${Date.now()}`,
      SenderID: currentUser.UserID,
      SenderName: currentUser.FullName,
      ReceiverID: targetStudentID,
      Title: notifTitle,
      MessageText: notifMessage,
      Timestamp: new Date().toISOString(),
      IsRead: false
    };

    try {
      await saveNotification(newNotif);
      setNotifications(prev => [newNotif, ...prev]);
      setNotifTitle('');
      setNotifMessage('');
      logActivity(currentUser.UserID, 'SEND_ADVISOR_REMINDER', `Sent warning/alert reminder to student ${activeContact.FullName}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingNotif(false);
    }
  };

  const handleMarkAsRead = async (notif: Notification) => {
    const updated = { ...notif, IsRead: true };
    try {
      await saveNotification(updated);
      setNotifications(prev => prev.map(n => n.NotificationID === notif.NotificationID ? updated : n));
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-4 h-[650px]">
      
      {/* LEFT COLUMN: Contacts Panel */}
      <div className="md:col-span-1 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-tu-red" />
            <span className="font-extrabold text-xs text-gray-800 uppercase tracking-wider">
              {currentUser.Role === 'STUDENT' ? 'Your Advisors' : 'Supervised Candidates'}
            </span>
          </div>
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-1.5 text-gray-400 hover:text-tu-red rounded-lg transition hover:bg-red-50 cursor-pointer"
            title="Refresh Chat history"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {myContacts.map(contact => {
            const isActive = activeContactId === contact.UserID;
            
            // Count unread chats/notifications for highlight
            const unreadChats = chats.filter(c => c.SenderID === contact.UserID && c.ReceiverID === currentUser.UserID).length;
            const unreadNotifs = notifications.filter(n => n.SenderID === contact.UserID && n.ReceiverID === currentUser.UserID && !n.IsRead).length;

            return (
              <button
                key={contact.UserID}
                onClick={() => {
                  setActiveContactId(contact.UserID);
                }}
                className={`w-full text-left p-3 rounded-xl transition duration-200 flex items-center gap-3 border cursor-pointer ${
                  isActive
                    ? 'bg-white border-red-200 text-tu-red shadow-xs font-bold'
                    : 'border-transparent text-gray-700 hover:bg-white/80'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={resolvePhotoUrl(contact.PhotoURL, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80')}
                    alt={contact.FullName}
                    className="w-9 h-9 rounded-full object-cover border border-gray-100"
                  />
                  {(unreadChats > 0 || unreadNotifs > 0) && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-tu-red text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadChats + unreadNotifs}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs truncate text-gray-800">{contact.FullName}</h4>
                  <p className="text-[9px] font-mono text-gray-400 truncate mt-0.5">
                    {contact.Role === 'STUDENT' ? `Student ID: ${contact.StudentID || 'N/A'}` : contact.Email}
                  </p>
                </div>
              </button>
            );
          })}

          {myContacts.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-xs">
              <AlertCircle size={20} className="mx-auto mb-2 text-gray-300" />
              No supervising advisors or students found.
            </div>
          )}
        </div>
        
        {/* User identification badge */}
        <div className="p-3 bg-white border-t border-gray-100 text-center text-[10px] text-gray-400 shrink-0 font-mono">
          Logged in as: <span className="font-bold text-gray-700">{currentUser.FullName}</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Active Chat & Notifications Panels */}
      <div className="md:col-span-3 flex flex-col bg-white">
        
        {activeContact ? (
          <>
            {/* Header section */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={resolvePhotoUrl(activeContact.PhotoURL, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80')}
                  alt={activeContact.FullName}
                  className="w-10 h-10 rounded-xl object-cover border border-gray-100 shrink-0"
                />
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{activeContact.FullName}</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                    <span className="font-semibold text-tu-red uppercase bg-red-50 px-1.5 py-0.5 rounded text-[8px] font-mono">
                      {activeContact.Role}
                    </span>
                    {activeContact.Role === 'STUDENT' && (
                      <span className="text-gray-400 font-mono">ID: {activeContact.StudentID}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Toggle panels between Chat Room and Notification/Reminder */}
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeTab === 'chat'
                      ? 'bg-white text-tu-red shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <MessageSquare size={13} />
                  Chat Room
                </button>
                <button
                  onClick={() => setActiveTab('notif')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeTab === 'notif'
                      ? 'bg-white text-tu-red shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Bell size={13} />
                  {currentUser.Role === 'STUDENT' ? 'Advisor Alerts' : 'Send Urgent Alert'}
                </button>
              </div>
            </div>

            {/* TAB 1: Chat Message Room */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30">
                {/* Messages Box */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {activeMessages.map((msg) => {
                    const isMe = msg.SenderID === currentUser.UserID || msg.SenderID === currentUser.StudentID;
                    return (
                      <div
                        key={msg.MessageID}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 text-[9px] text-gray-400 mb-1 px-1">
                          <span className="font-bold">{isMe ? 'You' : msg.SenderName}</span>
                          <span className="font-mono">{formatTime(msg.Timestamp)}</span>
                        </div>
                        <div
                          className={`p-3 rounded-2xl max-w-lg shadow-2xs leading-relaxed text-xs ${
                            isMe
                              ? 'bg-tu-red text-white rounded-tr-none'
                              : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                          }`}
                        >
                          {msg.MessageText && <div className="whitespace-pre-wrap">{msg.MessageText}</div>}
                          {msg.Attachment && (
                            <a
                              href={msg.Attachment}
                              target="_blank"
                              rel="noreferrer referrer"
                              className={`mt-1 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-semibold transition ${
                                isMe 
                                  ? 'bg-white/20 hover:bg-white/30 text-white' 
                                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                              }`}
                            >
                              <Paperclip size={12} />
                              <span className="truncate max-w-[150px]">{msg.AttachmentName || 'Attachment'}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {activeMessages.length === 0 && (
                    <div className="text-center py-20 text-gray-400 text-xs">
                      <MessageSquare size={32} className="mx-auto mb-2 text-gray-300" />
                      No messages in this chat room yet. Send a message to start the conversation!
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Send message Form */}
                <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                  {chatAttachment && (
                    <div className="mb-2 p-2 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Paperclip size={14} className="text-gray-400" />
                        <span className="truncate max-w-[200px]">{chatAttachment.name}</span>
                        {chatAttachment.isUploading && <span className="text-[10px] text-tu-red animate-pulse">Processing...</span>}
                      </div>
                      <button type="button" onClick={() => setChatAttachment(null)} className="text-gray-400 hover:text-red-500 cursor-pointer">
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  <form onSubmit={handleSendChat} className="flex gap-2 items-center">
                    <label className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer transition">
                      <Paperclip size={16} />
                      <input type="file" className="hidden" onChange={handleFileAttachment} />
                    </label>
                    <input
                      type="text"
                      placeholder="Type your message here..."
                      value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-tu-red text-xs"
                    />
                    <button
                      type="submit"
                      disabled={sendingChat || chatAttachment?.isUploading || (!messageInput.trim() && !chatAttachment)}
                      className="bg-tu-red hover:bg-tu-red-hover text-white px-4 py-2 rounded-xl transition duration-150 flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer"
                    >
                      <Send size={14} className={sendingChat ? "animate-pulse" : ""} />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 2: Alerts and Notifications Tab */}
            {activeTab === 'notif' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* ADVISOR ROLE: Create dynamic Warning Notification Reminder */}
                {currentUser.Role !== 'STUDENT' && (
                  <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 space-y-3">
                    <div className="flex items-center gap-2 text-tu-red">
                      <ShieldAlert size={16} />
                      <h4 className="font-bold text-xs uppercase tracking-wider">
                        Send recommendation / warning / urgent alert to {activeContact.FullName}
                      </h4>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Send alerts regarding defense schedules, research progress milestones, or urgent amendments. This warning will appear directly on the student's dashboard.
                    </p>

                    <form onSubmit={handleSendNotif} className="space-y-3 pt-1 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-1">
                          Alert Subject / Title
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Warning: Outstanding IRB Proposal corrections overdue"
                          value={notifTitle}
                          onChange={e => setNotifTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-tu-red"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-1">
                          Detailed Warning Message
                        </label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Describe detailed instructions and timeline requirements for the candidate..."
                          value={notifMessage}
                          onChange={e => setNotifMessage(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-tu-red resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={sendingNotif}
                        className="bg-tu-red hover:bg-tu-red-hover text-white px-4 py-2.5 rounded-xl transition font-bold text-xs tracking-wider flex items-center gap-1.5 cursor-pointer"
                      >
                        <Bell size={13} />
                        {sendingNotif ? 'Sending alert...' : 'Send Urgent Alert'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Notifications Log / Timeline List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-amber-500" />
                      {currentUser.Role === 'STUDENT' ? 'Advisor Alerts & Notifications' : 'Sent Alerts History'}
                    </h4>
                    <span className="text-[10px] font-mono text-gray-400">
                      Total {activeNotifications.length} alerts
                    </span>
                  </div>

                  <div className="space-y-3">
                    {activeNotifications.map((notif) => {
                      const isUnread = !notif.IsRead && currentUser.Role === 'STUDENT';
                      return (
                        <div
                          key={notif.NotificationID}
                          className={`p-4 rounded-xl border transition-all duration-200 ${
                            isUnread
                              ? 'bg-amber-50/50 border-amber-200 shadow-xs ring-1 ring-amber-200'
                              : 'bg-white border-gray-100 shadow-2xs'
                          } flex items-start gap-4`}
                        >
                          <div className={`p-2.5 rounded-xl ${isUnread ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                            {isUnread ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <h5 className="font-bold text-xs text-gray-900">{notif.Title}</h5>
                              <span className="text-[9px] text-gray-400 font-mono flex items-center gap-1 shrink-0">
                                <Clock size={10} />
                                {formatDate(notif.Timestamp)} {formatTime(notif.Timestamp)}
                              </span>
                            </div>
                            
                            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                              {notif.MessageText}
                            </p>

                            <div className="flex items-center justify-between pt-2">
                              <span className="text-[10px] text-gray-400">
                                Sender: <span className="font-bold text-gray-600">{notif.SenderName}</span>
                              </span>
                              
                              {isUnread && (
                                <button
                                  onClick={() => handleMarkAsRead(notif)}
                                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                                >
                                  <UserCheck size={10} />
                                  Mark as Read & Acknowledge
                                </button>
                              )}

                              {!isUnread && currentUser.Role === 'STUDENT' && (
                                <span className="text-[9px] text-emerald-600 font-semibold flex items-center gap-0.5">
                                  <CheckCircle size={10} />
                                  Acknowledged Alert
                                </span>
                              )}

                              {currentUser.Role !== 'STUDENT' && (
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                  notif.IsRead ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {notif.IsRead ? 'Read by Student' : 'Unread'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {activeNotifications.length === 0 && (
                      <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-xs text-gray-400">
                        <Bell size={24} className="mx-auto mb-2 text-gray-300" />
                        No alerts or notifications recorded.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 text-gray-400">
            <MessageSquare size={48} className="text-gray-200 mb-2 animate-bounce" />
            <h4 className="font-bold text-gray-700 text-sm">Advising Advisory Hub</h4>
            <p className="text-xs max-w-sm mt-1 leading-relaxed">
              Select a contact from the sidebar list to open direct chat or send warning reminders.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
