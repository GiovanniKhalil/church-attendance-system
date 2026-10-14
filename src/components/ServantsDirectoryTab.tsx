import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Servant } from '../types';
import { MONTHS } from '../data/mockData';
import { 
  Search, ShieldCheck, Plus, Briefcase, Phone, MessageCircle, 
  MapPin, Cake, Edit3, Trash2, Download, Printer, User, BarChart2, Filter, X,
  UserX, CheckCircle2, KeyRound, Crown, Users, Award, Check,
  Table, LayoutGrid, Clock
} from 'lucide-react';
import { PersonAttendanceModal } from './PersonAttendanceModal';
import { PersonDetailsModal } from './PersonDetailsModal';
import { getStageBadgeClass } from '../utils/themeColors';

export const ServantsDirectoryTab: React.FC<{
  onAddServant: () => void;
  onEditServant: (servant: Servant) => void;
}> = ({ onAddServant, onEditServant }) => {
  const { 
    servants, updateServant, deleteServant, resetUserTempPassword, selectedStageScope, 
    role, currentUser, stagesList, unassignAllServantsFromClasses, 
    moveServantsToGeneralDock, assignServantRole 
  } = useApp();

  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [viewingAttendanceServant, setViewingAttendanceServant] = useState<Servant | null>(null);
  const [selectedDetailsServant, setSelectedDetailsServant] = useState<Servant | null>(null);
  const [unassignSuccessMsg, setUnassignSuccessMsg] = useState<string | null>(null);
  const [resetNotice, setResetNotice] = useState<{ servantName: string; tempPass: string } | null>(null);

  // Reallocation Modal State for Individual Servant
  const [reassignModalServant, setReassignModalServant] = useState<Servant | null>(null);
  const [reassignStage, setReassignStage] = useState<string>('ابتدائي (ثالثة ورابعة)');
  const [reassignAdditionalStages, setReassignAdditionalStages] = useState<string[]>([]);
  const [reassignRoleType, setReassignRoleType] = useState<'captain' | 'first_mate' | 'crew' | 'general_dock'>('crew');
  const [isReassigning, setIsReassigning] = useState(false);

  // Bulk Reallocation Modal State
  const [showBulkResetModal, setShowBulkResetModal] = useState(false);

  // Tab filter: all vs assigned vs dock
  const [dockFilterTab, setDockFilterTab] = useState<'all' | 'assigned' | 'dock'>('all');

  const handleResetPassword = (servant: Servant) => {
    if (confirm(`هل ترغب في تصفير كلمة سر الخادم "${servant.name}"؟ سيتم تعيين كلمة مرور مؤقتة وتفعيل إجبارية تغيير كلمة المرور فور دخوله (isFirstLogin: true).`)) {
      const tempPass = 'temp123';
      resetUserTempPassword(servant.id, tempPass);
      setResetNotice({ servantName: servant.name, tempPass });
      setTimeout(() => setResetNotice(null), 8000);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState(
    role === 'amin_khedma_am' ? selectedStageScope : (currentUser?.assignedStage || selectedStageScope)
  );
  const [birthMonthFilter, setBirthMonthFilter] = useState('all');
  const [filterCriterion, setFilterCriterion] = useState<'all' | 'stage' | 'month'>('all');

  React.useEffect(() => {
    if (role === 'amin_khedma_am') {
      setStageFilter(selectedStageScope);
    } else {
      setStageFilter(currentUser?.assignedStage || selectedStageScope);
    }
  }, [selectedStageScope, role, currentUser]);

  // Execute Individual Servant Role Promotion / Reallocation
  const handleConfirmReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignModalServant) return;

    setIsReassigning(true);
    try {
      const targetStage = reassignRoleType === 'general_dock' ? 'عامة' : reassignStage;
      await assignServantRole(reassignModalServant.id, targetStage, reassignRoleType);
      
      // Update servant's assigned multiple stages
      updateServant(reassignModalServant.id, {
        assignedStages: reassignRoleType === 'general_dock' ? [] : reassignAdditionalStages
      });
      
      const roleName = reassignRoleType === 'captain' 
        ? 'أمين مرحلة وفصل' 
        : reassignRoleType === 'first_mate' 
        ? 'أمين مساعد بالمرحلة' 
        : reassignRoleType === 'general_dock'
        ? 'خادم عام (خدمة عامة)'
        : 'خادم بالمرحلة';

      setUnassignSuccessMsg(`تم بنجاح إسناد صفة (${roleName}) وتحديث مراحل خدمة الخادم "${reassignModalServant.name}"!`);
      setTimeout(() => setUnassignSuccessMsg(null), 6000);
      setReassignModalServant(null);
    } catch (err) {
      console.warn('Reassign error:', err);
    } finally {
      setIsReassigning(false);
    }
  };

  // Execute Bulk Reset to General Servants
  const handleExecuteBulkReset = async (targetScope: 'current' | 'all') => {
    const stageToMove = targetScope === 'current' ? stageFilter : 'all';
    const movedCount = await moveServantsToGeneralDock(stageToMove);
    setShowBulkResetModal(false);
    setUnassignSuccessMsg(`تم تحويل ${movedCount} خادم إلى صفة (خادم عام) بنجاح.`);
    setTimeout(() => setUnassignSuccessMsg(null), 7000);
  };

  const filteredServants = servants.filter(servant => {
    // 1. أمين المرحلة ومساعد الأمين يرى فقط خدام مرحلته الذين يخدمون معه
    if (role === 'amin_fasl') {
      const myStage = currentUser?.assignedStage;
      const servesWithMe = servant.assignedStage === myStage || 
        (servant.assignedStages && servant.assignedStages.includes(myStage || ''));
      if (!servesWithMe) return false;
    }

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      servant.name.toLowerCase().includes(query) ||
      servant.phone.includes(query) ||
      (servant.roleTitle && servant.roleTitle.toLowerCase().includes(query));

    // Show pending unassigned filter
    const isPendingStage = servant.assignedStage === 'في انتظار التعيين' || servant.assignedStage === 'عامة' || !servant.assignedStage;
    if (showPendingOnly) {
      return matchesSearch && isPendingStage;
    }

    const matchesStage = role === 'amin_fasl' ? true : (
      stageFilter === 'all' || 
      servant.assignedStage === stageFilter ||
      (servant.assignedStages && servant.assignedStages.includes(stageFilter))
    );
    const matchesMonth = birthMonthFilter === 'all' || servant.birthMonth === Number(birthMonthFilter);

    // Dock tab filtering
    const isDock = servant.assignedStage === 'عامة' || servant.roleType === 'general_dock' || servant.assignedStage === 'في انتظار التعيين';
    if (dockFilterTab === 'dock' && !isDock) return false;
    if (dockFilterTab === 'assigned' && isDock) return false;

    return matchesSearch && matchesStage && matchesMonth;
  });

  const pendingServantsCount = servants.filter(s => s.assignedStage === 'في انتظار التعيين' || s.assignedStage === 'عامة' || !s.assignedStage).length;
  const dockCount = servants.filter(s => s.assignedStage === 'عامة' || s.roleType === 'general_dock').length;
  const assignedCount = servants.length - dockCount;

  const exportToCSV = () => {
    const headers = ['اسم الخادم', 'المرحلة الخدمية', 'مراحل إضافية', 'رقم التليفون', 'شهر الميلاد', 'الصفة والدور'];
    const rows = filteredServants.map(s => [
      `"${s.name}"`,
      `"${s.assignedStage}"`,
      `"${(s.assignedStages || []).join('، ')}"`,
      `"${s.phone}"`,
      s.birthMonth,
      `"${s.roleTitle || 'خادم'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `كشف_خدام_الكنيسة_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters = Boolean(searchQuery.trim()) || stageFilter !== 'all' || birthMonthFilter !== 'all' || dockFilterTab !== 'all';

  return (
    <div className="space-y-3 sm:space-y-4 font-['Cairo',sans-serif]">
      
      {/* Title & Actions Bar */}
      <div className="bg-white dark:bg-[#1a0a12] p-3 sm:p-4 rounded-2xl border border-amber-200/90 dark:border-[#3e1423] shadow-2xs space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-churchgold-500/15 border border-churchgold-400/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-churchgold-600 dark:text-churchgold-400" />
            </div>
            <h2 className="text-sm sm:text-base font-black text-slate-950 dark:text-stone-50 truncate">
              دليل وسجلات خدام الكنيسة
            </h2>
            <span className="whitespace-nowrap px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-[#2e101d] text-burgundy-950 dark:text-churchgold-300 text-xs font-black border border-amber-300/80 dark:border-[#4d1d2c] shrink-0">
              {filteredServants.length} خادم
            </span>
          </div>

          {role === 'amin_khedma_am' && (
            <button
              onClick={onAddServant}
              className="sm:hidden whitespace-nowrap inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-churchgold-600 to-amber-600 hover:from-churchgold-700 hover:to-amber-700 text-burgundy-950 font-black text-xs shadow-xs cursor-pointer border border-churchgold-400/40 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة خادم</span>
            </button>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {/* Reallocation Button */}
          {role === 'amin_khedma_am' && (
            <button
              onClick={() => setShowBulkResetModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-churchgold-500/30 hover:from-amber-500/30 hover:to-churchgold-500/40 text-burgundy-950 dark:text-churchgold-200 text-xs font-black border border-churchgold-400/50 shadow-2xs transition-all cursor-pointer"
              title="إعادة توزيع الخدام وتحويلهم إلى صفة خادم عام"
            >
              <Users className="w-3.5 h-3.5 text-churchgold-600 dark:text-churchgold-400" />
              <span>إعادة توزيع الخدام (خادم عام)</span>
            </button>
          )}

          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-[#250d18] hover:bg-amber-100/60 dark:hover:bg-[#341121] text-slate-700 dark:text-stone-300 text-xs font-bold border border-amber-200/70 dark:border-[#4d1d2c] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-churchgold-600 dark:text-churchgold-400" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-[#250d18] hover:bg-amber-100/60 dark:hover:bg-[#341121] text-slate-700 dark:text-stone-300 text-xs font-bold border border-amber-200/70 dark:border-[#4d1d2c] transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-churchgold-600 dark:text-churchgold-400" />
            <span>طباعة</span>
          </button>

          {role === 'amin_khedma_am' && (
            <button
              onClick={onAddServant}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-churchgold-600 to-amber-600 hover:from-churchgold-700 hover:to-amber-700 text-burgundy-950 font-black text-xs transition-all shadow-xs cursor-pointer border border-churchgold-400/40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة خادم جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Pending Badge for General Amin */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {role === 'amin_khedma_am' && pendingServantsCount > 0 && (
          <button
            onClick={() => {
              setShowPendingOnly(!showPendingOnly);
              setDockFilterTab('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              showPendingOnly
                ? 'bg-amber-600 text-white shadow-xs font-black'
                : 'bg-amber-100 dark:bg-[#341822] text-amber-900 dark:text-amber-300 border border-amber-400 dark:border-amber-700 animate-pulse'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>بانتظار تعيين المرحلة ({pendingServantsCount})</span>
          </button>
        )}
        <button
          onClick={() => setDockFilterTab('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            dockFilterTab === 'all'
              ? 'bg-burgundy-800 text-white shadow-xs font-black'
              : 'bg-white dark:bg-[#1f0b16] text-slate-700 dark:text-stone-300 hover:bg-amber-50 border border-amber-200/60 dark:border-[#3d1523]'
          }`}
        >
          كافة الخدام ({servants.length})
        </button>

        <button
          onClick={() => setDockFilterTab('assigned')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
            dockFilterTab === 'assigned'
              ? 'bg-burgundy-800 text-white shadow-xs font-black'
              : 'bg-white dark:bg-[#1f0b16] text-slate-700 dark:text-stone-300 hover:bg-amber-50 border border-amber-200/60 dark:border-[#3d1523]'
          }`}
        >
          <Users className="w-3 h-3 text-churchgold-500" />
          <span>خدام المراحل المسكنون ({assignedCount})</span>
        </button>

        <button
          onClick={() => setDockFilterTab('dock')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
            dockFilterTab === 'dock'
              ? 'bg-amber-600 text-burgundy-950 shadow-xs font-black'
              : 'bg-amber-50 dark:bg-[#28131d] text-amber-900 dark:text-churchgold-300 hover:bg-amber-100 border border-amber-300/80 dark:border-[#4d1d2c]'
          }`}
        >
          <span>خدام عامون (غير مسكنين) ({dockCount})</span>
        </button>
      </div>

      {resetNotice && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-[#2c131f] border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-churchgold-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              تم تصفير كلمة سر الخادم (<strong>{resetNotice.servantName}</strong>) بنجاح! كلمة السر المؤقتة: <span className="font-mono bg-amber-200/60 dark:bg-amber-950/80 px-2 py-0.5 rounded-md font-black">{resetNotice.tempPass}</span>.
            </span>
          </div>
          <button onClick={() => setResetNotice(null)} className="text-amber-700 dark:text-churchgold-400 hover:text-amber-900 cursor-pointer">✕</button>
        </div>
      )}

      {unassignSuccessMsg && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{unassignSuccessMsg}</span>
        </div>
      )}

      {/* Unified Compact Search & Filter Bar */}
      <div className="bg-white dark:bg-[#1a0a12] p-2.5 sm:p-3 rounded-2xl border border-amber-200/80 dark:border-[#3e1423] shadow-2xs space-y-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-churchgold-600 dark:text-churchgold-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الخادم، الوظيفة، المنطقة، أو التليفون..."
              className="w-full pl-7 pr-9 py-2 bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl text-xs font-semibold text-slate-800 dark:text-stone-100 placeholder:text-slate-400 dark:placeholder:text-stone-500 focus:bg-white dark:focus:bg-[#2c0e1c] focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Criterion Selection */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-2 py-1.5 shrink-0">
              <Filter className="w-3.5 h-3.5 text-churchgold-600 dark:text-churchgold-400 shrink-0" />
              <select
                value={filterCriterion}
                onChange={(e) => setFilterCriterion(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-stone-200 focus:outline-none cursor-pointer"
              >
                <option value="all">تصفية: عام</option>
                {role === 'amin_khedma_am' && <option value="stage">المرحلة الخدمية</option>}
                <option value="month">شهر الميلاد</option>
              </select>
            </div>

            {filterCriterion === 'stage' && role === 'amin_khedma_am' && (
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="bg-amber-50 dark:bg-[#2e0f1d] border border-burgundy-300 dark:border-[#521c32] rounded-xl px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-stone-200 focus:outline-none"
              >
                <option value="all">جميع المراحل</option>
                <option value="عامة">خادم عام لجميع المراحل</option>
                {stagesList.filter(s => s.name !== 'عامة').map(s => (
                  <option key={s.id || s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            )}

            {filterCriterion === 'month' && (
              <select
                value={birthMonthFilter}
                onChange={(e) => setBirthMonthFilter(e.target.value)}
                className="bg-amber-50 dark:bg-[#2e0f1d] border border-burgundy-300 dark:border-[#521c32] rounded-xl px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-stone-200 focus:outline-none"
              >
                <option value="all">جميع الشهور</option>
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-amber-100/60 dark:border-[#33111d]">
            <span className="text-slate-500 dark:text-stone-400 font-bold">
              مطابق: {filteredServants.length} من {servants.length}
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setStageFilter('all');
                setBirthMonthFilter('all');
                setFilterCriterion('all');
                setDockFilterTab('all');
              }}
              className="text-burgundy-700 dark:text-churchgold-300 hover:underline font-black cursor-pointer"
            >
              إلغاء التصفية ✕
            </button>
          </div>
        )}
      </div>

      {/* Servants Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredServants.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white dark:bg-[#1a0a12] rounded-2xl border border-amber-200/80 dark:border-[#3e1423]">
            <ShieldCheck className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
            <p className="font-bold text-slate-600 dark:text-stone-300 text-sm">لا يوجد خدام مطابقين للبحث أو التصفية.</p>
          </div>
        ) : (
          filteredServants.map(servant => {
            const isDock = servant.assignedStage === 'عامة' || servant.roleType === 'general_dock';
            const isCaptain = servant.roleType === 'captain' || (servant.roleTitle && (servant.roleTitle.includes('أمين مرحلة') || servant.roleTitle.includes('أمين فصل')));
            const isFirstMate = servant.roleType === 'first_mate' || (servant.roleTitle && servant.roleTitle.includes('مساعد'));
            const hasMultipleStages = servant.assignedStages && servant.assignedStages.length > 0;

            return (
              <div
                key={servant.id}
                className="bg-white dark:bg-[#1c0a13] hover:bg-amber-50/30 dark:hover:bg-[#250d1a] border border-amber-200/90 dark:border-[#3d1423] rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between gap-3 transition-all shadow-2xs hover:shadow-xs"
              >
                {/* 1. Header: Name & Stages */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shrink-0 shadow-xs ${
                      isCaptain 
                        ? 'bg-gradient-to-tr from-churchgold-600 to-amber-500 text-burgundy-950 font-black' 
                        : isFirstMate
                        ? 'bg-blue-600 text-white'
                        : isDock
                        ? 'bg-amber-100 dark:bg-[#341121] text-amber-950 dark:text-churchgold-300'
                        : 'bg-burgundy-900 text-amber-100'
                    }`}>
                      {isCaptain ? '👑' : isFirstMate ? '🤝' : isDock ? '🌐' : servant.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-black text-sm sm:text-base text-slate-950 dark:text-stone-50 truncate">
                        {servant.name}
                      </div>
                      <div className="text-xs text-slate-700 dark:text-stone-300 font-bold truncate flex items-center gap-1.5 mt-0.5">
                        <span>{servant.roleTitle || (isCaptain ? 'أمين مرحلة' : isFirstMate ? 'أمين مساعد' : isDock ? 'خادم عام' : 'خادم فصل')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stage & Multiple Stages Badges */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`px-2.5 py-1 rounded-lg border text-xs font-black ${
                      isDock 
                        ? 'bg-amber-100 dark:bg-[#351424] text-amber-950 dark:text-churchgold-300 border-amber-300' 
                        : getStageBadgeClass(servant.assignedStage)
                    }`}>
                      {isDock ? 'خادم عام' : servant.assignedStage}
                    </span>
                    {hasMultipleStages && (
                      <div className="flex flex-wrap gap-1 justify-end max-w-[160px]">
                        {servant.assignedStages!.map(st => (
                          <span key={st} className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 dark:bg-[#12281c] text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-[#1d4633]">
                            +{st}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Direct Contact Box: Visible Phone & 1-Tap Buttons */}
                <div className="bg-amber-50/70 dark:bg-[#220c17] p-3 rounded-xl border border-amber-200 dark:border-[#381422] flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs text-slate-700 dark:text-stone-300 font-bold">
                      رقم تليفون الخادم:
                    </div>
                    {servant.phone ? (
                      <div className="font-mono font-black text-xs sm:text-sm text-slate-950 dark:text-stone-100 mt-0.5" dir="ltr">
                        {servant.phone}
                      </div>
                    ) : (
                      <div className="text-xs text-stone-500 italic mt-0.5">لا يوجد رقم مسجل</div>
                    )}
                  </div>

                  {servant.phone && (
                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={`tel:${servant.phone}`}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                        title="اتصال بالخادم"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>اتصال</span>
                      </a>
                      <a
                        href={`https://wa.me/2${servant.phone.replace(/[^0-9]/g, '')}`}
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

                {/* 3. Card Footer: Details & Administrative actions */}
                <div className="flex items-center justify-between pt-1.5 border-t border-amber-200/60 dark:border-[#2f101b]">
                  <button
                    onClick={() => setSelectedDetailsServant(servant)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-burgundy-900 hover:bg-burgundy-950 text-churchgold-200 text-xs sm:text-sm font-black shadow-xs border border-churchgold-500/40 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-churchgold-300" />
                    <span>البيانات والتفاصيل ➔</span>
                  </button>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {/* Reallocation & Promotion Button for General Supervisor */}
                    {role === 'amin_khedma_am' && (
                      <button
                        onClick={() => {
                          setReassignModalServant(servant);
                          setReassignStage(servant.assignedStage === 'عامة' ? 'ابتدائي (ثالثة ورابعة)' : servant.assignedStage);
                          setReassignRoleType(servant.roleType || (isDock ? 'general_dock' : 'crew'));
                          setReassignAdditionalStages(servant.assignedStages || []);
                        }}
                        className="px-2 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-churchgold-600 hover:from-amber-600 hover:to-churchgold-700 text-burgundy-950 font-black text-[11px] shadow-2xs flex items-center gap-1 cursor-pointer"
                        title="تسكين الخادم أو تغيير مرحلة الخدمة"
                      >
                        <Crown className="w-3 h-3" />
                        <span>تسكين</span>
                      </button>
                    )}

                    <button
                      onClick={() => setViewingAttendanceServant(servant)}
                      className="p-1.5 rounded-lg bg-stone-100 dark:bg-[#250d18] text-burgundy-700 dark:text-churchgold-300 hover:bg-amber-100 border border-amber-200/60 dark:border-[#4d1d2c] transition-colors cursor-pointer"
                      title="سجل الحضور"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                    </button>

                    {role === 'amin_khedma_am' && (
                      <button
                        onClick={() => handleResetPassword(servant)}
                        className="p-1.5 rounded-lg bg-amber-50 dark:bg-[#28131d] text-amber-700 dark:text-churchgold-300 hover:bg-amber-100 dark:hover:bg-[#3d192c] border border-amber-300/70 dark:border-[#541e33] transition-colors cursor-pointer"
                        title="تصفير كلمة السر لـ temp123"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {role === 'amin_khedma_am' && (
                      <button
                        onClick={() => onEditServant(servant)}
                        className="p-1.5 rounded-lg bg-stone-100 dark:bg-[#250d18] text-churchgold-700 dark:text-churchgold-300 hover:bg-amber-100 border border-amber-200/60 dark:border-[#4d1d2c] transition-colors cursor-pointer"
                        title="تعديل"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {role === 'amin_khedma_am' && (
                      <button
                        onClick={() => {
                          if (confirm(`حذف الخادم "${servant.name}"؟`)) {
                            deleteServant(servant.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-[#290d16] text-rose-600 hover:bg-rose-100 border border-rose-200/60 dark:border-rose-900/60 transition-colors cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Individual Servant Reallocation / Promotion Modal */}
      {reassignModalServant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#1a0a12] rounded-3xl max-w-lg w-full shadow-2xl border border-amber-300/80 dark:border-[#4d1d2c] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-950 p-4 text-white flex items-center justify-between border-b border-churchgold-400/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-churchgold-600 to-amber-500 flex items-center justify-center font-bold text-burgundy-950">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-stone-100">تعديل صفة ومراحل خدمة الخادم</h3>
                  <p className="text-[11px] text-churchgold-300">الخادم: {reassignModalServant.name}</p>
                </div>
              </div>
              <button onClick={() => setReassignModalServant(null)} className="p-1 text-stone-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleConfirmReassign} className="p-5 space-y-4 text-xs font-medium">
              <div className="p-3 bg-amber-50/70 dark:bg-[#240c17] rounded-2xl border border-amber-200/80 dark:border-[#461928] space-y-1">
                <span className="font-bold text-slate-900 dark:text-churchgold-300 block">✨ البيانات الحالية:</span>
                <div className="text-[11px] text-slate-700 dark:text-stone-300">
                  المرحلة الأساسية: <strong>{reassignModalServant.assignedStage}</strong> • الصفة: <strong>{reassignModalServant.roleTitle || 'خادم'}</strong>
                </div>
              </div>

              {/* Step 1: Select Role Type */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900 dark:text-stone-100">حدد المنصب / الدور المطلوب إسناده له *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReassignRoleType('captain')}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      reassignRoleType === 'captain'
                        ? 'bg-gradient-to-r from-churchgold-600 to-amber-600 text-burgundy-950 border-amber-400 ring-2 ring-amber-400/40 font-black shadow-xs'
                        : 'bg-stone-50 dark:bg-[#240b17] border-amber-200/60 dark:border-[#4d1d2c] text-slate-800 dark:text-stone-200'
                    }`}
                  >
                    <div className="text-base mb-1">👑 أمين مرحلة وفصل</div>
                    <div className="text-[10px] opacity-80">أمين المرحلة ومسؤول متابعة الفصول</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReassignRoleType('first_mate')}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      reassignRoleType === 'first_mate'
                        ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-400/40 font-black shadow-xs'
                        : 'bg-stone-50 dark:bg-[#240b17] border-amber-200/60 dark:border-[#4d1d2c] text-slate-800 dark:text-stone-200'
                    }`}
                  >
                    <div className="text-base mb-1">🤝 أمين مساعد</div>
                    <div className="text-[10px] opacity-80">مساعد أمين المرحلة والافتقاد</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReassignRoleType('crew')}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      reassignRoleType === 'crew'
                        ? 'bg-burgundy-800 text-white border-burgundy-600 ring-2 ring-burgundy-500/40 font-black shadow-xs'
                        : 'bg-stone-50 dark:bg-[#240b17] border-amber-200/60 dark:border-[#4d1d2c] text-slate-800 dark:text-stone-200'
                    }`}
                  >
                    <div className="text-base mb-1">✨ خادم بالمرحلة</div>
                    <div className="text-[10px] opacity-80">خادم أساسي مسؤول عن فصل بالمرحلة</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReassignRoleType('general_dock')}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      reassignRoleType === 'general_dock'
                        ? 'bg-amber-200 dark:bg-[#3d1829] text-amber-950 dark:text-churchgold-200 border-amber-400 ring-2 ring-amber-400/40 font-black shadow-xs'
                        : 'bg-stone-50 dark:bg-[#240b17] border-amber-200/60 dark:border-[#4d1d2c] text-slate-800 dark:text-stone-200'
                    }`}
                  >
                    <div className="text-base mb-1">🌐 خادم عام</div>
                    <div className="text-[10px] opacity-80">خدمة عامة لجميع المراحل والأنشطة</div>
                  </button>
                </div>
              </div>

              {/* Step 2: Select Stage (if not general dock) */}
              {reassignRoleType !== 'general_dock' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-900 dark:text-stone-100">حدد المرحلة الخدمية الأساسية *</label>
                    <select
                      value={reassignStage}
                      onChange={(e) => setReassignStage(e.target.value)}
                      className="w-full bg-white dark:bg-[#250d18] border border-amber-300 dark:border-[#521c32] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy-600/30 cursor-pointer"
                    >
                      {stagesList.filter(s => s.name !== 'عامة').map(s => (
                        <option key={s.id || s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Multi-stage: Additional stages to serve in */}
                  <div className="p-3 bg-emerald-50/60 dark:bg-[#12241b] rounded-2xl border border-emerald-200/80 dark:border-[#1d4633] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-slate-800 dark:text-stone-200 text-xs">
                        مراحل إضافية يخدم بها هذا الخادم:
                      </label>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                        {reassignAdditionalStages.length} مراحل إضافية
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-stone-400">
                      يمكن للخادم أن يخدم في أكثر من مرحلة في نفس الوقت (مثال: يخدم في الابتدائي مع حضانة أو كورال):
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {stagesList.filter(s => s.name !== reassignStage && s.name !== 'عامة').map(stg => {
                        const isSelected = reassignAdditionalStages.includes(stg.name);
                        return (
                          <button
                            key={stg.id || stg.name}
                            type="button"
                            onClick={() => {
                              setReassignAdditionalStages(prev => 
                                isSelected ? prev.filter(s => s !== stg.name) : [...prev, stg.name]
                              );
                            }}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-emerald-600 text-white shadow-xs font-black' 
                                : 'bg-white dark:bg-[#1a0a12] text-slate-700 dark:text-stone-300 border border-emerald-200/60 dark:border-[#244b36] hover:bg-emerald-100 dark:hover:bg-[#1a3827]'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '} {stg.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-amber-100 dark:border-[#381421]">
                <button
                  type="button"
                  onClick={() => setReassignModalServant(null)}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-[#250d18] text-slate-700 dark:text-stone-300 font-bold"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isReassigning}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-churchgold-600 to-amber-600 hover:from-churchgold-700 hover:to-amber-700 text-burgundy-950 font-black shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>تطبيق التعديل</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Reset Modal */}
      {showBulkResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#1a0a12] rounded-3xl max-w-md w-full shadow-2xl border border-amber-300/80 dark:border-[#4d1d2c] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-burgundy-950 to-[#2c0e1e] p-4 text-white flex items-center justify-between border-b border-churchgold-400/20">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-churchgold-400" />
                <h3 className="font-extrabold text-sm text-stone-100">إعادة توزيع وتعيين الخدام</h3>
              </div>
              <button onClick={() => setShowBulkResetModal(false)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 dark:text-stone-300 leading-relaxed">
                هذا الإجراء يقوم بتحويل صفة الخدام إلى <strong>خادم عام (خدمة عامة)</strong> لإتاحة إعادة توزيعهم على المراحل والفصول بحرية.
              </p>

              <div className="space-y-2 pt-2">
                {stageFilter !== 'all' && (
                  <button
                    onClick={() => handleExecuteBulkReset('current')}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-[#29111e] text-amber-900 dark:text-churchgold-300 border border-amber-300 dark:border-[#4d1d2c] font-bold text-right flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>تحويل خدام مرحلة ({stageFilter}) إلى خدام عامين</span>
                    <Users className="w-4 h-4 text-churchgold-600 shrink-0" />
                  </button>
                )}

                <button
                  onClick={() => handleExecuteBulkReset('all')}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-burgundy-700 to-burgundy-800 hover:from-burgundy-800 hover:to-burgundy-900 text-white font-bold text-right flex items-center justify-between transition-colors cursor-pointer shadow-md"
                >
                  <span>تحويل جميع خدام الكنيسة إلى خدام عامين</span>
                  <UserX className="w-4 h-4 text-churchgold-300 shrink-0" />
                </button>
              </div>

              <div className="pt-2 text-left">
                <button
                  onClick={() => setShowBulkResetModal(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-[#250d18] text-slate-700 dark:text-stone-300 font-bold"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Person Attendance History Modal */}
      <PersonAttendanceModal
        isOpen={!!viewingAttendanceServant}
        onClose={() => setViewingAttendanceServant(null)}
        person={viewingAttendanceServant}
        targetType="servant"
      />

      {/* Full Person Details Modal */}
      <PersonDetailsModal
        isOpen={!!selectedDetailsServant}
        onClose={() => setSelectedDetailsServant(null)}
        person={selectedDetailsServant}
        type="servant"
        onEdit={(s) => onEditServant(s as Servant)}
        onDelete={(id) => deleteServant(id)}
        onViewAttendanceHistory={(s) => setViewingAttendanceServant(s as Servant)}
      />

    </div>
  );
};
