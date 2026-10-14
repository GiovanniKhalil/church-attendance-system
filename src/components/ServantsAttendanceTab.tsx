import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StaffEventType, AttendanceStatus } from '../types';
import { STAGES } from '../data/mockData';
import { 
  Church, BookOpen, Users, Calendar, Check, X, Clock, 
  AlertCircle, Filter, CheckSquare, XSquare, Briefcase, ShieldCheck,
  Search, Download, Printer, BarChart2, History,
  Table, LayoutGrid, CalendarPlus, UserCheck, Crown, CalendarCheck
} from 'lucide-react';
import { PersonAttendanceModal } from './PersonAttendanceModal';
import { getStageBadgeClass } from '../utils/themeColors';

export const ServantsAttendanceTab: React.FC = () => {
  const { 
    servants, attendance, markAttendance, markAllAttendance, 
    getAttendanceRecord, selectedStageScope, role, currentUser, 
    stagesList, setActiveTab 
  } = useApp();

  const [isAddingNewDay, setIsAddingNewDay] = useState(false);
  const [customNewDate, setCustomNewDate] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<StaffEventType>('general_meeting');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedStage, setSelectedStage] = useState<string>(() => {
    if (role === 'amin_khedma_am') return selectedStageScope;
    if (currentUser?.assignedStage && currentUser.assignedStage !== 'عامة' && currentUser.assignedStage !== 'في انتظار التعيين') {
      return currentUser.assignedStage;
    }
    return 'all';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus | 'unrecorded'>('all');
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [viewingServantHistory, setViewingServantHistory] = useState<any>(null);

  React.useEffect(() => {
    if (role === 'amin_khedma_am') {
      setSelectedStage(selectedStageScope);
    } else if (currentUser?.assignedStage && currentUser.assignedStage !== 'عامة' && currentUser.assignedStage !== 'في انتظار التعيين') {
      setSelectedStage(currentUser.assignedStage);
    } else {
      setSelectedStage('all');
    }
  }, [selectedStageScope, role, currentUser]);

  // Extract recorded dates for servants
  const recordedDates: string[] = Array.from(
    new Set<string>(
      attendance
        .filter(a => a.targetType === 'servant' && a.eventType === selectedEventType)
        .map(a => a.date)
    )
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const stageFilteredServants = servants.filter(s => {
    if (selectedStage === 'all') return true;
    return s.assignedStage === selectedStage || 
      (s.assignedStages && s.assignedStages.includes(selectedStage));
  });

  const searchedServants = stageFilteredServants.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      (s.roleTitle && s.roleTitle.toLowerCase().includes(q))
    );
  });

  const currentRecord = getAttendanceRecord('servant', selectedEventType, selectedDate);
  const recordsMap = currentRecord?.records || {};

  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;
  let unrecordedCount = 0;

  stageFilteredServants.forEach(s => {
    const st = recordsMap[s.id]?.status;
    if (st === 'present') presentCount++;
    else if (st === 'absent') absentCount++;
    else if (st === 'late') lateCount++;
    else if (st === 'excused') excusedCount++;
    else unrecordedCount++;
  });

  const displayedServants = searchedServants.filter(s => {
    const st = recordsMap[s.id]?.status;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'unrecorded') return !st;
    return st === statusFilter;
  });

  const totalFiltered = stageFilteredServants.length;
  const attendanceRate = totalFiltered > 0 ? Math.round(((presentCount + lateCount) / totalFiltered) * 100) : 0;

  const handleStatusChange = (servantId: string, status: AttendanceStatus) => {
    const note = noteInputs[servantId] || recordsMap[servantId]?.note || '';
    markAttendance('servant', selectedEventType, selectedDate, servantId, status, note);
  };

  const handleNoteChange = (servantId: string, note: string) => {
    setNoteInputs(prev => ({ ...prev, [servantId]: note }));
    const currentStatus = recordsMap[servantId]?.status || 'present';
    markAttendance('servant', selectedEventType, selectedDate, servantId, currentStatus, note);
  };

  const handleBulkAction = (status: AttendanceStatus) => {
    const ids = searchedServants.map(s => s.id);
    markAllAttendance('servant', selectedEventType, selectedDate, ids, status);
  };

  const getEventNameArabic = (type: StaffEventType) => {
    switch (type) {
      case 'mass': return 'القداس الإلهي';
      case 'sunday_school': return 'مدارس الأحد';
      case 'general_meeting': return 'اجتماع الخدمة العام';
      case 'supervisors_meeting': return 'اجتماع أمناء الفصول';
      default: return 'نشاط الخدمة';
    }
  };

  const handleExportExcel = () => {
    const eventTitle = getEventNameArabic(selectedEventType);
    const headers = ['م', 'اسم الخادم', 'المرحلة الخدمية', 'رقم الهاتف', 'التاريخ', 'النشاط', 'حالة الحضور', 'ملاحظات'];
    
    const statusMap: Record<string, string> = {
      present: 'حاضر',
      absent: 'غائب',
      late: 'متأخر',
      excused: 'معتذر'
    };

    const rows = searchedServants.map((servant, idx) => {
      const st = recordsMap[servant.id]?.status || 'لم يسجل';
      const note = noteInputs[servant.id] || recordsMap[servant.id]?.note || '';
      return [
        idx + 1,
        `"${servant.name}"`,
        `"${servant.assignedStage}"`,
        `"${servant.phone}"`,
        `"${selectedDate}"`,
        `"${eventTitle}"`,
        `"${statusMap[st] || st}"`,
        `"${note}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `حضور_الخدام_${eventTitle.replace(/[\s\(\)]+/g, '_')}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const eventButtons: { id: StaffEventType; label: string; icon: any; color: string; activeBg: string }[] = [
    {
      id: 'mass',
      label: 'القداس الإلهي',
      icon: Church,
      color: 'text-churchgold-600 dark:text-churchgold-400',
      activeBg: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-amber-900/30 border-amber-400/40'
    },
    {
      id: 'sunday_school',
      label: 'مدارس الأحد',
      icon: BookOpen,
      color: 'text-burgundy-700 dark:text-churchgold-300',
      activeBg: 'bg-gradient-to-r from-burgundy-700 to-burgundy-800 text-white shadow-burgundy-950/40 border-churchgold-400/40'
    },
    {
      id: 'general_meeting',
      label: 'اجتماع الخدمة العام',
      icon: Users,
      color: 'text-emerald-600 dark:text-emerald-400',
      activeBg: 'bg-gradient-to-r from-emerald-700 to-teal-800 text-white shadow-emerald-950/30 border-emerald-400/40'
    }
  ];

  return (
    <div className="space-y-5">
      
      {/* Top Attendance Mode Switcher - Guarantees Servant Attendance is Always 1-Click Visible */}
      <div className="bg-white/80 dark:bg-[#1a0a12]/80 backdrop-blur-md p-2 rounded-2xl border border-amber-200/80 dark:border-[#3e1423] shadow-xs flex flex-wrap items-center justify-between gap-2 no-print">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab('children_attendance')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-burgundy-900 dark:hover:text-churchgold-300 hover:bg-amber-100/60 dark:hover:bg-[#2e101d] transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-burgundy-700 dark:text-churchgold-400" />
            <span>حضور المخدومين (الأولاد)</span>
          </button>

          <button
            onClick={() => setActiveTab('servants_attendance')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-800 to-emerald-900 text-white shadow-md border-b-2 border-churchgold-400 cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4 text-churchgold-300" />
            <span>تسجيل حضور الخدام (القسم الحالي)</span>
          </button>

          {role === 'amin_khedma_am' && (
            <button
              onClick={() => setActiveTab('supervisors_attendance')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-amber-800 dark:hover:text-churchgold-300 hover:bg-amber-100/60 dark:hover:bg-[#2e101d] transition-all cursor-pointer"
            >
              <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>حضور أمناء المراحل</span>
            </button>
          )}
        </div>

        <div className="text-[11px] font-bold text-slate-500 dark:text-stone-400 px-2 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>كشف الحضور الرسمي للخدام</span>
        </div>
      </div>
      
      {/* Printable Header */}
      <div className="print-only mb-6 text-center border-b-2 border-slate-900 pb-4">
        <h1 className="text-2xl font-bold">كنيسة القديسين - كشف تسجيل حضور الخدام</h1>
        <div className="flex justify-between items-center text-sm font-semibold mt-2">
          <span>النشاط: {getEventNameArabic(selectedEventType)}</span>
          <span>التاريخ: {selectedDate}</span>
          <span>المرحلة: {selectedStage === 'all' ? 'جميع المراحل' : selectedStage}</span>
          <span>إجمالي الحضور: {presentCount} من {totalFiltered} ({attendanceRate}%)</span>
        </div>
      </div>

      {/* Event Buttons Header */}
      <div className="bg-white dark:bg-[#1a0a12] p-5 rounded-3xl border border-amber-200/80 dark:border-[#3e1423] shadow-xs space-y-4 no-print transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100/70 dark:border-[#381321] pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-stone-100">تسجيل حضور وغياب الخدام</h2>
            <p className="text-xs text-slate-500 dark:text-stone-400 mt-0.5">
              متابعة التزام ومواظبة الخدام في القداس ومدارس الأحد واجتماع الخدمة العام
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Date Picker */}
            <div className="flex items-center gap-2 bg-stone-50 dark:bg-[#250d18] p-2 rounded-2xl border border-amber-200/80 dark:border-[#4d1d2c] shrink-0">
              <Calendar className="w-4 h-4 text-churchgold-600 dark:text-churchgold-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-stone-300">التاريخ:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white dark:bg-[#1c0813] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
              />
            </div>

            {/* Quick Pick Previously Recorded Dates */}
            {recordedDates.length > 0 && (
              <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-[#250d18] p-1.5 rounded-2xl border border-amber-200/80 dark:border-[#4d1d2c] shrink-0">
                <History className="w-3.5 h-3.5 text-slate-500 dark:text-stone-400" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-stone-300">أيام مسجلة:</span>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-white dark:bg-[#1c0813] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-2 py-1 text-xs font-bold text-burgundy-700 dark:text-churchgold-300 focus:outline-none"
                >
                  <option value={selectedDate}>{selectedDate} (الحالي)</option>
                  {recordedDates.filter(d => d !== selectedDate).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Add New Day / Change Date Button */}
            <button
              onClick={() => setIsAddingNewDay(!isAddingNewDay)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-churchgold-300 text-xs font-bold border border-amber-300/80 dark:border-[#4d1d2c] transition-all cursor-pointer shadow-2xs"
              title="زيادة يوم جديد أو تعديل تاريخ كشف الحضور"
            >
              <CalendarPlus className="w-4 h-4 text-amber-700 dark:text-churchgold-400" />
              <span>+ يوم جديد للكشف</span>
            </button>

            {/* Export & Print */}
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-[#250d18] hover:bg-emerald-50 dark:hover:bg-[#1b3829] text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300/70 dark:border-emerald-800/60 transition-colors shadow-2xs cursor-pointer"
              title="تصدير كشف حضور الخدام Excel"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>تصدير Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-[#250d18] hover:bg-amber-100/50 dark:hover:bg-[#341121] text-slate-700 dark:text-stone-300 text-xs font-bold border border-amber-200/70 dark:border-[#4d1d2c] transition-colors shadow-2xs cursor-pointer"
              title="طباعة كشف حضور الخدام"
            >
              <Printer className="w-4 h-4 text-churchgold-600 dark:text-churchgold-400" />
              <span>طباعة ورقية</span>
            </button>
          </div>
        </div>

        {/* Modal / Popover: Add New Day */}
        {isAddingNewDay && (
          <div className="p-3 bg-amber-50/90 dark:bg-[#29111e] rounded-2xl border border-amber-300 dark:border-[#4d1d2c] flex flex-wrap items-center justify-between gap-2.5 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CalendarPlus className="w-5 h-5 text-amber-600 dark:text-churchgold-400" />
              <div>
                <span className="font-black text-xs text-slate-900 dark:text-stone-100 block">
                  زيادة أو تحديد يوم حضور جديد لكشف الخدام
                </span>
                <span className="text-[10px] text-slate-600 dark:text-stone-400">
                  اختر تاريخ اليوم الذي تريد تسجيل حضور خدام المرحلة له
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                defaultValue={selectedDate}
                onChange={(e) => setCustomNewDate(e.target.value)}
                className="bg-white dark:bg-[#1a0a12] border border-amber-300 dark:border-[#4d1d2c] rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-stone-100"
              />
              <button
                type="button"
                onClick={() => {
                  if (customNewDate) {
                    setSelectedDate(customNewDate);
                  }
                  setIsAddingNewDay(false);
                }}
                className="px-3 py-1.5 bg-burgundy-900 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                تأكيد وبدء التسجيل
              </button>
              <button
                type="button"
                onClick={() => setIsAddingNewDay(false)}
                className="px-2 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* The 3 Buttons for Servant Events */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {eventButtons.map(btn => {
            const Icon = btn.icon;
            const isActive = selectedEventType === btn.id;

            return (
              <button
                key={btn.id}
                onClick={() => setSelectedEventType(btn.id)}
                className={`flex items-center justify-center gap-2.5 p-4 rounded-2xl font-black text-sm sm:text-base transition-all duration-200 border cursor-pointer ${
                  isActive
                    ? `${btn.activeBg} shadow-md scale-101`
                    : 'bg-stone-50 dark:bg-[#250d18] hover:bg-amber-50/50 dark:hover:bg-[#321021] text-slate-700 dark:text-stone-300 border-amber-200/80 dark:border-[#4d1d2c]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : btn.color}`} />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search in Servants Attendance & Filters & Quick Bulk Actions */}
      <div className="bg-white dark:bg-[#1a0a12] p-4 rounded-2xl border border-amber-200/80 dark:border-[#3e1423] shadow-xs space-y-3 no-print transition-colors duration-200">
        
        {/* Search Bar Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-churchgold-600 dark:text-churchgold-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الخادم، الوظيفة، المنطقة، أو التليفون في كشف الحضور..."
            className="w-full pl-4 pr-11 py-2.5 bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl text-sm font-semibold text-slate-800 dark:text-stone-100 focus:bg-white dark:focus:bg-[#2c0e1c] focus:outline-none focus:ring-2 focus:ring-burgundy-600/30 focus:border-burgundy-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-stone-200 bg-stone-200/70 dark:bg-[#3d1326] px-2 py-0.5 rounded-lg cursor-pointer"
            >
              مسح
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-t border-amber-100/70 dark:border-[#381321]">
          {/* Stage Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-churchgold-600 dark:text-churchgold-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-stone-300">المرحلة الخدمية:</span>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-burgundy-600/30 cursor-pointer"
            >
              <option value="all">🌐 كافة المراحل الخدمية والخدام ({servants.length} خادم)</option>
              {stagesList.map(st => (
                <option key={st.id || st.name} value={st.name}>
                  {st.name} {currentUser?.assignedStage === st.name ? '⭐ (مرحلتك)' : ''}
                </option>
              ))}
            </select>

            <span className="text-xs text-slate-500 dark:text-stone-400 font-bold mr-2">
              (مطابق: {searchedServants.length} خادم)
            </span>
          </div>

          {/* Quick Bulk Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('present')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-[#12241b] hover:bg-emerald-100 dark:hover:bg-[#1b3829] text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/60 transition-colors cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>تحديد المعروض حاضر</span>
            </button>

            <button
              onClick={() => handleBulkAction('absent')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-[#290d16] hover:bg-rose-100 dark:hover:bg-[#3d1320] text-rose-800 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
            >
              <XSquare className="w-3.5 h-3.5" />
              <span>تحديد المعروض غائب</span>
            </button>
          </div>
        </div>
      </div>

      {/* Realtime Attendance Progress Meter */}
      <div className="bg-gradient-to-r from-[#1a0610] via-[#2d0e1c] to-[#180610] p-5 rounded-2xl text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4 border border-amber-300/30 no-print">
        <div className="w-full md:w-1/2 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-200/90">
            <span>نسبة حضور الخدام ({getEventNameArabic(selectedEventType)} - {selectedDate}):</span>
            <span className="text-churchgold-300 font-black text-sm">{attendanceRate}%</span>
          </div>
          <div className="w-full bg-[#12040c] h-3.5 rounded-full overflow-hidden p-0.5 border border-amber-400/20">
            <div 
              className="bg-gradient-to-r from-churchgold-500 to-amber-300 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <button 
            onClick={() => setStatusFilter(statusFilter === 'present' ? 'all' : 'present')}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'present'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-xs'
                : 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50'
            }`}
          >
            حاضر: {presentCount}
          </button>
          <button 
            onClick={() => setStatusFilter(statusFilter === 'late' ? 'all' : 'late')}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'late'
                ? 'bg-amber-600 text-white border-amber-400 shadow-xs'
                : 'bg-amber-950/50 text-amber-300 border-amber-500/40 hover:bg-amber-900/50'
            }`}
          >
            متأخر: {lateCount}
          </button>
          <button 
            onClick={() => setStatusFilter(statusFilter === 'excused' ? 'all' : 'excused')}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'excused'
                ? 'bg-blue-600 text-white border-blue-400 shadow-xs'
                : 'bg-blue-950/50 text-blue-300 border-blue-500/40 hover:bg-blue-900/50'
            }`}
          >
            معتذر: {excusedCount}
          </button>
          <button 
            onClick={() => setStatusFilter(statusFilter === 'absent' ? 'all' : 'absent')}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'absent'
                ? 'bg-rose-600 text-white border-rose-400 shadow-xs'
                : 'bg-rose-950/50 text-rose-300 border-rose-500/40 hover:bg-rose-900/50'
            }`}
          >
            غائب: {absentCount}
          </button>
        </div>
      </div>

      {/* Status Filter Bar for Today */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white dark:bg-[#1a0a12] p-3 rounded-2xl border border-amber-200/80 dark:border-[#3e1423] shadow-2xs no-print transition-colors duration-200">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-stone-300">
          <Filter className="w-4 h-4 text-churchgold-600 dark:text-churchgold-400" />
          <span>تصفية عرض كشف يوم ({selectedDate}):</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-burgundy-900 dark:bg-burgundy-950 text-white dark:text-churchgold-300 shadow-xs border border-churchgold-400/30'
                : 'bg-stone-100 dark:bg-[#250d18] text-slate-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-[#341121]'
            }`}
          >
            الكل ({searchedServants.length})
          </button>

          <button
            onClick={() => setStatusFilter('present')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'present'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-[#12241b] text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>الحاضرين فقط ({presentCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('late')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'late'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-[#2a1b10] text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>المتأخرين ({lateCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('excused')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'excused'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 dark:bg-[#101b2a] text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>المعتذرين ({excusedCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('absent')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'absent'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 dark:bg-[#290d16] text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100'
            }`}
          >
            <X className="w-3.5 h-3.5" />
            <span>الغائبين فقط ({absentCount})</span>
          </button>

          {unrecordedCount > 0 && (
            <button
              onClick={() => setStatusFilter('unrecorded')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'unrecorded'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-[#250d18] text-slate-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              لم يسجل ({unrecordedCount})
            </button>
          )}
        </div>
      </div>

      {/* Servants Attendance Cards List (Clean Card View: Name, Stage, Status, Note) */}
      <div className="bg-white dark:bg-[#1a0a12] rounded-2xl border border-amber-200/80 dark:border-[#3e1423] shadow-xs overflow-hidden no-print transition-colors duration-200">
        {/* Header Strip with Quick Bulk Actions */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-amber-50 via-amber-100/40 to-stone-50 dark:from-[#250d18] dark:via-[#200a14] dark:to-[#17050d] border-b border-amber-200/80 dark:border-[#3e1423] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-stone-100">
              تسجيل حضور الخدام
            </h3>
            <span className="text-xs text-slate-500 dark:text-stone-400 font-bold">
              ({displayedServants.length} خادم)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('present')}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
              title="تسجيل جميع الخدام المعروضين حاضرين بلمسة واحدة"
            >
              <Check className="w-3.5 h-3.5" />
              <span>تسجيل الكل حاضر ✔</span>
            </button>

            <button
              onClick={() => handleBulkAction('absent')}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-[#280e1b] hover:bg-rose-100 dark:hover:bg-[#381123] text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-900/60 text-xs font-bold transition-all cursor-pointer"
              title="تسجيل جميع الخدام المعروضين غائبين"
            >
              <X className="w-3.5 h-3.5" />
              <span>تسجيل الكل غائب</span>
            </button>
          </div>
        </div>
        <div className="divide-y divide-amber-100/70 dark:divide-[#2e0f1b]">
          {displayedServants.length === 0 ? (
            <div className="p-12 text-center text-slate-400 dark:text-stone-500">
              {statusFilter !== 'all' ? (
                <div>
                  <p className="font-bold text-slate-700 dark:text-stone-300 text-sm">لا يوجد خدام بهذه الحالة ({statusFilter === 'present' ? 'حاضر' : statusFilter === 'absent' ? 'غائب' : statusFilter}) لهذا اليوم.</p>
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="mt-2 text-burgundy-700 dark:text-churchgold-300 hover:underline text-xs font-bold cursor-pointer"
                  >
                    عرض جميع الخدام
                  </button>
                </div>
              ) : searchQuery ? 'لا يوجد خدام مطابقين لكلمة البحث الحالية.' : 'لا يوجد خدام مسجلين في هذه المرحلة.'}
            </div>
          ) : (
            displayedServants.map(servant => {
              const currentStatus = recordsMap[servant.id]?.status;
              const currentNote = noteInputs[servant.id] ?? (recordsMap[servant.id]?.note || '');

              return (
                <div 
                  key={servant.id}
                  className={`p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3.5 transition-colors ${
                    currentStatus === 'present' ? 'bg-emerald-50/50 dark:bg-emerald-950/25' :
                    currentStatus === 'absent' ? 'bg-rose-50/50 dark:bg-rose-950/25' :
                    currentStatus === 'late' ? 'bg-amber-50/50 dark:bg-amber-950/25' :
                    currentStatus === 'excused' ? 'bg-blue-50/50 dark:bg-blue-950/25' : 'hover:bg-amber-50/20 dark:hover:bg-[#200c17]'
                  }`}
                >
                  {/* Name, Avatar & Stage */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-burgundy-800 to-burgundy-600 text-churchgold-200 flex items-center justify-center font-black text-base shrink-0 shadow-xs">
                      {servant.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-base sm:text-lg text-slate-950 dark:text-stone-100 truncate">
                          {servant.name}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-black shrink-0 ${getStageBadgeClass(servant.assignedStage)}`}>
                          {servant.assignedStage}
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 dark:text-stone-300 font-bold mt-0.5">
                        {servant.roleTitle || 'خادم'} • تليفون: {servant.phone || 'بدون تليفون'}
                      </div>
                    </div>
                  </div>

                  {/* Attendance Controls & Note */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    {/* Status Toggle Buttons */}
                    <div className="grid grid-cols-4 gap-1.5 bg-stone-100 dark:bg-[#250d18] p-1 rounded-xl border border-amber-300/80 dark:border-[#4d1d2c]">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(servant.id, 'present')}
                        className={`py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          currentStatus === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-800 dark:text-stone-300 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>حاضر</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(servant.id, 'late')}
                        className={`py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          currentStatus === 'late'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-800 dark:text-stone-300 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        <span>متأخر</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(servant.id, 'excused')}
                        className={`py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          currentStatus === 'excused'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-800 dark:text-stone-300 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                        }`}
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>معتذر</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(servant.id, 'absent')}
                        className={`py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          currentStatus === 'absent'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-800 dark:text-stone-300 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                        }`}
                      >
                        <X className="w-4 h-4" />
                        <span>غائب</span>
                      </button>
                    </div>

                    {/* Note Input */}
                    <div className="w-full sm:w-52">
                      <input
                        type="text"
                        value={currentNote}
                        onChange={(e) => handleNoteChange(servant.id, e.target.value)}
                        placeholder="اكتب ملاحظة أو سبب الغياب..."
                        className="w-full bg-stone-50 dark:bg-[#200b14] border border-amber-300/80 dark:border-[#4d1d2c] rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-950 dark:text-stone-100 placeholder:text-stone-400 focus:bg-white dark:focus:bg-[#2c0e1c] focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Printable Cards List (strictly shown in window.print() - Zero Tables) */}
      <div className="print-only">
        <div className="text-center mb-5 pb-3 border-b-2 border-stone-800">
          <h2 className="text-xl font-black text-stone-900">كشف حضور الخدام - كنيسة ماريوحنا بالمعراج</h2>
          <p className="text-xs font-bold text-stone-700 mt-1">النشاط: {getEventNameArabic(selectedEventType)} • التاريخ: {selectedDate}</p>
        </div>

        <div className="space-y-2">
          {searchedServants.map((s, index) => {
            const status = recordsMap[s.id]?.status;
            const note = noteInputs[s.id] ?? (recordsMap[s.id]?.note || '');
            const statusArabic = status === 'present' ? 'حاضر ✔' : status === 'absent' ? 'غائب ✗' : status === 'late' ? 'متأخر ⏱' : status === 'excused' ? 'معتذر 💬' : 'لم يسجل';
            return (
              <div key={s.id} className="p-3 border border-stone-400 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-stone-700 w-6">{index + 1}.</span>
                  <div>
                    <span className="font-black text-sm text-stone-900">{s.name}</span>
                    <span className="mr-2 text-stone-600 font-bold">({s.assignedStage})</span>
                    <div className="text-[11px] text-stone-600 mt-0.5">
                      تليفون: {s.phone || '-'}
                    </div>
                  </div>
                </div>

                <div className="text-left">
                  <span className={`inline-block px-3 py-1 rounded font-black border text-xs ${
                    status === 'present' ? 'bg-stone-100 border-stone-800 text-stone-900' : 'bg-white border-stone-400 text-stone-800'
                  }`}>
                    {statusArabic}
                  </span>
                  {note && <div className="text-[10px] text-stone-600 mt-1">ملاحظة: {note}</div>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-between text-xs font-bold pt-4 border-t-2 border-stone-800">
          <div>توقيع أمين المرحلة: .........................</div>
          <div>توقيع أمين الخدمة العام: .........................</div>
          <div>اعتماد كاهن الخدمة: .........................</div>
        </div>
      </div>

      {/* Person Attendance History Modal */}
      <PersonAttendanceModal
        isOpen={!!viewingServantHistory}
        onClose={() => setViewingServantHistory(null)}
        person={viewingServantHistory}
        targetType="servant"
      />

    </div>
  );
};
