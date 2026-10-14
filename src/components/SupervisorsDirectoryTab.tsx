import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Supervisor } from '../types';
import { STAGES, MONTHS, AREAS } from '../data/mockData';
import { 
  Search, Crown, Plus, Briefcase, Phone, MessageCircle, 
  MapPin, Cake, Edit3, Trash2, Download, Printer, User, Filter, SlidersHorizontal,
  Table, LayoutGrid
} from 'lucide-react';
import { PersonDetailsModal } from './PersonDetailsModal';
import { getStageBadgeClass } from '../utils/themeColors';

export const SupervisorsDirectoryTab: React.FC<{
  onAddSupervisor: () => void;
  onEditSupervisor: (sup: Supervisor) => void;
}> = ({ onAddSupervisor, onEditSupervisor }) => {
  const { supervisors, deleteSupervisor, selectedStageScope, stagesList } = useApp();
  const [selectedDetailsSup, setSelectedDetailsSup] = useState<Supervisor | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState(selectedStageScope);
  const [roleFilter, setRoleFilter] = useState<'all' | 'supervisor' | 'assistant'>('supervisor');

  React.useEffect(() => {
    setStageFilter(selectedStageScope);
  }, [selectedStageScope]);

  const filteredSupervisors = supervisors.filter(sup => {
    const isAssistant = !!(sup.isAssistant || sup.roleType === 'assistant_supervisor');

    // Role filter
    if (roleFilter === 'supervisor' && isAssistant) return false;
    if (roleFilter === 'assistant' && !isAssistant) return false;

    // Stage filter
    const matchesStage = stageFilter === 'all' || sup.supervisedStage === stageFilter || sup.assignedStage === stageFilter;

    // Search filter
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      sup.name.toLowerCase().includes(query) ||
      (sup.phone && sup.phone.includes(query));

    return matchesSearch && matchesStage;
  });

  const totalSupervisorsCount = supervisors.filter(s => !s.isAssistant && s.roleType !== 'assistant_supervisor').length;
  const totalAssistantsCount = supervisors.filter(s => s.isAssistant || s.roleType === 'assistant_supervisor').length;
  const currentMonthNum = new Date().getMonth() + 1;

  const exportToCSV = () => {
    const headers = ['م', 'الاسم', 'الدور / الصفة', 'المرحلة المسئول عنها', 'رقم التليفون', 'شهر الميلاد'];
    const rows = filteredSupervisors.map((s, idx) => {
      const isAssistant = !!(s.isAssistant || s.roleType === 'assistant_supervisor');
      return [
        idx + 1,
        `"${s.name}"`,
        `"${isAssistant ? 'مساعد أمين مرحلة' : 'أمين مرحلة'}"`,
        `"${s.supervisedStage || s.assignedStage}"`,
        `"${s.phone}"`,
        s.birthMonth
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `كشف_أمناء_الفصول_والمساعدين_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      
      {/* UNIFIED COMPACT HEADER & FILTERS BAR */}
      <div className="bg-white dark:bg-[#1a0a12] p-3.5 sm:p-4 rounded-2xl border border-amber-200/80 dark:border-[#3e1423] shadow-2xs space-y-3 transition-colors duration-200">
        
        {/* Row 1: Title, counts & Quick Action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-amber-100/70 dark:border-[#341121]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-churchgold-600 to-amber-500 text-burgundy-950 flex items-center justify-center font-black shadow-xs shrink-0">
              <Crown className="w-4 h-4 text-burgundy-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-stone-100 leading-tight">
                  دليل بيانات أمناء الفصول ومساعديهم
                </h2>
                <span className="px-2 py-0.2 rounded-full bg-amber-100 dark:bg-[#341121] text-amber-900 dark:text-churchgold-300 text-[10px] font-black border border-amber-300 dark:border-[#4d1d2c]">
                  {filteredSupervisors.length} خادم قيادي
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-stone-400">
                متابعة بيانات وتواصل أمناء المراحل ومساعدي الأمناء
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-[#250d18] hover:bg-amber-100/60 dark:hover:bg-[#341121] text-slate-700 dark:text-stone-300 text-xs font-bold border border-amber-200/70 dark:border-[#4d1d2c] transition-colors cursor-pointer"
              title="تصدير كشف القيادات"
            >
              <Download className="w-3.5 h-3.5 text-churchgold-600" />
              <span className="hidden sm:inline">تصدير</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-[#250d18] hover:bg-amber-100/60 dark:hover:bg-[#341121] text-slate-700 dark:text-stone-300 text-xs font-bold border border-amber-200/70 dark:border-[#4d1d2c] transition-colors cursor-pointer"
              title="طباعة الكشف"
            >
              <Printer className="w-3.5 h-3.5 text-churchgold-600" />
              <span className="hidden sm:inline">طباعة</span>
            </button>

            <button
              onClick={onAddSupervisor}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-churchgold-600 to-amber-600 hover:from-churchgold-700 hover:to-amber-700 text-burgundy-950 font-black text-xs transition-all shadow-xs cursor-pointer border border-churchgold-400/40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة قيادي جديد</span>
            </button>
          </div>
        </div>

        {/* Row 2: Distinct Role Separation Pills & Stage & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          
          {/* Distinct Role Separation Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setRoleFilter('supervisor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                roleFilter === 'supervisor'
                  ? 'bg-amber-500 text-burgundy-950 ring-2 ring-amber-400/40 shadow-xs'
                  : 'bg-stone-50 dark:bg-[#240b17] text-slate-700 dark:text-stone-300 border border-amber-200/80 dark:border-[#4d1d2c] hover:bg-amber-50/50'
              }`}
            >
              <span>👑 أمناء الفصول</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                roleFilter === 'supervisor' ? 'bg-burgundy-950 text-amber-300' : 'bg-amber-100 dark:bg-[#341121] text-amber-900 dark:text-churchgold-300'
              }`}>
                {totalSupervisorsCount}
              </span>
            </button>

            <button
              onClick={() => setRoleFilter('assistant')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                roleFilter === 'assistant'
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400/40 shadow-xs'
                  : 'bg-stone-50 dark:bg-[#240b17] text-slate-700 dark:text-stone-300 border border-amber-200/80 dark:border-[#4d1d2c] hover:bg-blue-50/50'
              }`}
            >
              <span>🤝 مساعدين الأمناء</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                roleFilter === 'assistant' ? 'bg-white text-blue-800' : 'bg-blue-100 dark:bg-[#1a2538] text-blue-900 dark:text-blue-300'
              }`}>
                {totalAssistantsCount}
              </span>
            </button>

            <button
              onClick={() => setRoleFilter('all')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                roleFilter === 'all'
                  ? 'bg-churchgold-600 text-burgundy-950 font-black shadow-xs'
                  : 'bg-stone-50 dark:bg-[#240b17] text-slate-700 dark:text-stone-300 border border-amber-200/80 dark:border-[#4d1d2c] hover:bg-stone-100'
              }`}
            >
              <span>عرض الكل</span>
              <span className="text-[10px] opacity-75">({supervisors.length})</span>
            </button>
          </div>

          {/* Stage Dropdown & Search Input */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-2 py-1 text-xs shrink-0">
              <Filter className="w-3.5 h-3.5 text-churchgold-600 dark:text-churchgold-400" />
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-800 dark:text-stone-200 focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">جميع المراحل المسئولين عنها</option>
                {stagesList.map(s => (
                  <option key={s.id || s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-churchgold-600 dark:text-churchgold-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم أو الوظيفة أو الهاتف..."
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

      </div>

      {/* UNIFIED RESPONSIVE CARDS VIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
        {filteredSupervisors.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white dark:bg-[#1a0a12] rounded-2xl border border-amber-200/80 dark:border-[#3e1423]">
            <Crown className="w-8 h-8 mx-auto mb-2 text-churchgold-400" />
            <p className="text-xs font-bold text-slate-700 dark:text-stone-300">لا يوجد قادة أو أمناء مطابقون للبحث</p>
          </div>
        ) : (
          filteredSupervisors.map(sup => {
            const isAssistant = !!(sup.isAssistant || sup.roleType === 'assistant_supervisor');

            return (
              <div
                key={sup.id}
                className="bg-white dark:bg-[#1a0a12] p-4 sm:p-4.5 rounded-2xl border border-amber-200/90 dark:border-[#381422] hover:border-amber-400 dark:hover:border-[#521c32] shadow-2xs hover:shadow-xs transition-all space-y-3.5"
              >
                {/* 1. Header: Name & Leadership Stage */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                      isAssistant
                        ? 'bg-gradient-to-tr from-blue-600 to-indigo-500 text-white'
                        : 'bg-gradient-to-tr from-churchgold-600 to-amber-500 text-burgundy-950 font-black'
                    }`}>
                      {isAssistant ? '🤝' : <Crown className="w-5 h-5 text-burgundy-950" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-base text-slate-950 dark:text-stone-100 truncate block">
                          {sup.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                          isAssistant
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-churchgold-300 border border-amber-300 dark:border-churchgold-700'
                        }`}>
                          {isAssistant ? 'مساعد أمين' : 'أمين مرحلة'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 dark:text-stone-300 font-bold truncate mt-1">
                        {isAssistant ? 'مساعد أمين مرحلة' : 'أمين مرحلة'}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg border text-xs font-black shrink-0 ${getStageBadgeClass(sup.supervisedStage || sup.assignedStage || '')}`}>
                    {sup.supervisedStage || sup.assignedStage || 'عامة'}
                  </span>
                </div>

                {/* 2. Direct Contact Box: Visible Phone & 1-Tap Buttons */}
                <div className="bg-amber-50/70 dark:bg-[#220c17] p-3 rounded-xl border border-amber-200 dark:border-[#381422] flex items-center justify-between gap-2.5">
                  <div className="min-w-0">
                    <div className="text-xs text-slate-700 dark:text-stone-300 font-bold">
                      رقم تليفون التواصل:
                    </div>
                    {sup.phone ? (
                      <div className="font-mono font-black text-sm text-slate-950 dark:text-stone-50 mt-0.5" dir="ltr">
                        {sup.phone}
                      </div>
                    ) : (
                      <div className="text-xs text-stone-500 italic mt-0.5">لا يوجد رقم هاتف مسجل</div>
                    )}
                  </div>

                  {sup.phone && (
                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={`tel:${sup.phone}`}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                        title="اتصال بالأمين"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>اتصال</span>
                      </a>
                      <a
                        href={`https://wa.me/2${sup.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                        title="واتساب"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>واتساب</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* 3. Card Footer: Details & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 dark:border-[#2f101b]">
                  <button
                    onClick={() => setSelectedDetailsSup(sup)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-burgundy-900 hover:bg-burgundy-950 text-churchgold-200 text-xs sm:text-sm font-black shadow-xs border border-churchgold-500/40 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-churchgold-300" />
                    <span>البيانات الإضافية والتفاصيل ➔</span>
                  </button>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onEditSupervisor(sup)}
                      className="p-2 rounded-xl bg-stone-100 dark:bg-[#250d18] text-slate-800 dark:text-stone-200 hover:bg-amber-100 border border-amber-200 dark:border-[#4d1d2c] transition-colors cursor-pointer"
                      title="تعديل بيانات أمين الفصل"
                    >
                      <Edit3 className="w-4 h-4 text-churchgold-700 dark:text-churchgold-400" />
                    </button>
                    <button
                      onClick={() => {
                        const roleName = isAssistant ? 'مساعد أمين مرحلة' : 'أمين مرحلة';
                        if (confirm(`هل أنت متأكد من إلغاء التكليف القيادي (${roleName}) لـ "${sup.name}"؟\n\nتنبيه مهم: لن يتم مسح بيانات الخادم نهائياً، بل سيظل مسجلاً في كشف الخدام كـ "خادم عادي" بجميع بياناته وسجلاته.`)) {
                          deleteSupervisor(sup.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-[#250d18] text-rose-600 hover:bg-rose-100 dark:hover:bg-[#381121] border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
                      title="إلغاء التكليف القيادي"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Person Details Modal */}
      {selectedDetailsSup && (
        <PersonDetailsModal
          isOpen={!!selectedDetailsSup}
          onClose={() => setSelectedDetailsSup(null)}
          person={selectedDetailsSup}
          type="supervisor"
        />
      )}

    </div>
  );
};
