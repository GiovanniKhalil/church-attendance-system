import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MONTHS } from '../data/mockData';
import { 
  X, Cake, Phone, MessageCircle, Gift, Sparkles, User, 
  ShieldCheck, Crown, Calendar, CheckCircle2, Clock 
} from 'lucide-react';
import { calculateAge } from '../utils/dateUtils';

// Helper function to extract day and month from various date string formats
export function parseBirthDate(birthDateStr?: string, fallbackMonth?: number): { day: number; month: number } {
  let day = 1;
  let month = fallbackMonth || 1;

  if (birthDateStr) {
    const clean = birthDateStr.trim();
    let parts: string[] = [];

    if (clean.includes('-')) {
      parts = clean.split('-');
    } else if (clean.includes('/')) {
      parts = clean.split('/');
    }

    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD or YYYY/MM/DD
        month = parseInt(parts[1], 10) || month;
        day = parseInt(parts[2], 10) || day;
      } else {
        // DD-MM-YYYY or DD/MM/YYYY
        day = parseInt(parts[0], 10) || day;
        month = parseInt(parts[1], 10) || month;
      }
    }
  }

  return { day, month };
}

export const BirthdayWidget: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { children, servants, supervisors, role, currentUser, selectedStageScope } = useApp();
  const [activeTab, setActiveTab] = useState<'today' | 'month'>('today');

  if (!isOpen) return null;

  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1;
  const currentMonthLabel = MONTHS.find(m => m.value === todayMonth)?.label || `شهر ${todayMonth}`;

  // Stage scope for children (strictly scoped by assigned stage/class unless amin_khedma_am chooses otherwise)
  const effectiveStage = role === 'amin_khedma_am' ? selectedStageScope : (currentUser?.assignedStage || selectedStageScope);

  // Scoped lists (Children are scoped by assigned stage/class; Servants & Supervisors show for everyone)
  const scopedKids = effectiveStage === 'all' 
    ? children 
    : children.filter(c => c.stage === effectiveStage);

  const scopedServants = servants;
  const scopedSupervisors = supervisors;

  // TODAY's Birthdays
  const todayKids = scopedKids.filter(k => {
    const { day, month } = parseBirthDate(k.birthDate, k.birthMonth);
    return month === todayMonth && day === todayDay;
  });

  const todayServants = scopedServants.filter(s => {
    const { day, month } = parseBirthDate(s.birthDate, s.birthMonth);
    return month === todayMonth && day === todayDay;
  });

  const todaySupervisors = scopedSupervisors.filter(sp => {
    const { day, month } = parseBirthDate(sp.birthDate, sp.birthMonth);
    return month === todayMonth && day === todayDay;
  });

  const todayTotal = todayKids.length + todayServants.length + todaySupervisors.length;

  // THIS MONTH's Birthdays
  const monthKids = scopedKids.filter(k => {
    const { month } = parseBirthDate(k.birthDate, k.birthMonth);
    return month === todayMonth;
  }).sort((a, b) => parseBirthDate(a.birthDate, a.birthMonth).day - parseBirthDate(b.birthDate, b.birthMonth).day);

  const monthServants = scopedServants.filter(s => {
    const { month } = parseBirthDate(s.birthDate, s.birthMonth);
    return month === todayMonth;
  }).sort((a, b) => parseBirthDate(a.birthDate, a.birthMonth).day - parseBirthDate(b.birthDate, b.birthMonth).day);

  const monthSupervisors = scopedSupervisors.filter(sp => {
    const { month } = parseBirthDate(sp.birthDate, sp.birthMonth);
    return month === todayMonth;
  }).sort((a, b) => parseBirthDate(a.birthDate, a.birthMonth).day - parseBirthDate(b.birthDate, b.birthMonth).day);

  const monthTotal = monthKids.length + monthServants.length + monthSupervisors.length;

  const getDayStatusBadge = (bDay: number) => {
    if (bDay === todayDay) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-pink-600 text-white text-[10px] font-black animate-pulse flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>اليوم! 🎉</span>
        </span>
      );
    } else if (bDay === todayDay + 1) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
          غداً ⏳
        </span>
      );
    } else if (bDay > todayDay) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
          بعد {bDay - todayDay} أيام
        </span>
      );
    } else {
      return (
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
          مضى ({bDay} {currentMonthLabel})
        </span>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-white/20 backdrop-blur-md">
              <Cake className="w-6 h-6 text-pink-200 animate-bounce" />
            </div>
            <div>
              <h3 className="text-base font-bold">تنبيهات أعياد الميلاد 🎂</h3>
              <p className="text-xs text-pink-100">
                المرحلة: <strong className="text-amber-200">{effectiveStage === 'all' ? 'جميع المراحل' : effectiveStage}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Switcher */}
        <div className="bg-slate-100 p-1.5 border-b border-slate-200 grid grid-cols-2 gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('today')}
            className={`py-2 px-3 rounded-2xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'today'
                ? 'bg-white text-pink-700 shadow-xs border border-pink-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span>أعياد ميلاد اليوم</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              todayTotal > 0 ? 'bg-pink-600 text-white font-black' : 'bg-slate-200 text-slate-600'
            }`}>
              {todayTotal}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('month')}
            className={`py-2 px-3 rounded-2xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'month'
                ? 'bg-white text-indigo-700 shadow-xs border border-indigo-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>أعياد ميلاد الشهر ({currentMonthLabel})</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-bold">
              {monthTotal}
            </span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 text-xs">
          
          {/* TAB 1: TODAY */}
          {activeTab === 'today' && (
            <div className="space-y-4">
              {todayTotal === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-pink-50/30 rounded-2xl border border-pink-100 space-y-3">
                  <Gift className="w-12 h-12 text-pink-300 mx-auto animate-pulse" />
                  <div>
                    <p className="font-bold text-slate-700 text-sm">لا توجد أعياد ميلاد اليوم 🎈</p>
                    <p className="text-slate-500 text-xs mt-1">
                      لا يوجد مخدومين أو خدام يحتفلون بعيد ميلادهم في تاريخ اليوم ({todayDay} {currentMonthLabel}).
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('month')}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                  >
                    عرض أعياد ميلاد باقي الشهر ({monthTotal})
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                  
                  {/* Today Kids */}
                  {todayKids.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-indigo-700">
                        <User className="w-4 h-4" />
                        <span>أولاد الفصل والمرحلة يحتفلون اليوم 🎉 ({todayKids.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {todayKids.map(k => (
                          <div key={k.id} className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between">
                            <div>
                              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                <span>{k.name}</span>
                                <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black">
                                  عيد ميلاده اليوم! 🎉
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-600 mt-0.5">
                                المرحلة: {k.stage} • السن: {calculateAge(k.birthDate, k.age)} سنين • ولي الأمر: {k.parentName}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <a href={`tel:${k.parentPhone || k.phone}`} className="p-2 rounded-xl bg-white shadow-xs text-indigo-600 hover:bg-indigo-100 transition-colors" title="اتصال تلفوني">
                                <Phone className="w-4 h-4" />
                              </a>
                              <a href={`https://wa.me/2${k.parentPhone || k.phone}`} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-white shadow-xs text-emerald-600 hover:bg-emerald-100 transition-colors" title="واتساب تهنئة">
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Today Servants */}
                  {todayServants.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-emerald-700">
                        <ShieldCheck className="w-4 h-4" />
                        <span>أعياد ميلاد الخدام اليوم 🎉 ({todayServants.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {todayServants.map(s => (
                          <div key={s.id} className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                            <div>
                              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                <span>خ/ {s.name}</span>
                                <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black">
                                  عيد ميلاده اليوم! 🎉
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-600 mt-0.5">
                                {s.assignedStage} • {s.phone}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <a href={`tel:${s.phone}`} className="p-2 rounded-xl bg-white shadow-xs text-emerald-700 hover:bg-emerald-100 transition-colors">
                                <Phone className="w-4 h-4" />
                              </a>
                              <a href={`https://wa.me/2${s.phone}`} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-white shadow-xs text-emerald-700 hover:bg-emerald-100 transition-colors">
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Today Supervisors */}
                  {todaySupervisors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-amber-700">
                        <Crown className="w-4 h-4" />
                        <span>أمناء الفصول يحتفلون اليوم 🎉 ({todaySupervisors.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {todaySupervisors.map(sp => (
                          <div key={sp.id} className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                            <div>
                              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                <span>أ/ {sp.name}</span>
                                <span className="px-2 py-0.5 rounded-md bg-amber-600 text-white text-[10px] font-black">
                                  عيد ميلاده اليوم! 🎉
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-600 mt-0.5">
                                مسؤول {sp.supervisedStage}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <a href={`tel:${sp.phone}`} className="p-2 rounded-xl bg-white shadow-xs text-amber-700 hover:bg-amber-100">
                                <Phone className="w-4 h-4" />
                              </a>
                              <a href={`https://wa.me/2${sp.phone}`} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-white shadow-xs text-emerald-700 hover:bg-emerald-100">
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* TAB 2: MONTH */}
          {activeTab === 'month' && (
            <div className="space-y-4">
              {monthTotal === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Gift className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-600">لا توجد أعياد ميلاد مسجلة في هذا الشهر لهذا الفصل/المرحلة.</p>
                </div>
              ) : (
                <div className="space-y-5 max-h-[55vh] overflow-y-auto pr-1">
                  
                  {/* Kids Month */}
                  {monthKids.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-indigo-700">
                        <User className="w-4 h-4" />
                        <span>أولاد الفصل بالمرحلة ({monthKids.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {monthKids.map(k => {
                          const { day } = parseBirthDate(k.birthDate, k.birthMonth);
                          return (
                            <div key={k.id} className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
                              <div>
                                <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                                  <span>{k.name}</span>
                                  {getDayStatusBadge(day)}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {k.stage} • السن: {calculateAge(k.birthDate, k.age)} سنين • تاريخ الميلاد: {k.birthDate || `${day} ${currentMonthLabel}`}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <a href={`tel:${k.parentPhone || k.phone}`} className="p-1.5 rounded-lg bg-white shadow-xs text-indigo-600 hover:bg-indigo-100">
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                                <a href={`https://wa.me/2${k.parentPhone || k.phone}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-white shadow-xs text-emerald-600 hover:bg-emerald-100">
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Servants Month */}
                  {monthServants.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-emerald-700">
                        <ShieldCheck className="w-4 h-4" />
                        <span>الخدام خلال الشهر ({monthServants.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {monthServants.map(s => {
                          const { day } = parseBirthDate(s.birthDate, s.birthMonth);
                          return (
                            <div key={s.id} className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                              <div>
                                <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                                  <span>خ/ {s.name}</span>
                                  {getDayStatusBadge(day)}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {s.assignedStage} • تاريخ الميلاد: {s.birthDate || `${day} ${currentMonthLabel}`}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <a href={`tel:${s.phone}`} className="p-1.5 rounded-lg bg-white shadow-xs text-emerald-700 hover:bg-emerald-100">
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                                <a href={`https://wa.me/2${s.phone}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-white shadow-xs text-emerald-700 hover:bg-emerald-100">
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Supervisors Month */}
                  {monthSupervisors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-amber-700">
                        <Crown className="w-4 h-4" />
                        <span>أمناء الفصول والمراحل ({monthSupervisors.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {monthSupervisors.map(sp => {
                          const { day } = parseBirthDate(sp.birthDate, sp.birthMonth);
                          return (
                            <div key={sp.id} className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-center justify-between">
                              <div>
                                <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                                  <span>أ/ {sp.name}</span>
                                  {getDayStatusBadge(day)}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  مسؤول {sp.supervisedStage}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <a href={`tel:${sp.phone}`} className="p-1.5 rounded-lg bg-white shadow-xs text-amber-700 hover:bg-amber-100">
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                                <a href={`https://wa.me/2${sp.phone}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-white shadow-xs text-emerald-700 hover:bg-emerald-100">
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">
              {activeTab === 'today' ? `أعياد اليوم: ${todayTotal}` : `أعياد شهر ${currentMonthLabel}: ${monthTotal}`}
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
            >
              تم
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
