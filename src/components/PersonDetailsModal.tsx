import React from 'react';
import { Child, Servant, Supervisor } from '../types';
import { useApp } from '../context/AppContext';
import { 
  X, User, Phone, MessageCircle, MapPin, Briefcase, Calendar, 
  Cake, Edit3, Trash2, ShieldCheck, Heart, FileText, CheckCircle2,
  Clock, AlertCircle, XCircle, Award, Home, Mail, UserCheck, Users
} from 'lucide-react';
import { getStageBadgeClass } from '../utils/themeColors';
import { calculateAge } from '../utils/dateUtils';

interface PersonDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Child | Servant | Supervisor | null;
  type: 'child' | 'servant' | 'supervisor';
  onEdit: (person: any) => void;
  onDelete: (id: string) => void;
  onViewAttendanceHistory?: (person: any) => void;
}

export const PersonDetailsModal: React.FC<PersonDetailsModalProps> = ({
  isOpen,
  onClose,
  person,
  type,
  onEdit,
  onDelete,
  onViewAttendanceHistory
}) => {
  const { attendance } = useApp();

  if (!isOpen || !person) return null;

  const isChild = type === 'child';
  const isServant = type === 'servant';
  const isSupervisor = type === 'supervisor';

  const child = isChild ? (person as Child) : null;
  const servant = isServant ? (person as Servant) : null;
  const supervisor = isSupervisor ? (person as Supervisor) : null;

  const stage = child?.stage || servant?.assignedStage || supervisor?.supervisedStage || supervisor?.assignedStage || 'عامة';

  // Attendance stats for this person
  const targetType = isChild ? 'child' : isServant ? 'servant' : 'supervisor';
  const personRecords = attendance
    .filter(a => a.targetType === targetType && a.records[person.id])
    .map(a => a.records[person.id]);

  const totalRecorded = personRecords.length;
  const presentCount = personRecords.filter(r => r.status === 'present').length;
  const lateCount = personRecords.filter(r => r.status === 'late').length;
  const excusedCount = personRecords.filter(r => r.status === 'excused').length;
  const absentCount = personRecords.filter(r => r.status === 'absent').length;

  const attendanceRate = totalRecorded > 0 
    ? Math.round(((presentCount + lateCount * 0.8) / totalRecorded) * 100) 
    : 0;

  // Birthday check
  const currentMonth = new Date().getMonth() + 1;
  const isBirthdayThisMonth = person.birthMonth === currentMonth;

  const calculatedAge = isChild && child 
    ? calculateAge(child.birthDate, child.age) 
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#1a0a12] rounded-3xl max-w-lg w-full shadow-2xl border border-amber-200/80 dark:border-[#3e1423] overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-4 max-h-[92vh] flex flex-col transition-colors duration-200">
        
        {/* Header with Avatar and Basic Info */}
        <div className="bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-950 p-5 text-white flex items-start justify-between relative shrink-0 border-b border-churchgold-400/20">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-churchgold-500 to-amber-600 text-burgundy-950 flex items-center justify-center font-black text-2xl shadow-lg ring-2 ring-churchgold-300/40 shrink-0">
              {person.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-amber-50 leading-tight">{person.name}</h3>
                <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${getStageBadgeClass(stage)}`}>
                  {stage}
                </span>
                {isChild && child?.gender && (
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    child.gender === 'boy' 
                      ? 'bg-sky-500/20 text-sky-200 border border-sky-400/40' 
                      : 'bg-pink-500/20 text-pink-200 border border-pink-400/40'
                  }`}>
                    {child.gender === 'boy' ? 'ولد' : 'بنت'}
                  </span>
                )}
                {isChild && child?.secondaryStages && child.secondaryStages.length > 0 && (
                  child.secondaryStages.map(st => (
                    <span key={st} className="px-1.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-200 border border-amber-400/40">
                      +{st}
                    </span>
                  ))
                )}
                {isServant && servant?.assignedStages && servant.assignedStages.length > 0 && (
                  servant.assignedStages.map(st => (
                    <span key={st} className="px-1.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/40">
                      +{st}
                    </span>
                  ))
                )}
              </div>

              <div className="flex items-center gap-2 mt-1.5 text-xs text-churchgold-300 flex-wrap">
                {isChild && calculatedAge && (
                  <span className="bg-white/10 px-2 py-0.5 rounded-md font-bold text-amber-200">
                    السن: {calculatedAge} سنة
                  </span>
                )}
                {isSupervisor && (
                  <span className="flex items-center gap-1 text-churchgold-200 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-churchgold-400" />
                    <span>{supervisor?.title || 'أمين مرحلة / فصل'}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl hover:bg-white/10 text-amber-200/80 hover:text-white transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-slate-800 dark:text-stone-200 flex-1">
          
          {/* Birthday Announcement Banner if this month */}
          {isBirthdayThisMonth && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-pink-50 dark:from-[#2e101d] dark:to-[#3b1226] border border-amber-300/80 dark:border-[#5a1c38] flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-bold text-burgundy-900 dark:text-churchgold-300">
                <Cake className="w-4 h-4 text-pink-600 dark:text-pink-400 animate-bounce" />
                <span>عيد ميلاده هذا الشهر (شهر {person.birthMonth})! 🎂 كل سنة وهو طيب</span>
              </div>
              {person.birthDate && (
                <span className="text-[11px] font-extrabold text-slate-600 dark:text-stone-300 font-mono">
                  {person.birthDate}
                </span>
              )}
            </div>
          )}

          {/* SECTION 1: Personal Contact (معلومات التواصل المباشرة) */}
          <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-[#220c17] border border-amber-200/80 dark:border-[#421626] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-burgundy-950 dark:text-churchgold-300 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-burgundy-700 dark:text-churchgold-400" />
                <span>بيانات التواصل المباشر</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-stone-400 font-bold">
                {isChild ? 'تليفون الولد' : 'تليفون الخادم'}
              </span>
            </div>

            {person.phone ? (
              <div className="flex items-center justify-between gap-2 bg-white dark:bg-[#190810] p-2.5 rounded-xl border border-amber-200/60 dark:border-[#381321]">
                <div className="font-mono font-black text-sm text-slate-900 dark:text-stone-100" dir="ltr">
                  {person.phone}
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${person.phone}`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>اتصال</span>
                  </a>
                  <a
                    href={`https://wa.me/2${person.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>واتساب</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-xs text-stone-500 italic">
                لا يوجد رقم هاتف شخصي مسجل
              </div>
            )}
          </div>

          {/* SECTION 2: Complete Personal Data (تاريخ الميلاد، السن، النوع) */}
          <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-[#200a14] border border-amber-200/90 dark:border-[#381622] space-y-3">
            <div className="text-xs sm:text-sm font-black text-burgundy-950 dark:text-churchgold-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-churchgold-600 dark:text-churchgold-400" />
              <span>البيانات الشخصية وتاريخ الميلاد</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-white dark:bg-[#18080f] p-3 rounded-xl border border-amber-200/60 dark:border-[#33111d] shadow-2xs">
                <span className="text-xs text-slate-700 dark:text-stone-300 block font-bold mb-0.5">تاريخ الميلاد:</span>
                <span className="font-mono font-black text-sm text-slate-950 dark:text-stone-100 block">
                  {person.birthDate || 'غير مسجل'}
                </span>
              </div>

              <div className="bg-white dark:bg-[#18080f] p-3 rounded-xl border border-amber-200/60 dark:border-[#33111d] shadow-2xs">
                <span className="text-xs text-slate-700 dark:text-stone-300 block font-bold mb-0.5">السن وشهر الميلاد:</span>
                <span className="font-black text-sm text-slate-950 dark:text-stone-100 block">
                  {calculatedAge ? `${calculatedAge} سنة ` : ''}(شهر {person.birthMonth})
                </span>
              </div>

              {isChild && (
                <div className="col-span-2 bg-white dark:bg-[#18080f] p-3 rounded-xl border border-amber-200/60 dark:border-[#33111d] shadow-2xs">
                  <span className="text-xs text-slate-700 dark:text-stone-300 block font-bold mb-0.5">النوع:</span>
                  <span className="font-black text-sm text-slate-950 dark:text-stone-100 block">
                    {child?.gender === 'boy' ? 'ولد 👦' : 'بنت 👧'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: Child Parent Details (ولي الأمر الأساسي وولي الأمر الآخر) */}
          {isChild && child && (
            <div className="space-y-3">
              {/* Primary Guardian (ولي الأمر الأساسي) */}
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-[#240b17] border border-amber-200/90 dark:border-[#4d1f2e] space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-burgundy-950 dark:text-churchgold-300">
                    <User className="w-4 h-4 text-churchgold-600" />
                    <span>ولي الأمر الأساسي</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-burgundy-100 dark:bg-[#381120] text-burgundy-950 dark:text-churchgold-300">
                    المسؤول الأول
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-[#190810] p-3.5 rounded-xl border border-amber-200/80 shadow-2xs">
                  <div>
                    <div className="font-black text-sm sm:text-base text-slate-950 dark:text-stone-100">
                      {child.parentName || 'غير مسجل'}
                    </div>
                    {child.parentPhone ? (
                      <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-stone-200 mt-0.5 font-mono" dir="ltr">
                        {child.parentPhone}
                      </div>
                    ) : (
                      <div className="text-xs text-stone-500 italic">لا يوجد رقم هاتف</div>
                    )}
                  </div>

                  {child.parentPhone && (
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`tel:${child.parentPhone}`}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-black flex items-center gap-1.5 shadow-xs"
                        title="اتصال بولي الأمر الأساسي"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>اتصال</span>
                      </a>
                      <a
                        href={`https://wa.me/2${child.parentPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-xs font-black flex items-center gap-1.5 shadow-xs"
                        title="مراسلة واتساب"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>واتساب</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Secondary Guardian (ولي أمر آخر إن وجد) */}
              {(child.parent2Name || child.parent2Phone) && (
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-[#240b17] border border-amber-200/90 dark:border-[#4d1f2e] space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-burgundy-950 dark:text-churchgold-300">
                      <Users className="w-4 h-4 text-churchgold-600" />
                      <span>ولي أمر آخر (إضافي / احتياطي)</span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-[#341121] text-slate-700 dark:text-churchgold-300">
                      للطوارئ
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-[#190810] p-3.5 rounded-xl border border-amber-200/80 shadow-2xs">
                    <div>
                      <div className="font-black text-sm sm:text-base text-slate-950 dark:text-stone-100">
                        {child.parent2Name || 'غير مسجل'}
                      </div>
                      {child.parent2Phone ? (
                        <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-stone-200 mt-0.5 font-mono" dir="ltr">
                          {child.parent2Phone}
                        </div>
                      ) : (
                        <div className="text-xs text-stone-500 italic">لا يوجد رقم هاتف</div>
                      )}
                    </div>

                    {child.parent2Phone && (
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`tel:${child.parent2Phone}`}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-black flex items-center gap-1.5 shadow-xs"
                          title="اتصال بولي الأمر الآخر"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>اتصال</span>
                        </a>
                        <a
                          href={`https://wa.me/2${child.parent2Phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-xs font-black flex items-center gap-1.5 shadow-xs"
                          title="واتساب"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>واتساب</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Child Additional Stages and Activities */}
              {child.secondaryStages && child.secondaryStages.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-[#250d18] border border-amber-200/90 dark:border-[#4d1d2c] space-y-2">
                  <div className="text-xs sm:text-sm font-black text-burgundy-900 dark:text-churchgold-300">
                    مراحل وأنشطة إضافية للمخدوم (مراحل متعددة)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {child.secondaryStages.map(st => (
                      <span key={st} className="px-3 py-1 rounded-xl text-xs font-black bg-white dark:bg-[#1a0a12] text-amber-950 dark:text-churchgold-300 border border-amber-300 dark:border-[#521c32] shadow-2xs">
                        ✨ {st}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: Servant / Supervisor Specific Details */}
          {(isServant || isSupervisor) && (
            <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1f2e] space-y-2.5">
              <div className="text-xs font-black text-burgundy-900 dark:text-churchgold-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-churchgold-600" />
                <span>البيانات الكنسية والخدمية للخادم</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="col-span-2 bg-white dark:bg-[#18080f] p-2.5 rounded-xl border border-amber-100 dark:border-[#381421]">
                  <span className="text-[10px] text-slate-500 dark:text-stone-400 block">المرحلة الأساسية:</span>
                  <span className="font-bold text-slate-900 dark:text-stone-100">{stage}</span>
                </div>
                {isServant && servant?.assignedStages && servant.assignedStages.length > 0 && (
                  <div className="col-span-2 bg-white dark:bg-[#18080f] p-2.5 rounded-xl border border-amber-100 dark:border-[#381421]">
                    <span className="text-[10px] text-slate-500 dark:text-stone-400 block mb-1 font-bold">مراحل إضافية يخدم بها الخادم:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {servant.assignedStages.map(st => (
                        <span key={st} className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-[#12281c] text-emerald-800 dark:text-emerald-300 border border-emerald-300/70 dark:border-[#1d4633]">
                          ✓ {st}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {isServant && servant?.roleTitle && (
                  <div className="col-span-2 bg-white dark:bg-[#18080f] p-2 rounded-xl border border-amber-100 dark:border-[#381421]">
                    <span className="text-[10px] text-slate-500 dark:text-stone-400 block">الصفة الكنسية:</span>
                    <span className="font-bold text-burgundy-900 dark:text-churchgold-300">{servant.roleTitle}</span>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* SECTION 5: Attendance Summary */}
          {totalRecorded > 0 ? (
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#200a14] border border-amber-200/80 dark:border-[#381622] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-stone-100">
                  <Award className="w-4 h-4 text-churchgold-600 dark:text-churchgold-400" />
                  <span>ملخص نسبة الحضور والغياب:</span>
                </div>
                <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {attendanceRate}% نسبة الحضور
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-[#12241b] border border-emerald-200/60 dark:border-emerald-900/60">
                  <div className="font-black text-emerald-700 dark:text-emerald-400">{presentCount}</div>
                  <div className="text-[10px] text-slate-500 dark:text-stone-400">حاضر</div>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-[#281c10] border border-amber-200/60 dark:border-amber-900/60">
                  <div className="font-black text-amber-700 dark:text-amber-400">{lateCount}</div>
                  <div className="text-[10px] text-slate-500 dark:text-stone-400">متأخر</div>
                </div>
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-[#11202e] border border-blue-200/60 dark:border-blue-900/60">
                  <div className="font-black text-blue-700 dark:text-blue-400">{excusedCount}</div>
                  <div className="text-[10px] text-slate-500 dark:text-stone-400">إذن</div>
                </div>
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-[#290d16] border border-rose-200/60 dark:border-rose-900/60">
                  <div className="font-black text-rose-700 dark:text-rose-400">{absentCount}</div>
                  <div className="text-[10px] text-slate-500 dark:text-stone-400">غائب</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#200a14] border border-amber-100 dark:border-[#381622] text-center text-xs text-slate-500 dark:text-stone-400">
              لم يُسجل حضور أو غياب بعد في الأنشطة الأخيرة.
            </div>
          )}

          {/* SECTION 6: Notes Section if available */}
          {person.notes && (
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-[#200a14] border border-amber-200/80 dark:border-[#381622] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-stone-300">
                <FileText className="w-3.5 h-3.5 text-churchgold-600" />
                <span>ملاحظات خاصة والمتابعة:</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-stone-300 leading-relaxed pr-5">
                {person.notes}
              </p>
            </div>
          )}

          {/* Registration Date footer note */}
          {person.createdAt && (
            <div className="text-[10px] text-stone-400 text-left pt-1">
              تاريخ القيد بالمنظومة: {person.createdAt}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-stone-50 dark:bg-[#200a14] border-t border-amber-200/80 dark:border-[#381622] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(person);
              }}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-burgundy-900 hover:bg-burgundy-950 text-churchgold-100 text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-churchgold-300" />
              <span>تعديل البيانات</span>
            </button>

            {onViewAttendanceHistory && (
              <button
                onClick={() => {
                  onClose();
                  onViewAttendanceHistory(person);
                }}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-200/80 dark:bg-[#341121] hover:bg-amber-100 text-slate-800 dark:text-stone-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <span>سجل الحضور الكامل</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (confirm(`هل أنت متأكد من حذف "${person.name}" نهائياً من الكشف؟`)) {
                  onDelete(person.id);
                  onClose();
                }
              }}
              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="حذف"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-[#2a0e1c] text-slate-600 dark:text-stone-300 hover:bg-stone-200 text-xs font-bold transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
