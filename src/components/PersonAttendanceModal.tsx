import React from 'react';
import { useApp } from '../context/AppContext';
import { Child, Servant, Supervisor, AttendanceStatus, ChildEventType, StaffEventType } from '../types';
import { 
  X, Calendar, CheckCircle2, XCircle, Clock, AlertCircle, 
  Printer, Download, User, Church, BookOpen, Sparkles, Crown, Users
} from 'lucide-react';
import { getAttendanceBadgeClass, getStageBadgeClass } from '../utils/themeColors';

interface PersonAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Child | Servant | Supervisor | null;
  targetType: 'child' | 'servant' | 'supervisor';
}

export const PersonAttendanceModal: React.FC<PersonAttendanceModalProps> = ({
  isOpen,
  onClose,
  person,
  targetType
}) => {
  const { attendance } = useApp();

  if (!isOpen || !person) return null;

  const getEventNameArabic = (type: ChildEventType | StaffEventType) => {
    switch (type) {
      case 'mass': return 'القداس الإلهي';
      case 'sunday_school': return 'مدارس الأحد';
      case 'festival': return 'المهرجان';
      case 'general_meeting': return 'اجتماع الخدمة العام';
      case 'supervisors_meeting': return 'اجتماع الأمناء';
      default: return 'نشاط كنسي';
    }
  };

  const getEventIcon = (type: ChildEventType | StaffEventType) => {
    switch (type) {
      case 'mass': return Church;
      case 'sunday_school': return BookOpen;
      case 'festival': return Sparkles;
      case 'general_meeting': return Users;
      case 'supervisors_meeting': return Crown;
      default: return Calendar;
    }
  };

  // Find all attendance records for this person
  const personHistory = attendance
    .filter(rec => rec.targetType === targetType && rec.records && rec.records[person.id])
    .map(rec => {
      const entry = rec.records[person.id];
      return {
        date: rec.date,
        eventType: rec.eventType,
        status: entry.status as AttendanceStatus,
        note: entry.note || ''
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Statistics
  const totalRecords = personHistory.length;
  const presentCount = personHistory.filter(h => h.status === 'present').length;
  const lateCount = personHistory.filter(h => h.status === 'late').length;
  const absentCount = personHistory.filter(h => h.status === 'absent').length;
  const excusedCount = personHistory.filter(h => h.status === 'excused').length;

  const attendanceRate = totalRecords > 0 
    ? Math.round(((presentCount + lateCount) / totalRecords) * 100) 
    : 0;

  // Mass specific
  const massRecords = personHistory.filter(h => h.eventType === 'mass');
  const massPresent = massRecords.filter(h => h.status === 'present' || h.status === 'late').length;

  // Sunday School specific
  const ssRecords = personHistory.filter(h => h.eventType === 'sunday_school');
  const ssPresent = ssRecords.filter(h => h.status === 'present' || h.status === 'late').length;

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['م', 'التاريخ', 'النشاط الكنسي', 'حالة الحضور', 'ملاحظات'];
    const statusMap: Record<string, string> = {
      present: 'حاضر',
      absent: 'غائب',
      late: 'متأخر',
      excused: 'معتذر'
    };

    const rows = personHistory.map((item, idx) => [
      idx + 1,
      `"${item.date}"`,
      `"${getEventNameArabic(item.eventType)}"`,
      `"${statusMap[item.status] || item.status}"`,
      `"${item.note}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `سجل_حضور_${person.name.replace(/[\s\(\)]+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const stageName = (person as any).stage || (person as any).assignedStage || (person as any).supervisedStage || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto" dir="rtl">
      <div className="bg-white dark:bg-[#1a0a12] rounded-3xl max-w-2xl w-full shadow-2xl border border-amber-200/80 dark:border-[#3e1423] overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-950 p-5 text-white flex items-center justify-between no-print border-b border-churchgold-400/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-churchgold-600 to-amber-500 flex items-center justify-center font-bold text-burgundy-950 shadow-xs">
              {person.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-amber-50">{person.name}</h3>
                {stageName && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStageBadgeClass(stageName)}`}>
                    {stageName}
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-200/80 mt-0.5">
                سجل الحضور والغياب التاريخي لجميع الأنشطة الكنسية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-amber-200/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Header */}
        <div className="print-only p-4 text-center border-b border-slate-300 mb-4">
          <h2 className="text-xl font-bold">كنيسة القديسين - سجل حضور وغياب تفصيلي</h2>
          <div className="mt-2 text-sm font-semibold flex justify-between">
            <span>الاسم: {person.name}</span>
            <span>المرحلة: {stageName}</span>
            <span>نسبة الحضور: {attendanceRate}%</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-5 space-y-5 max-h-[78vh] overflow-y-auto">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
            <div className="bg-stone-50 dark:bg-[#250d18] border border-amber-200/80 dark:border-[#3e1423] rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 block">نسبة الحضور الكلية</span>
              <span className="text-2xl font-black text-churchgold-600 dark:text-churchgold-400 mt-0.5 block">{attendanceRate}%</span>
              <span className="text-[10px] text-slate-400 dark:text-stone-500 font-semibold">{presentCount + lateCount} من {totalRecords} لقاء</span>
            </div>

            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">مرات الحضور</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{presentCount}</span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">حاضر في الموعد</span>
            </div>

            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block">تأخيرات وأعذار</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5 block">{lateCount + excusedCount}</span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">{lateCount} متأخر / {excusedCount} معتذر</span>
            </div>

            <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 block">مرات الغياب</span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5 block">{absentCount}</span>
              <span className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold">يحتاج متابعة وافتقاد</span>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-amber-50/60 dark:bg-[#250d18] rounded-2xl border border-amber-200/80 dark:border-[#3e1423] text-xs font-bold text-slate-800 dark:text-stone-200">
            <div className="flex items-center gap-1.5">
              <Church className="w-4 h-4 text-churchgold-600 dark:text-churchgold-400" />
              <span>القداسات: {massPresent} من {massRecords.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-churchgold-600 dark:text-churchgold-400" />
              <span>مدارس الأحد: {ssPresent} من {ssRecords.length}</span>
            </div>
            <div>
              <span>رقم التليفون: {person.phone || 'غير مسجل'}</span>
            </div>
          </div>

          {/* History Records Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 dark:text-stone-300">سجل الأيام السابقة ({totalRecords} يوم مسجل):</h4>
              <div className="flex items-center gap-2 no-print">
                <button
                  onClick={handleExportCSV}
                  disabled={personHistory.length === 0}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-[#250d18] hover:bg-amber-100 dark:hover:bg-[#341121] text-slate-700 dark:text-stone-300 text-xs font-bold border border-amber-200/60 dark:border-[#4d1d2c] transition-colors disabled:opacity-50 cursor-pointer"
                  title="تصدير كشف تاريخ الحضور"
                >
                  <Download className="w-3.5 h-3.5 text-churchgold-600 dark:text-churchgold-400" />
                  <span>تصدير Excel</span>
                </button>
                <button
                  onClick={handlePrint}
                  disabled={personHistory.length === 0}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-[#250d18] hover:bg-amber-100 dark:hover:bg-[#341121] text-slate-700 dark:text-stone-300 text-xs font-bold border border-amber-200/60 dark:border-[#4d1d2c] transition-colors disabled:opacity-50 cursor-pointer"
                  title="طباعة"
                >
                  <Printer className="w-3.5 h-3.5 text-churchgold-600 dark:text-churchgold-400" />
                  <span>طباعة</span>
                </button>
              </div>
            </div>

            {personHistory.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 dark:bg-[#250d18] rounded-2xl border border-amber-200/80 dark:border-[#3e1423] text-slate-400 dark:text-stone-500 text-xs">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-churchgold-500/50" />
                <p className="font-bold text-slate-600 dark:text-stone-300">لا يوجد سجلات حضور مسجلة لهذا الشخص حتى الآن</p>
                <p className="mt-0.5">عند تسجيل حضوره في القداس أو مدارس الأحد، ستظهر تفاصيل كل يوم هنا تلقائياً.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {personHistory.map((item, idx) => {
                  const Icon = getEventIcon(item.eventType);
                  return (
                    <div 
                      key={idx} 
                      className="p-3 bg-white dark:bg-[#1a0a12] rounded-2xl border border-amber-200/80 dark:border-[#3e1423] shadow-2xs hover:border-amber-300 dark:hover:border-churchgold-600 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-50 dark:bg-[#280c18] border border-amber-200/60 dark:border-[#4d1d2c] text-churchgold-700 dark:text-churchgold-300 shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-stone-100">
                              {item.date}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-stone-400 font-bold">
                              • {getEventNameArabic(item.eventType)}
                            </span>
                          </div>
                          {item.note && (
                            <p className="text-xs text-slate-600 dark:text-stone-300 mt-0.5">
                              ملاحظة: {item.note}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 self-start sm:self-auto">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border ${getAttendanceBadgeClass(item.status)}`}>
                          {item.status === 'present' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {item.status === 'late' && <Clock className="w-3.5 h-3.5" />}
                          {item.status === 'excused' && <AlertCircle className="w-3.5 h-3.5" />}
                          {item.status === 'absent' && <XCircle className="w-3.5 h-3.5" />}
                          <span>{item.status === 'present' ? 'حاضر' : item.status === 'late' ? 'متأخر' : item.status === 'excused' ? 'معتذر' : 'غائب'}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 dark:bg-[#250d18] border-t border-amber-200/80 dark:border-[#3e1423] flex justify-end no-print">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-burgundy-900 hover:bg-burgundy-950 text-white dark:text-churchgold-300 text-xs font-bold transition-all shadow-xs cursor-pointer border border-churchgold-400/30"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
