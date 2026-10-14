import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StaffEventType, AttendanceStatus } from '../types';
import { 
  Church, BookOpen, Users, Calendar, Check, X, Clock, 
  AlertCircle, CheckSquare, XSquare, Crown, Briefcase,
  Search, Download, Printer, Filter, ShieldCheck, UserCheck,
  ChevronDown, SlidersHorizontal, ArrowUpDown,
  Table, LayoutGrid, CalendarPlus, CalendarCheck
} from 'lucide-react';
import { getStageBadgeClass } from '../utils/themeColors';

export const SupervisorsAttendanceTab: React.FC = () => {
  const { supervisors, markAttendance, markAllAttendance, getAttendanceRecord, stagesList, setActiveTab } = useApp();

  const [isAddingNewDay, setIsAddingNewDay] = useState(false);
  const [customNewDate, setCustomNewDate] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<StaffEventType>('general_meeting');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [searchQuery, setSearchQuery] = useState('');
  // Role separation tab: 'supervisors' (Head supervisors) vs 'assistants' (Assistant supervisors) vs 'all'
  const [activeRoleView, setActiveRoleView] = useState<'supervisors' | 'assistants' | 'all'>('supervisors');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all');
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);

  // Separate lists
  const headSupervisors = supervisors.filter(s => !s.isAssistant && s.roleType !== 'assistant_supervisor');
  const assistantSupervisors = supervisors.filter(s => s.isAssistant || s.roleType === 'assistant_supervisor');

  // Filter based on active role tab, stage, and search query
  const displayedSupervisors = supervisors.filter(s => {
    const isAssistant = !!(s.isAssistant || s.roleType === 'assistant_supervisor');

    // Role separation filter
    if (activeRoleView === 'supervisors' && isAssistant) return false;
    if (activeRoleView === 'assistants' && !isAssistant) return false;

    // Stage filter
    if (stageFilter !== 'all' && s.assignedStage !== stageFilter && s.supervisedStage !== stageFilter) {
      return false;
    }

    // Search query
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const match = s.name.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q)) ||
        (s.assignedStage && s.assignedStage.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const currentRecord = getAttendanceRecord('supervisor', selectedEventType, selectedDate);
  const recordsMap = currentRecord?.records || {};

  // Status-filtered supervisors
  const finalList = displayedSupervisors.filter(s => {
    if (statusFilter === 'all') return true;
    const st = recordsMap[s.id]?.status;
    return st === statusFilter;
  });

  // Calculate live statistics
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;
  let unrecordedCount = 0;

  displayedSupervisors.forEach(s => {
    const st = recordsMap[s.id]?.status;
    if (st === 'present') presentCount++;
    else if (st === 'absent') absentCount++;
    else if (st === 'late') lateCount++;
    else if (st === 'excused') excusedCount++;
    else unrecordedCount++;
  });

  const totalDisplayed = displayedSupervisors.length;
  const attendanceRate = totalDisplayed > 0 
    ? Math.round(((presentCount + lateCount) / totalDisplayed) * 100) 
    : 0;

  const handleStatusChange = (supId: string, status: AttendanceStatus) => {
    const note = noteInputs[supId] || recordsMap[supId]?.note || '';
    markAttendance('supervisor', selectedEventType, selectedDate, supId, status, note);
  };

  const handleNoteChange = (supId: string, note: string) => {
    setNoteInputs(prev => ({ ...prev, [supId]: note }));
    const currentStatus = recordsMap[supId]?.status || 'present';
    markAttendance('supervisor', selectedEventType, selectedDate, supId, currentStatus, note);
  };

  const handleBulkAction = (status: AttendanceStatus) => {
    const ids = finalList.map(s => s.id);
    markAllAttendance('supervisor', selectedEventType, selectedDate, ids, status);
  };

  const getEventNameArabic = (type: StaffEventType) => {
    switch (type) {
      case 'mass': return 'القداس الإلهي';
      case 'sunday_school': return 'مدارس الأحد';
      case 'general_meeting': return 'اجتماع الخدمة العام';
      case 'supervisors_meeting': return 'اجتماع الأمناء والمساعدين';
      default: return 'اجتماع القيادات';
    }
  };

  const handleExportExcel = () => {
    const eventTitle = getEventNameArabic(selectedEventType);
    const headers = ['م', 'الاسم', 'الصفة / الدور', 'المرحلة المسندة', 'رقم الهاتف', 'التاريخ', 'النشاط', 'حالة الحضور', 'ملاحظات'];
    
    const statusMap: Record<string, string> = {
      present: 'حاضر',
      absent: 'غائب',
      late: 'متأخر',
      excused: 'معتذر'
    };

    const rows = finalList.map((sup, idx) => {
      const isAssistant = !!(sup.isAssistant || sup.roleType === 'assistant_supervisor');
      const roleName = isAssistant ? 'مساعد أمين مرحلة' : 'أمين مرحلة';
      const st = recordsMap[sup.id]?.status || 'لم يسجل';
      const note = noteInputs[sup.id] || recordsMap[sup.id]?.note || '';
      return [
        idx + 1,
        `"${sup.name}"`,
        `"${roleName}"`,
        `"${sup.assignedStage}"`,
        `"${sup.phone}"`,
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
    link.setAttribute('download', `حضور_القيادات_${activeRoleView}_${selectedDate}_${selectedEventType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const eventPills: { id: StaffEventType; label: string; icon: any; shortLabel: string }[] = [
    { id: 'mass', label: 'القداس الإلهي', shortLabel: 'القداس', icon: Church },
    { id: 'sunday_school', label: 'مدارس الأحد', shortLabel: 'مدارس الأحد', icon: BookOpen },
    { id: 'general_meeting', label: 'اجتماع الخدمة العام', shortLabel: 'الاجتماع العام', icon: Users },
    { id: 'supervisors_meeting', label: 'اجتماع الأمناء والمساعدين', shortLabel: 'اجتماع الأمناء', icon: Crown }
  ];

  return (
    <div className="space-y-4">
      
      {/* Top Attendance Mode Switcher */}
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
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-churchgold-300 hover:bg-emerald-50 dark:hover:bg-[#11291f] transition-all cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>تسجيل حضور الخدام</span>
          </button>

          <button
            onClick={() => setActiveTab('supervisors_attendance')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-md border-b-2 border-churchgold-400 cursor-pointer"
          >
            <Crown className="w-4 h-4 text-churchgold-300" />
            <span>حضور أمناء المراحل (النشط)</span>
          </button>
        </div>

        <div className="text-[11px] font-bold text-slate-500 dark:text-stone-400 px-2 flex items-center gap-1">
          <Crown className="w-3.5 h-3.5 text-amber-600" />
          <span>كشف الحضور الرسمي للقيادات</span>
        </div>
      </div>
      
      {/* 
        ====================================================================
        UNIFIED COMPACT CONTROL HEADER
        Replaces the previous 3 bulky stacked cards with 1 sleek compact bar
        ====================================================================
      */}
      <div className="bg-white dark:bg-[#1a0a12] rounded-2xl border border-amber-200/80 dark:border-[#3e1423] p-3.5 sm:p-4 shadow-2xs space-y-3 no-print transition-colors duration-200">
        
        {/* Top Line: Title & Date & Utility buttons in one sleek row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-amber-100/70 dark:border-[#341121]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-churchgold-600 to-amber-500 text-burgundy-950 flex items-center justify-center font-black shadow-xs shrink-0">
              <Crown className="w-4 h-4 text-burgundy-950" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-stone-100 leading-tight">
                تسجيل حضور القيادات الكنسية
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-stone-400">
                متابعة حضور أمناء المراحل ومساعدي الأمناء في الأنشطة الكنسية
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto shrink-0">
            {/* Date Input */}
            <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-[#250d18] px-2.5 py-1 rounded-xl border border-amber-200/80 dark:border-[#4d1d2c] text-xs font-bold text-slate-800 dark:text-stone-200">
              <Calendar className="w-3.5 h-3.5 text-churchgold-600 dark:text-churchgold-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer"
              />
            </div>

            {/* Add New Day / Change Date Button */}
            <button
              type="button"
              onClick={() => setIsAddingNewDay(!isAddingNewDay)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-churchgold-300 text-xs font-bold border border-amber-300/80 dark:border-[#4d1d2c] transition-all cursor-pointer shadow-2xs"
              title="زيادة يوم جديد أو تعديل تاريخ كشف الحضور"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-amber-700 dark:text-churchgold-400" />
              <span className="hidden sm:inline">+ يوم جديد للكشف</span>
              <span className="sm:hidden">+ يوم</span>
            </button>

            {/* Advanced Tools Toggle (Export, Print, Bulk Actions) */}
            <button
              onClick={() => setShowAdvancedTools(prev => !prev)}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                showAdvancedTools 
                  ? 'bg-burgundy-900 text-churchgold-300 border-churchgold-500/40 shadow-xs' 
                  : 'bg-stone-50 dark:bg-[#250d18] text-slate-700 dark:text-stone-300 border-amber-200/80 dark:border-[#4d1d2c] hover:bg-stone-100'
              }`}
              title="إجراءات التصدير والطباعة والتعيين الجماعي"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-churchgold-500" />
              <span className="hidden sm:inline">أدوات إضافية</span>
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
                  زيادة أو تحديد يوم حضور جديد لكشف أمناء الفصول والمساعدين
                </span>
                <span className="text-[10px] text-slate-600 dark:text-stone-400">
                  اختر تاريخ اليوم الذي تريد تسجيل الحضور له
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

        {/* Second Line: Compact Activity Segmented Pills (Saves ~100px of vertical space) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 shrink-0 hidden md:inline ml-1">
            النشاط:
          </span>
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-[#230c17] rounded-xl border border-amber-200/60 dark:border-[#381321] w-full sm:w-auto">
            {eventPills.map(pill => {
              const Icon = pill.icon;
              const isActive = selectedEventType === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setSelectedEventType(pill.id)}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-burgundy-800 to-burgundy-900 text-white shadow-xs border border-churchgold-500/40'
                      : 'text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-stone-100 hover:bg-white/60 dark:hover:bg-[#2d111e]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-churchgold-300' : 'text-slate-500 dark:text-stone-400'}`} />
                  <span className="whitespace-nowrap">{pill.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 
          Third Line: ROLE SEPARATION TABS (Directly answers "تفصلها بطريقة أفضل")
          Clean separated view for Head Supervisors vs Assistant Supervisors vs All
        */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-2 border-t border-amber-100/70 dark:border-[#341121]">
          
          {/* Distinct Role Separation Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveRoleView('supervisors')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeRoleView === 'supervisors'
                  ? 'bg-amber-500 text-burgundy-950 ring-2 ring-amber-400/40 shadow-xs'
                  : 'bg-stone-50 dark:bg-[#240b17] text-slate-700 dark:text-stone-300 border border-amber-200/80 dark:border-[#4d1d2c] hover:bg-amber-50/50'
              }`}
            >
              <span>👑 أمناء الفصول</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeRoleView === 'supervisors' ? 'bg-burgundy-950 text-amber-300' : 'bg-amber-100 dark:bg-[#341121] text-amber-900 dark:text-churchgold-300'
              }`}>
                {headSupervisors.length}
              </span>
            </button>

            <button
              onClick={() => setActiveRoleView('assistants')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeRoleView === 'assistants'
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400/40 shadow-xs'
                  : 'bg-stone-50 dark:bg-[#240b17] text-slate-700 dark:text-stone-300 border border-amber-200/80 dark:border-[#4d1d2c] hover:bg-blue-50/50'
              }`}
            >
              <span>🤝 مساعدين الأمناء</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeRoleView === 'assistants' ? 'bg-white text-blue-800' : 'bg-blue-100 dark:bg-[#1a2538] text-blue-900 dark:text-blue-300'
              }`}>
                {assistantSupervisors.length}
              </span>
            </button>

            <button
              onClick={() => setActiveRoleView('all')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeRoleView === 'all'
                  ? 'bg-churchgold-600 text-burgundy-950 font-black shadow-xs'
                  : 'bg-stone-50 dark:bg-[#240b17] text-slate-700 dark:text-stone-300 border border-amber-200/80 dark:border-[#4d1d2c] hover:bg-stone-100'
              }`}
            >
              <span>الكل معاً</span>
              <span className="text-[10px] opacity-75">({supervisors.length})</span>
            </button>
          </div>

          {/* Search Input & Stage Scope Filter (Side by side) */}
          <div className="flex items-center gap-2">
            {/* Stage Filter */}
            <div className="flex items-center gap-1 bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-2 py-1 text-xs shrink-0">
              <Filter className="w-3.5 h-3.5 text-churchgold-600 dark:text-churchgold-400" />
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-800 dark:text-stone-200 focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">كل المراحل</option>
                {stagesList.map(st => (
                  <option key={st.id || st.name} value={st.name}>{st.name}</option>
                ))}
              </select>
            </div>

            {/* Quick Search */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-churchgold-600 dark:text-churchgold-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم أو الهاتف..."
                className="w-full pl-6 pr-8 py-1 bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl text-xs font-semibold text-slate-800 dark:text-stone-100 focus:bg-white dark:focus:bg-[#2c0e1c] focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

        </div>

        {/* 
          Fourth Line: SLIM INLINE STATS & QUICK BULK ACTION STRIP
          No more huge separate box; this is integrated right into the controls!
        */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-amber-100/70 dark:border-[#341121] text-xs">
          
          {/* Live Progress & Status Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-stone-300">
              <span>نسبة الحضور:</span>
              <span className="font-extrabold text-churchgold-600 dark:text-churchgold-400 font-mono text-sm">
                {attendanceRate}%
              </span>
            </div>

            <div className="h-3 w-px bg-amber-200 dark:bg-[#4d1d2c] hidden sm:block" />

            <div className="flex items-center gap-1.5 flex-wrap">
              <button 
                onClick={() => setStatusFilter(statusFilter === 'present' ? 'all' : 'present')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                  statusFilter === 'present'
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60'
                }`}
              >
                حاضر: {presentCount}
              </button>

              <button 
                onClick={() => setStatusFilter(statusFilter === 'late' ? 'all' : 'late')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                  statusFilter === 'late'
                    ? 'bg-amber-500 text-burgundy-950 border-amber-600 font-black'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800/60'
                }`}
              >
                متأخر: {lateCount}
              </button>

              <button 
                onClick={() => setStatusFilter(statusFilter === 'excused' ? 'all' : 'excused')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                  statusFilter === 'excused'
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800/60'
                }`}
              >
                معتذر: {excusedCount}
              </button>

              <button 
                onClick={() => setStatusFilter(statusFilter === 'absent' ? 'all' : 'absent')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                  statusFilter === 'absent'
                    ? 'bg-rose-600 text-white border-rose-700'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800/60'
                }`}
              >
                غائب: {absentCount}
              </button>
            </div>
          </div>

          {/* Quick Bulk Actions */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={() => handleBulkAction('present')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold border border-emerald-300/80 dark:border-emerald-800 cursor-pointer transition-colors"
            >
              <CheckSquare className="w-3 h-3" />
              <span>الكل حاضر</span>
            </button>
            <button
              onClick={() => handleBulkAction('absent')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 text-[11px] font-bold border border-rose-300/80 dark:border-rose-800 cursor-pointer transition-colors"
            >
              <XSquare className="w-3 h-3" />
              <span>الكل غائب</span>
            </button>
          </div>

        </div>

        {/* Collapsible Advanced Tools Drawer (Excel, Print) */}
        {showAdvancedTools && (
          <div className="p-3 bg-stone-50 dark:bg-[#220a16] rounded-xl border border-amber-200/80 dark:border-[#4d1d2c] flex flex-wrap items-center justify-between gap-2.5 animate-in fade-in duration-150">
            <span className="text-xs font-bold text-slate-600 dark:text-stone-300">
              تصدير وطباعة كشف القيادات المحددة ({finalList.length} خادم):
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير Excel</span>
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-[#341121] hover:bg-stone-300 text-slate-800 dark:text-stone-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة للورق</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Supervisors Attendance Cards List (Clean Card View: Name, Role, Stage, Status, Note) */}
        <div className="bg-white dark:bg-[#1a0a12] rounded-2xl border border-amber-200/80 dark:border-[#3e1423] shadow-xs overflow-hidden no-print transition-colors">
          {/* Header Strip of the Attendance Sheet */}
          <div className="p-3 sm:p-4 bg-gradient-to-r from-amber-50 via-amber-100/40 to-stone-50 dark:from-[#250d18] dark:via-[#200a14] dark:to-[#17050d] border-b border-amber-200/80 dark:border-[#3e1423] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-burgundy-900 text-amber-100 flex items-center justify-center font-black text-xs shadow-xs">
                <Table className="w-4 h-4 text-churchgold-300" />
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-stone-100">
                  كشف تسجيل حضور أمناء المراحل ومساعديهم المعتمد (جدول الاستمارة)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-stone-400">
                  نشاط: <strong className="text-burgundy-900 dark:text-churchgold-300">{getEventNameArabic(selectedEventType)}</strong> • تاريخ: <strong className="font-mono text-slate-800 dark:text-stone-200">{selectedDate}</strong>
                </p>
              </div>
            </div>

            {/* Quick Bulk Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('present')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                title="تسجيل جميع القيادات المعروضة حاضرين بلمسة واحدة"
              >
                <Check className="w-3.5 h-3.5" />
                <span>تسجيل الكل حاضر ✔</span>
              </button>

              <button
                onClick={() => handleBulkAction('absent')}
                className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-[#280e1b] hover:bg-rose-100 dark:hover:bg-[#381123] text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-900/60 text-xs font-bold transition-all cursor-pointer"
                title="تسجيل جميع القيادات المعروضة غائبين"
              >
                <X className="w-3.5 h-3.5" />
                <span>تسجيل الكل غائب</span>
              </button>
            </div>
          </div>



        {/* Live Attendance Summary Strip */}
        <div className="p-3 bg-stone-50/80 dark:bg-[#200a14] border-b border-amber-200/60 dark:border-[#381421] flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-bold text-slate-700 dark:text-stone-300">
            إجمالي المعروض: <strong className="text-slate-900 dark:text-stone-100">{finalList.length}</strong> قيادة
          </span>
          <div className="flex items-center gap-3 font-bold">
            <span className="text-emerald-700 dark:text-emerald-400">حاضر: {presentCount}</span>
            <span className="text-amber-700 dark:text-amber-400">متأخر: {lateCount}</span>
            <span className="text-blue-700 dark:text-blue-400">معتذر: {excusedCount}</span>
            <span className="text-rose-700 dark:text-rose-400">غائب: {absentCount}</span>
            <span className="font-black text-burgundy-900 dark:text-churchgold-300">نسبة الالتزام: {attendanceRate}%</span>
          </div>
        </div>

        <div className="divide-y divide-amber-100/70 dark:divide-[#2e0f1b]">
          {finalList.length === 0 ? (
            <div className="p-10 text-center text-slate-500 dark:text-stone-400 space-y-2">
              <Crown className="w-8 h-8 text-churchgold-400 mx-auto opacity-70" />
              <p className="font-bold text-xs sm:text-sm">لا توجد قيادات مطابقة للبحث أو الفلتر المختار</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStageFilter('all');
                  setStatusFilter('all');
                }}
                className="text-xs font-bold text-burgundy-700 dark:text-churchgold-400 underline cursor-pointer"
              >
                إلغاء الفلاتر وعرض الكل
              </button>
            </div>
          ) : (
            finalList.map(sup => {
              const record = recordsMap[sup.id];
              const currentStatus = record?.status;
              const currentNote = noteInputs[sup.id] !== undefined ? noteInputs[sup.id] : (record?.note || '');
              const isAssistant = !!(sup.isAssistant || sup.roleType === 'assistant_supervisor');

              return (
                <div 
                  key={sup.id}
                  className={`p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3.5 transition-colors ${
                    currentStatus === 'present' ? 'bg-emerald-50/50 dark:bg-emerald-950/25' :
                    currentStatus === 'absent' ? 'bg-rose-50/50 dark:bg-rose-950/25' :
                    currentStatus === 'late' ? 'bg-amber-50/50 dark:bg-amber-950/25' :
                    currentStatus === 'excused' ? 'bg-blue-50/50 dark:bg-blue-950/25' : 'hover:bg-amber-50/20 dark:hover:bg-[#200c17]'
                  }`}
                >
                  {/* Supervisor Profile Summary */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shrink-0 shadow-xs ${
                      isAssistant
                        ? 'bg-gradient-to-tr from-blue-700 to-indigo-600'
                        : 'bg-gradient-to-tr from-amber-600 to-churchgold-500 text-burgundy-950'
                    }`}>
                      {isAssistant ? '🤝' : <Crown className="w-5 h-5 text-burgundy-950" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-base sm:text-lg text-slate-950 dark:text-stone-100 truncate">
                          {sup.name}
                        </span>
                        
                        {/* Role Badge: 👑 أمين مرحلة vs 🤝 مساعد أمين */}
                        {isAssistant ? (
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-300 dark:border-blue-700 flex items-center gap-1 shrink-0">
                            <span>🤝</span>
                            <span>مساعد أمين مرحلة</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-churchgold-300 border border-amber-300 dark:border-churchgold-700 flex items-center gap-1 shrink-0">
                            <span>👑</span>
                            <span>أمين مرحلة</span>
                          </span>
                        )}

                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black border ${getStageBadgeClass(sup.assignedStage)} shrink-0`}>
                          {sup.assignedStage}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 dark:text-stone-300 mt-1 flex flex-wrap items-center gap-3 font-bold">
                        {sup.phone && <span className="font-mono dir-ltr font-black text-slate-950 dark:text-stone-100">📞 {sup.phone}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Attendance Controls & Note in Single Line */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 self-stretch md:self-auto shrink-0">
                    
                    {/* Status Toggle Buttons */}
                    <div className="grid grid-cols-4 gap-1.5 bg-stone-100 dark:bg-[#250d18] p-1 rounded-xl border border-amber-300/80 dark:border-[#4d1d2c]">
                      <button
                        onClick={() => handleStatusChange(sup.id, 'present')}
                        className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          currentStatus === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-stone-700 dark:text-stone-300 hover:text-emerald-700'
                        }`}
                        title="حاضر"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>حاضر</span>
                      </button>

                      <button
                        onClick={() => handleStatusChange(sup.id, 'late')}
                        className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          currentStatus === 'late'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-stone-700 dark:text-stone-300 hover:text-amber-700'
                        }`}
                        title="متأخر"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>متأخر</span>
                      </button>

                      <button
                        onClick={() => handleStatusChange(sup.id, 'excused')}
                        className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          currentStatus === 'excused'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-stone-700 dark:text-stone-300 hover:text-blue-700'
                        }`}
                        title="معتذر"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>معتذر</span>
                      </button>

                      <button
                        onClick={() => handleStatusChange(sup.id, 'absent')}
                        className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          currentStatus === 'absent'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-stone-700 dark:text-stone-300 hover:text-rose-700'
                        }`}
                        title="غائب"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>غائب</span>
                      </button>
                    </div>

                    {/* Note Input */}
                    <input
                      type="text"
                      value={currentNote}
                      onChange={(e) => handleNoteChange(sup.id, e.target.value)}
                      placeholder="ملاحظات..."
                      className="w-full sm:w-44 bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-stone-100 placeholder-stone-400 focus:bg-white dark:focus:bg-[#2c0e1c] focus:outline-none"
                    />

                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Printable Cards List strictly for Window Print (Zero Tables) */}
      <div className="print-only">
        <div className="text-center mb-5 pb-3 border-b-2 border-stone-800">
          <h2 className="text-xl font-black text-stone-900">كشف حضور القيادات الكنسية وأمناء الفصول - {getEventNameArabic(selectedEventType)}</h2>
          <p className="text-xs font-bold text-stone-700 mt-1">التاريخ: {selectedDate}</p>
        </div>

        <div className="space-y-2">
          {finalList.map((sup, index) => {
            const record = recordsMap[sup.id];
            const isAssistant = !!(sup.isAssistant || sup.roleType === 'assistant_supervisor');
            const statusArabic = record?.status === 'present' ? 'حاضر ✔' : record?.status === 'absent' ? 'غائب ✗' : record?.status === 'late' ? 'متأخر ⏱' : record?.status === 'excused' ? 'معتذر 💬' : 'لم يسجل';
            return (
              <div key={sup.id} className="p-3 border border-stone-400 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-stone-700 w-6">{index + 1}.</span>
                  <div>
                    <span className="font-black text-sm text-stone-900">{sup.name}</span>
                    <span className="mr-2 text-stone-700 font-black">({isAssistant ? 'مساعد أمين مرحلة' : 'أمين مرحلة'} - {sup.assignedStage})</span>
                    <div className="text-[11px] text-stone-600 mt-0.5">
                      تليفون: {sup.phone || '-'}
                    </div>
                  </div>
                </div>

                <div className="text-left">
                  <span className={`inline-block px-3 py-1 rounded font-black border text-xs ${
                    record?.status === 'present' ? 'bg-stone-100 border-stone-800 text-stone-900' : 'bg-white border-stone-400 text-stone-800'
                  }`}>
                    {statusArabic}
                  </span>
                  {record?.note && <div className="text-[10px] text-stone-600 mt-1">ملاحظة: {record.note}</div>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-between text-xs font-bold pt-4 border-t-2 border-stone-800">
          <div>توقيع أمين الخدمة العام: .........................</div>
          <div>اعتماد كاهن الخدمة: .........................</div>
        </div>
      </div>

    </div>
  );
};
