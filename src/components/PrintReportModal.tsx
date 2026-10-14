import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Child, AttendanceRecord, EventType } from '../types';
import { calculateAge } from '../utils/dateUtils';
import { EVENT_LABELS, MONTHS } from '../data/mockData';
import { Printer, Download, X, FileText, CheckCircle2, Calendar, ShieldCheck } from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType?: 'directory' | 'attendance';
  initialStage?: string;
  initialMonth?: number;
  initialEvent?: EventType;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  reportType = 'directory',
  initialStage = 'all',
  initialMonth = new Date().getMonth() + 1,
  initialEvent = 'sunday_school'
}) => {
  const { children, attendance, stagesList, currentUser } = useApp();
  const [selectedStage, setSelectedStage] = useState(initialStage);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedEvent, setSelectedEvent] = useState<EventType>(initialEvent);
  const [type, setType] = useState<'directory' | 'attendance'>(reportType);

  if (!isOpen) return null;

  const scopedChildren = selectedStage === 'all' 
    ? children 
    : children.filter(c => c.stage === selectedStage);

  // Month attendance records
  const monthRecords = attendance.filter(a => {
    if (a.targetType !== 'child') return false;
    if (a.eventType !== selectedEvent) return false;
    const parts = a.date.split('-');
    const recordMonth = parseInt(parts[1], 10);
    return recordMonth === selectedMonth;
  });

  const uniqueDates: string[] = Array.from(new Set<string>(monthRecords.map(r => r.date))).sort();
  const monthLabel = MONTHS.find(m => m.value === selectedMonth)?.label || `شهر ${selectedMonth}`;
  const todayDateStr = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#1a0a12] text-slate-900 dark:text-stone-100 rounded-3xl max-w-4xl w-full shadow-2xl border border-amber-200/80 dark:border-[#3e1423] overflow-hidden my-4 max-h-[92vh] flex flex-col">
        
        {/* Modal Controls Header (Hidden in Print) */}
        <div className="bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-950 p-4 sm:p-5 text-white flex items-center justify-between shrink-0 no-print border-b border-churchgold-400/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-churchgold-500 to-amber-500 text-burgundy-950 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-amber-50">تصدير وطباعة تقرير PDF رسمي</h3>
              <p className="text-xs text-churchgold-300">جاهز للتنزيل كملف PDF وحفظه أو طباعته ورقياً</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-churchgold-500 to-amber-500 hover:from-churchgold-600 hover:to-amber-600 text-burgundy-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all border border-churchgold-300/40"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة / حفظ كـ PDF</span>
            </button>

            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar (Hidden in Print) */}
        <div className="p-3 bg-stone-50 dark:bg-[#230d17] border-b border-amber-200/70 dark:border-[#3a1421] flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-stone-300">نوع التقرير:</span>
            <div className="flex items-center gap-1 bg-white dark:bg-[#1a0a12] p-1 rounded-xl border border-amber-200/80 dark:border-[#4d1d2c]">
              <button
                onClick={() => setType('directory')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  type === 'directory' 
                    ? 'bg-burgundy-800 text-churchgold-200' 
                    : 'text-slate-600 dark:text-stone-400 hover:text-slate-900'
                }`}
              >
                كشف بيانات المخدومين
              </button>
              <button
                onClick={() => setType('attendance')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  type === 'attendance' 
                    ? 'bg-burgundy-800 text-churchgold-200' 
                    : 'text-slate-600 dark:text-stone-400 hover:text-slate-900'
                }`}
              >
                سجل الحضور الشهري
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-600 dark:text-stone-400">المرحلة:</span>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="bg-white dark:bg-[#1a0a12] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-2.5 py-1 font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="all">جميع المراحل ({children.length})</option>
                {stagesList.map(s => (
                  <option key={s.id || s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            {type === 'attendance' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-600 dark:text-stone-400">الشهر:</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                    className="bg-white dark:bg-[#1a0a12] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-2.5 py-1 font-bold text-xs focus:outline-none cursor-pointer"
                  >
                    {MONTHS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-600 dark:text-stone-400">النشاط:</span>
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value as EventType)}
                    className="bg-white dark:bg-[#1a0a12] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-2.5 py-1 font-bold text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="sunday_school">مدارس الأحد</option>
                    <option value="mass">القداس الإلهي</option>
                    <option value="mahragan">مهرجان الكرازة</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Printable Document Paper Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-slate-900 font-['Cairo',sans-serif] print:p-0 print:overflow-visible">
          
          {/* Official Church Letterhead */}
          <div className="border-b-2 border-stone-800 pb-4 mb-6 flex items-center justify-between">
            <div className="text-right">
              <h2 className="text-base font-extrabold text-stone-900">مطرانية المعادي للأقباط الأرثوذكس</h2>
              <h1 className="text-lg font-black text-stone-900">كنيسة القديس يوحنا المعمدان بالمعراج</h1>
              <p className="text-xs text-stone-600 font-bold mt-0.5">قطاع خدمة ومدارس الأحد • تقرير رسمي</p>
            </div>

            <div className="text-center">
              <img 
                src="/church_logo.jpg" 
                alt="شعار الكنيسة" 
                className="w-16 h-16 rounded-full object-cover ring-2 ring-stone-800 mx-auto shadow-sm"
              />
              <span className="text-[10px] text-stone-500 font-bold block mt-1">تأسست 2004م</span>
            </div>

            <div className="text-left text-xs font-semibold text-stone-600 space-y-1">
              <div><strong>تاريخ الاستخراج:</strong> {todayDateStr}</div>
              <div><strong>المسؤول:</strong> {currentUser?.name || 'أمين الخدمة'}</div>
              <div><strong>المرحلة المستخرجة:</strong> {selectedStage === 'all' ? 'كافة المراحل' : selectedStage}</div>
            </div>
          </div>

          {/* Report Title Badge */}
          <div className="text-center my-4">
            <div className="inline-block bg-stone-100 border border-stone-300 px-6 py-1.5 rounded-full">
              <h2 className="text-base font-black text-stone-900">
                {type === 'directory' 
                  ? `كشف مخدومي مرحلة (${selectedStage === 'all' ? 'جميع المراحل' : selectedStage}) - إجمالي: ${scopedChildren.length} ولد`
                  : `سجل حضور ${EVENT_LABELS[selectedEvent]} لـ ${monthLabel} (${selectedStage === 'all' ? 'كافة المراحل' : selectedStage})`
                }
              </h2>
            </div>
          </div>

          {/* Report Content - Clean Modern Cards (Zero Tables Format) */}
          {type === 'directory' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto p-1">
              {scopedChildren.map((kid, idx) => {
                const age = calculateAge(kid.birthDate, kid.age);
                return (
                  <div key={kid.id} className="p-3 bg-stone-50 border border-stone-300 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-stone-200 text-stone-800 font-mono font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-black text-sm text-stone-900">{kid.name}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-stone-200 text-stone-700 font-bold">
                          {kid.gender === 'boy' ? 'ولد' : 'بنت'}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-burgundy-50 text-burgundy-900 border border-burgundy-200 text-[10px] font-bold">
                        {kid.stage}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-700">
                      <div>السن: <strong className="text-stone-900">{age} سنوات</strong></div>
                      <div>تاريخ الميلاد: <strong className="font-mono text-stone-900">{kid.birthDate || '—'}</strong></div>
                      <div>ولي الأمر الأساسي: <strong className="text-stone-900">{kid.parentName}</strong></div>
                      <div>ولي أمر آخر: <strong className="text-stone-900">{kid.parent2Name || '—'}</strong></div>
                    </div>

                    <div className="pt-1.5 border-t border-stone-200 flex flex-wrap items-center justify-between gap-1 text-[11px]">
                      <span className="font-mono font-bold text-stone-900" dir="ltr">📞 {kid.parentPhone}</span>
                      {kid.parent2Phone && <span className="font-mono font-bold text-stone-700" dir="ltr">📞 (آخر): {kid.parent2Phone}</span>}
                      {kid.notes && <span className="text-stone-600 truncate max-w-[200px]">ملاحظة: {kid.notes}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Monthly Attendance Cards (Zero Tables Format) */
            <div className="space-y-3 max-h-[500px] overflow-y-auto p-1">
              {scopedChildren.map((kid, idx) => {
                let presentCount = 0;
                let recordedCount = 0;

                const dayStatuses = uniqueDates.map(d => {
                  const dayRecord = monthRecords.find(r => r.date === d);
                  const status = dayRecord?.records[kid.id]?.status;
                  if (status === 'present') {
                    presentCount++;
                    recordedCount++;
                    return { date: d, status: 'present', label: '✓ حاضر' };
                  } else if (status === 'absent') {
                    recordedCount++;
                    return { date: d, status: 'absent', label: '✗ غائب' };
                  } else if (status === 'excused') {
                    recordedCount++;
                    return { date: d, status: 'excused', label: '💬 معتذر' };
                  }
                  return { date: d, status: 'none', label: '—' };
                });

                const rate = recordedCount > 0 ? Math.round((presentCount / recordedCount) * 100) : 0;

                return (
                  <div key={kid.id} className="p-3 bg-stone-50 border border-stone-300 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-stone-200 text-stone-800 font-mono font-bold flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        <span className="font-black text-sm text-stone-900">{kid.name}</span>
                        <span className="px-2 py-0.5 rounded-lg bg-burgundy-50 text-burgundy-900 border border-burgundy-200 text-[10px] font-bold">
                          {kid.stage}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-stone-200 text-stone-800 font-bold font-mono text-xs">
                          {presentCount} من {recordedCount}
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                          rate >= 75 ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                          rate >= 50 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}>
                          {recordedCount > 0 ? `${rate}%` : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Dates Timeline Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {dayStatuses.map(({ date, status, label }) => (
                        <div
                          key={date}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 border ${
                            status === 'present' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
                            status === 'absent' ? 'bg-rose-50 border-rose-300 text-rose-900' :
                            status === 'excused' ? 'bg-amber-50 border-amber-300 text-amber-900' :
                            'bg-stone-100 border-stone-200 text-stone-500'
                          }`}
                        >
                          <span className="font-mono text-[9px]">{date.split('-').slice(1).join('/')}</span>
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Report Footer & Signatures */}
          <div className="mt-12 pt-6 border-t border-stone-400 flex items-center justify-between text-xs font-bold text-stone-800">
            <div className="text-center">
              <div>خادم الفصل المعني</div>
              <div className="mt-6 border-b border-stone-400 w-36 mx-auto"></div>
            </div>

            <div className="text-center">
              <div>أمين المرحلة</div>
              <div className="mt-6 border-b border-stone-400 w-36 mx-auto"></div>
            </div>

            <div className="text-center">
              <div>أمين الخدمة العام</div>
              <div className="mt-6 border-b border-stone-400 w-36 mx-auto"></div>
            </div>
          </div>

          <div className="text-center text-[10px] text-stone-400 mt-6 print:block">
            طُبع من منظومة كنيسة ماريوحنا بالمعراج • جميع الحقوق محفوظة © {new Date().getFullYear()}
          </div>

        </div>

      </div>
    </div>
  );
};
