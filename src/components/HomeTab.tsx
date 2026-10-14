import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Stage, ChurchEventNotification } from '../types';
import { STAGES, MONTHS } from '../data/mockData';
import { 
  Bell, Calendar, Users, BookOpen, UserCheck, Cake, Sparkles, Plus, Trash2, 
  ChevronLeft, ShieldCheck, Phone, MessageCircle, AlertCircle, Clock, Gift,
  CheckCircle2, Flame, MapPin, Layers, Cross, ArrowUpRight, X
} from 'lucide-react';

import { parseBirthDate } from './BirthdayWidget';

export const HomeTab: React.FC<{
  onOpenAddChild?: () => void;
  onOpenBirthdays?: () => void;
  onOpenUserManagement?: () => void;
  onOpenProfile?: () => void;
}> = ({ onOpenAddChild, onOpenBirthdays, onOpenUserManagement, onOpenProfile }) => {
  const { 
    currentUser, role, selectedStageScope, setSelectedStageScope, 
    children, servants, books, attendance, notifications, 
    addNotification, deleteNotification, setActiveTab, stagesList,
    markAttendance, getAttendanceRecord
  } = useApp();

  // State for Add Notification Modal
  const [isAddNotifOpen, setIsAddNotifOpen] = useState(false);
  const [selfAttNotice, setSelfAttNotice] = useState<string | null>(null);
  const [notifForm, setNotifForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '06:00 مساءً',
    targetStage: (selectedStageScope === 'all' ? 'عامة' : selectedStageScope) as Stage,
    type: 'event' as 'event' | 'alert' | 'spiritual' | 'meeting'
  });

  // Current servant record
  const currentServant = servants.find(s => 
    s.name === currentUser?.name || 
    (currentUser?.phone && s.phone === currentUser?.phone)
  );

  const todayDateStr = new Date().toISOString().split('T')[0];
  const myTodayRecord = currentServant 
    ? getAttendanceRecord('servant', 'general_meeting', todayDateStr)?.records[currentServant.id] 
    : undefined;

  const handleSelfCheckIn = (status: 'present' | 'excused') => {
    if (!currentServant) return;
    markAttendance('servant', 'general_meeting', todayDateStr, currentServant.id, status, status === 'present' ? 'تسجيل ذاتي حاضر' : 'اعتذار شخصي');
    setSelfAttNotice(status === 'present' ? 'تم تسجيل حضورك اليوم بنجاح باركك الرب!' : 'تم تسجيل اعتذارك عن الحضور اليوم.');
    setTimeout(() => setSelfAttNotice(null), 4000);
  };

  // Filtered children and servants by selected stage scope
  const filteredChildren = selectedStageScope === 'all' 
    ? children 
    : children.filter(c => c.stage === selectedStageScope);

  const filteredServants = selectedStageScope === 'all' 
    ? servants 
    : servants.filter(s => s.assignedStage === selectedStageScope);

  const filteredBooks = selectedStageScope === 'all' 
    ? books 
    : books.filter(b => b.targetStage === selectedStageScope || b.targetStage === 'عامة');

  // Filtered Notifications based on selected stage scope or 'عامة'
  const filteredNotifications = notifications.filter(n => {
    if (selectedStageScope === 'all') return true;
    return n.targetStage === 'عامة' || n.targetStage === selectedStageScope;
  });

  // Birthday logic for current month and today
  const todayDateObj = new Date();
  const todayDay = todayDateObj.getDate();
  const currentMonthNum = todayDateObj.getMonth() + 1;
  const currentMonthLabel = MONTHS.find(m => m.value === currentMonthNum)?.label || `شهر ${currentMonthNum}`;

  const birthdayKids = filteredChildren.filter(c => {
    const { month } = parseBirthDate(c.birthDate, c.birthMonth);
    return month === currentMonthNum;
  });

  const birthdayServants = servants.filter(s => {
    const { month } = parseBirthDate(s.birthDate, s.birthMonth);
    return month === currentMonthNum;
  });

  const todayBirthdaysTotal = [...birthdayKids, ...birthdayServants].filter(p => {
    const { day, month } = parseBirthDate(p.birthDate, p.birthMonth);
    return month === currentMonthNum && day === todayDay;
  }).length;

  const totalBirthdays = birthdayKids.length + birthdayServants.length;

  // Attendance rate estimation
  const totalKidsCount = filteredChildren.length || 1;
  const recentAttendanceRecords = attendance.filter(a => a.targetType === 'child');
  let presentCount = 0;
  let totalAttEntries = 0;
  recentAttendanceRecords.forEach(rec => {
    Object.keys(rec.records).forEach(kidId => {
      // Check if kid belongs to current filtered list
      if (filteredChildren.some(k => k.id === kidId)) {
        totalAttEntries++;
        if (rec.records[kidId].status === 'present') presentCount++;
      }
    });
  });
  const attendancePercentage = totalAttEntries > 0 
    ? Math.round((presentCount / totalAttEntries) * 100) 
    : 92;

  const handleAddNotifSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifForm.title.trim() || !notifForm.description.trim()) return;

    addNotification({
      title: notifForm.title,
      description: notifForm.description,
      date: notifForm.date,
      time: notifForm.time,
      targetStage: notifForm.targetStage,
      type: notifForm.type,
      createdBy: currentUser?.name || 'أمين الخدمة'
    });

    setNotifForm({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '06:00 مساءً',
      targetStage: (selectedStageScope === 'all' ? 'عامة' : selectedStageScope) as Stage,
      type: 'event'
    });

    setIsAddNotifOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Stage Filter Selector & Banner */}
      <div className="bg-white dark:bg-[#1a0a12] rounded-3xl p-6 border border-amber-200/80 dark:border-[#3e1423] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200">
        <div className="flex items-center gap-3.5">
          <img 
            src="/church_logo.jpg" 
            alt="شعار كنيسة ماريوحنا المعمدان" 
            className="w-13 h-13 rounded-2xl object-cover ring-2 ring-churchgold-400 shadow-md shrink-0" 
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-stone-100">
                مرحباً بك، {currentUser?.name || 'أ/ الخادم'} 👋
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-churchgold-500/20 border border-churchgold-400/30 text-churchgold-700 dark:text-churchgold-300 text-[11px] font-black">
                {role === 'amin_khedma_am' ? 'أمين الخدمة العام' : role === 'amin_fasl' ? 'أمين مرحلة وفصل' : 'خادم بالمرحلة'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-stone-400 mt-0.5">
              كنيسة ماريوحنا بالمعراج • التربية الكنسية ومدارس الأحد
            </p>
          </div>
        </div>

        {/* Quick User Actions & Stage Scope */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-[#2e101d] dark:hover:bg-[#3d1527] text-burgundy-900 dark:text-churchgold-300 border border-amber-300/80 dark:border-[#4d1d2c] text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title="تعديل بياناتي الشخصية"
            >
              <Users className="w-3.5 h-3.5 text-churchgold-600 dark:text-churchgold-400" />
              <span>تعديل بياناتي الشخصية</span>
            </button>
          )}

          <div className="flex items-center gap-2 bg-[#f9f7f2] dark:bg-[#230b17] p-1.5 px-2 rounded-xl border border-amber-200/80 dark:border-[#3e1423]">
            <span className="text-xs font-bold text-slate-700 dark:text-stone-300 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-burgundy-700 dark:text-churchgold-400" />
              <span>المرحلة:</span>
            </span>
            {role === 'amin_khedma_am' ? (
              <select
                value={selectedStageScope}
                onChange={(e) => setSelectedStageScope(e.target.value as Stage | 'all')}
                className="bg-white dark:bg-[#1a0a12] border border-amber-200/80 dark:border-[#4d1d2c] rounded-lg px-2 py-1 text-xs font-bold text-slate-800 dark:text-stone-100 focus:outline-none cursor-pointer shadow-2xs"
              >
                <option value="all">🌐 كافة المراحل والخدمات</option>
                {stagesList.map(s => (
                  <option key={s.id || s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-white dark:bg-[#1a0a12] border border-amber-200/80 dark:border-[#4d1d2c] text-burgundy-900 dark:text-churchgold-300 rounded-lg px-2 py-1 text-xs font-bold shadow-2xs">
                <span>{currentUser?.assignedStage || selectedStageScope}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Self-attendance notification alert */}
      {selfAttNotice && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{selfAttNotice}</span>
        </div>
      )}

      {/* Bento Grid Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Quick Bento Stats (Col-8) */}
        <div className="md:col-span-8 bg-white dark:bg-[#1a0a12] rounded-3xl border border-amber-200/80 dark:border-[#3e1423] p-6 shadow-sm flex flex-col justify-between transition-colors duration-200">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-100/60 dark:border-[#33111d]">
            <div>
              <h3 className="font-black text-slate-900 dark:text-stone-100 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-churchgold-500" />
                <span>إحصائيات {selectedStageScope === 'all' ? 'كافة مراحل وخدمات الكنيسة' : selectedStageScope}</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-stone-400">بيانات المخدومين والخدام ونسب الحضور</p>
            </div>
            <div className="flex items-center gap-2">
              {(role === 'amin_khedma_am' || currentUser?.canManageSupervisors || currentUser?.username?.toLowerCase() === 'giovanni_ayman' || currentUser?.phone === '01203385601') && onOpenUserManagement && (
                <button
                  onClick={onOpenUserManagement}
                  className="px-3 py-1.5 bg-gradient-to-r from-burgundy-700 to-burgundy-800 hover:from-burgundy-800 hover:to-burgundy-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-churchgold-400/30 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-churchgold-300" />
                  <span>إدارة حسابات الخدام</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
            <div className="bg-[#fcfbf7] dark:bg-[#220b16] p-4 rounded-2xl border border-amber-200/60 dark:border-[#3d1523] text-center">
              <div className="text-2xl font-black text-slate-900 dark:text-stone-100">{filteredChildren.length}</div>
              <div className="text-xs font-bold text-slate-500 dark:text-stone-400 mt-0.5">المخدومين (الأولاد)</div>
            </div>

            <div className="bg-[#fcfbf7] dark:bg-[#220b16] p-4 rounded-2xl border border-amber-200/60 dark:border-[#3d1523] text-center">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{attendancePercentage}%</div>
              <div className="text-xs font-bold text-slate-500 dark:text-stone-400 mt-0.5">نسبة انضباط الحضور</div>
            </div>

            <div className="bg-[#fcfbf7] dark:bg-[#220b16] p-4 rounded-2xl border border-amber-200/60 dark:border-[#3d1523] text-center">
              <div className="text-2xl font-black text-burgundy-700 dark:text-churchgold-300">{filteredServants.length}</div>
              <div className="text-xs font-bold text-slate-500 dark:text-stone-400 mt-0.5">خدام المرحلة</div>
            </div>

            <div className="bg-[#fcfbf7] dark:bg-[#220b16] p-4 rounded-2xl border border-amber-200/60 dark:border-[#3d1523] text-center">
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{filteredBooks.length}</div>
              <div className="text-xs font-bold text-slate-500 dark:text-stone-400 mt-0.5">كتب ومناهج متوفرة</div>
            </div>
          </div>

          {/* Quick Self-attendance Strip for Servant */}
          {currentServant && (
            <div className="mt-3 p-3 bg-amber-50/70 dark:bg-[#260f1b] rounded-2xl border border-amber-200/80 dark:border-[#4d1d2c] flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-churchgold-600 dark:text-churchgold-400" />
                <span className="font-bold text-slate-900 dark:text-stone-100">تسجيل حضوري الذاتي اليوم:</span>
                {myTodayRecord?.status === 'present' ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[11px]">
                    ✓ مسجل حاضر اليوم
                  </span>
                ) : myTodayRecord?.status === 'excused' ? (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-extrabold text-[11px]">
                    مُسجل معتذر
                  </span>
                ) : (
                  <span className="text-slate-500 text-[11px]">لم تسجل حضورك بعد</span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSelfCheckIn('present')}
                  className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                >
                  أنا حاضر اليوم
                </button>
                <button
                  onClick={() => handleSelfCheckIn('excused')}
                  className="px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-[#341121] hover:bg-slate-300 text-slate-700 dark:text-stone-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  اعتذار
                </button>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-amber-100/60 dark:border-[#33111d] flex items-center justify-between text-xs text-slate-500 dark:text-stone-400 mt-2">
            <span>المرحلة المختارة: <strong className="text-burgundy-700 dark:text-churchgold-300">{selectedStageScope === 'all' ? 'كافة المراحل والخدمات' : selectedStageScope}</strong></span>
            <button
              onClick={() => setActiveTab('children_directory')}
              className="text-burgundy-700 dark:text-churchgold-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>عرض قائمة المخدومين (الأولاد)</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Attendance Bento Card (Col-4) */}
        <div className="md:col-span-4 bg-gradient-to-br from-burgundy-900 via-[#3a0d1a] to-[#1a060d] border border-[#541c2c] rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-1 rounded-lg bg-churchgold-500/20 border border-churchgold-400/30 text-churchgold-300 text-[10px] font-black">
                حضور الخدمة
              </span>
              <Clock className="w-4 h-4 text-churchgold-300" />
            </div>
            <h3 className="text-base font-black text-white mb-1">تسجيل الحضور والغياب</h3>
            <p className="text-stone-300 text-xs">متابعة حضور المخدومين والخدام لمدارس الأحد واجتماع الخدمة</p>
          </div>

          <div className="space-y-2 my-4">
            <button
              onClick={() => setActiveTab('children_attendance')}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 border border-emerald-500/30 rounded-2xl flex items-center justify-between px-4 transition-all text-xs font-bold text-white cursor-pointer shadow-md"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                <span>تسجيل حضور الأولاد (المخدومين)</span>
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-200" />
            </button>

            <button
              onClick={() => setActiveTab('servants_attendance')}
              className="w-full py-2.5 bg-white/10 hover:bg-white/15 border border-churchgold-400/20 rounded-2xl flex items-center justify-between px-4 transition-all text-xs font-bold text-stone-100 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-churchgold-400"></span>
                <span>تسجيل حضور الخدام الأسبوعي</span>
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-churchgold-300" />
            </button>

            <button
              onClick={() => setActiveTab('children_directory')}
              className="w-full py-2.5 bg-white/10 hover:bg-white/15 border border-churchgold-400/20 rounded-2xl flex items-center justify-between px-4 transition-all text-xs font-bold text-stone-100 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>سجل المخدومين والأنشطة الإضافية</span>
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-churchgold-300" />
            </button>
          </div>
        </div>

      </div>

      {/* Middle Section: Notifications / Upcoming Events & Birthdays */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Notifications & Church Events (Col-8) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1a0a12] rounded-3xl border border-amber-200/80 dark:border-[#3e1423] p-6 shadow-sm flex flex-col space-y-4 transition-colors duration-200">
          <div className="flex items-center justify-between border-b border-amber-100/60 dark:border-[#33111d] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-amber-50 dark:bg-[#2e101d] text-churchgold-600 dark:text-churchgold-300 border border-amber-200/60 dark:border-[#4d1a2c]">
                <Bell className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-stone-100 text-sm">التنبيهات والمناسبات القادمة</h3>
                <p className="text-xs text-slate-500 dark:text-stone-400">
                  {selectedStageScope === 'all' ? 'جميع تنبيهات الكنيسة والمراحل' : `التنبيهات الخاصة بمرحلة (${selectedStageScope}) والتنبيهات العامة`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAddNotifOpen(true)}
              className="px-3 py-2 bg-gradient-to-r from-burgundy-700 to-burgundy-800 hover:from-burgundy-800 hover:to-burgundy-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-burgundy-950/20 border border-churchgold-400/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-churchgold-300" />
              <span>إضافة تنبيه للمرحلة</span>
            </button>
          </div>

          {/* Notifications List */}
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-stone-500 bg-[#fcfbf7] dark:bg-[#220b16] rounded-2xl border border-amber-200/60 dark:border-[#3d1523]">
                <Bell className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                <p className="font-bold text-slate-600 dark:text-stone-300 text-xs">لا توجد تنبيهات مسجلة لهذه المرحلة حالياً.</p>
              </div>
            ) : (
              filteredNotifications.map(n => {
                const isGeneral = n.targetStage === 'عامة';
                return (
                  <div key={n.id} className="p-4 rounded-2xl bg-[#fcfbf7] dark:bg-[#220b16] hover:bg-amber-50/50 dark:hover:bg-[#2b0e1c] border border-amber-200/60 dark:border-[#3d1523] transition-all space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isGeneral 
                              ? 'bg-churchgold-500/20 text-churchgold-800 dark:text-churchgold-300 border border-churchgold-400/30' 
                              : 'bg-burgundy-100 dark:bg-burgundy-950/60 text-burgundy-800 dark:text-burgundy-200 border border-burgundy-200 dark:border-burgundy-900'
                          }`}>
                            {isGeneral ? 'عام لكافة المراحل' : `خاص بـ (${n.targetStage})`}
                          </span>

                          <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#2f101f] text-slate-700 dark:text-stone-300 text-[10px] font-bold flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-stone-400" />
                            <span>{n.date}</span>
                            {n.time && <span>• {n.time}</span>}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-stone-100 text-sm">{n.title}</h4>
                      </div>

                      {(role === 'amin_khedma_am' || role === 'amin_fasl') && (
                        <button
                          onClick={() => deleteNotification(n.id)}
                          className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="حذف التنبيه"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-stone-300 leading-relaxed font-medium">{n.description}</p>

                    <div className="pt-2 border-t border-amber-100/60 dark:border-[#33111d] flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 font-semibold">
                      <span>الناشر: {n.createdBy || 'أمين الخدمة'}</span>
                      <span className="text-burgundy-700 dark:text-churchgold-300 font-bold">تنبيه نشط 🔔</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Month Birthdays Bento Card (Col-4) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1a0a12] rounded-3xl border border-amber-200/80 dark:border-[#3e1423] p-6 shadow-sm flex flex-col justify-between space-y-4 transition-colors duration-200">
          <div className="flex items-center justify-between border-b border-amber-100/60 dark:border-[#33111d] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-amber-50 dark:bg-[#2d0e1c] text-churchgold-600 dark:text-churchgold-300 border border-amber-200/60 dark:border-[#4d1a2c] relative">
                <Cake className="w-5 h-5 animate-bounce" />
                {todayBirthdaysTotal > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-600 rounded-full border-2 border-white dark:border-[#1a0a12] animate-ping"></span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-slate-900 dark:text-stone-100 text-sm">أعياد الميلاد 🎂</h3>
                  {todayBirthdaysTotal > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
                      {todayBirthdaysTotal} اليوم!
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-stone-400">{totalBirthdays} احتفال في شهر {currentMonthLabel}</p>
              </div>
            </div>
            {onOpenBirthdays && (
              <button
                onClick={onOpenBirthdays}
                className="text-xs text-burgundy-700 dark:text-churchgold-300 hover:underline font-bold cursor-pointer"
              >
                عرض التنبيهات
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {totalBirthdays === 0 ? (
              <div className="p-6 text-center text-slate-400 dark:text-stone-500">
                <Gift className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                <p className="font-bold text-slate-600 dark:text-stone-400 text-xs">لا توجد أعياد ميلاد في هذا الشهر لهذه المرحلة.</p>
              </div>
            ) : (
              <>
                {/* Birthday Kids */}
                {birthdayKids.slice(0, 4).map(k => {
                  const { day } = parseBirthDate(k.birthDate, k.birthMonth);
                  const isToday = day === todayDay;
                  return (
                    <div key={k.id} className={`p-3 rounded-2xl border flex items-center justify-between ${
                      isToday 
                        ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900' 
                        : 'bg-[#fcfbf7] dark:bg-[#220b16] border-amber-200/60 dark:border-[#3d1523]'
                    }`}>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-stone-100 text-xs flex items-center gap-1.5">
                          <span>{k.name}</span>
                          {isToday && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[9px] font-black">اليوم! 🎉</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-stone-400">{k.stage} • تاريخ: {k.birthDate || `${day} ${currentMonthLabel}`}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <a href={`tel:${k.parentPhone || k.phone}`} className="p-1.5 rounded-lg bg-white dark:bg-[#2d0e1c] shadow-2xs text-burgundy-700 dark:text-churchgold-300 hover:bg-amber-50 dark:hover:bg-[#3d1326] border border-amber-200/50 dark:border-[#4d1d2c]">
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a href={`https://wa.me/2${k.parentPhone || k.phone}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-white dark:bg-[#2d0e1c] shadow-2xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-[#3d1326] border border-emerald-200/50 dark:border-[#4d1d2c]">
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}

                {/* Birthday Servants */}
                {birthdayServants.slice(0, 3).map(s => {
                  const { day } = parseBirthDate(s.birthDate, s.birthMonth);
                  const isToday = day === todayDay;
                  return (
                    <div key={s.id} className={`p-3 rounded-2xl border flex items-center justify-between ${
                      isToday 
                        ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900' 
                        : 'bg-[#fcfbf7] dark:bg-[#220b16] border-amber-200/60 dark:border-[#3d1523]'
                    }`}>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-stone-100 text-xs flex items-center gap-1.5">
                          <span>خ/ {s.name}</span>
                          {isToday && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[9px] font-black">اليوم! 🎉</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-stone-400">{s.assignedStage} • تاريخ: {s.birthDate || `${day} ${currentMonthLabel}`}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <a href={`tel:${s.phone}`} className="p-1.5 rounded-lg bg-white dark:bg-[#2d0e1c] shadow-2xs text-burgundy-700 dark:text-churchgold-300 hover:bg-amber-50 dark:hover:bg-[#3d1326] border border-amber-200/50 dark:border-[#4d1d2c]">
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a href={`https://wa.me/2${s.phone}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-white dark:bg-[#2d0e1c] shadow-2xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-[#3d1326] border border-emerald-200/50 dark:border-[#4d1d2c]">
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          <div className="pt-2 border-t border-amber-100/60 dark:border-[#33111d] text-center">
            <button
              onClick={() => setActiveTab('children_directory')}
              className="text-xs text-slate-600 dark:text-stone-400 font-bold hover:text-burgundy-700 dark:hover:text-churchgold-300 transition-colors cursor-pointer"
            >
              تصفح كامل دليل الأسماء لافتقاد الغائبين 📞
            </button>
          </div>
        </div>

      </div>

      {/* Modal: Add Notification */}
      {isAddNotifOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a0a12] rounded-3xl max-w-lg w-full shadow-2xl border border-amber-200/80 dark:border-[#4d1d2c] text-slate-900 dark:text-stone-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-[#18060f] via-[#2d0d1b] to-[#14050c] p-5 text-white flex items-center justify-between border-b border-[#3c1322]">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-churchgold-400" />
                <h3 className="text-base font-extrabold text-stone-100">إضافة تنبيه / مناسبة جديدة للمرحلة</h3>
              </div>
              <button onClick={() => setIsAddNotifOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNotifSubmit} className="p-6 space-y-4 text-xs font-medium text-slate-700 dark:text-stone-300">
              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-stone-200">عنوان التنبيه أو الفعالية *</label>
                <input
                  type="text"
                  required
                  value={notifForm.title}
                  onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                  placeholder="مثال: موعد رحلة الصيف، اجتماع الخدام..."
                  className="w-full bg-slate-50 dark:bg-[#250d18] border border-amber-200/80 dark:border-[#4d1d2c] text-slate-900 dark:text-stone-100 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-stone-200">المرحلة المستهدفة</label>
                  <select
                    value={notifForm.targetStage}
                    onChange={(e) => setNotifForm({ ...notifForm, targetStage: e.target.value as Stage })}
                    className="w-full bg-slate-50 dark:bg-[#250d18] border border-amber-200/80 dark:border-[#4d1d2c] text-slate-900 dark:text-stone-100 rounded-xl px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
                  >
                    <option value="عامة">عامة (كافة المراحل)</option>
                    {STAGES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-stone-200">التاريخ</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={notifForm.date}
                      onChange={(e) => setNotifForm({ ...notifForm, date: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#250d18] border border-amber-200/80 dark:border-[#4d1d2c] text-slate-900 dark:text-stone-100 rounded-xl px-2 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-stone-200">تفاصيل التنبيه *</label>
                <textarea
                  rows={3}
                  required
                  value={notifForm.description}
                  onChange={(e) => setNotifForm({ ...notifForm, description: e.target.value })}
                  placeholder="اكتب تفاصيل التنبيه الموجه لأبناء وخُدام المرحلة..."
                  className="w-full bg-slate-50 dark:bg-[#250d18] border border-amber-200/80 dark:border-[#4d1d2c] text-slate-900 dark:text-stone-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-amber-100/60 dark:border-[#33111d]">
                <button
                  type="button"
                  onClick={() => setIsAddNotifOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-[#240b17] hover:bg-stone-200 dark:hover:bg-[#2f101f] text-slate-700 dark:text-stone-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-burgundy-700 to-burgundy-800 hover:from-burgundy-800 hover:to-burgundy-900 text-white font-bold shadow-md border border-churchgold-400/30 cursor-pointer"
                >
                  نشر التنبيه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
