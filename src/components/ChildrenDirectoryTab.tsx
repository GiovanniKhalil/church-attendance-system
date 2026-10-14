import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Child } from '../types';
import { MONTHS, AREAS } from '../data/mockData';
import { 
  Search, Filter, Plus, Phone, MessageCircle, User, 
  MapPin, Calendar, Cake, Edit3, Trash2, Download, 
  Printer, X, ChevronDown, CheckCircle2, ShieldCheck, BarChart2, 
  SlidersHorizontal, ArrowUpRight, Upload, FileSpreadsheet, FileText, Check, AlertCircle, Sparkles,
  Table, LayoutGrid
} from 'lucide-react';
import { PersonAttendanceModal } from './PersonAttendanceModal';
import { PersonDetailsModal } from './PersonDetailsModal';
import { PrintReportModal } from './PrintReportModal';
import { getStageBadgeClass } from '../utils/themeColors';
import { calculateAge, isUpcomingBirthday, getDaysUntilBirthday } from '../utils/dateUtils';
import { exportChildrenToXLSX, parseExcelOrCsvFile, downloadExcelTemplate } from '../utils/excelService';

type FilterCriterion = 'all' | 'stage' | 'area' | 'birthMonth' | 'age';

export const ChildrenDirectoryTab: React.FC<{
  onAddChild: () => void;
  onEditChild: (child: Child) => void;
  onViewChild: (child: Child) => void;
}> = ({ onAddChild, onEditChild, onViewChild }) => {
  const { 
    children, addChild, batchAddChildren, deleteChild, filters, setFilters, 
    resetFilters, role, currentUser, selectedStageScope, stagesList, promoteAllStages 
  } = useApp();
  const [viewingAttendanceChild, setViewingAttendanceChild] = useState<Child | null>(null);
  const [selectedDetailsChild, setSelectedDetailsChild] = useState<Child | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeCriterion, setActiveCriterion] = useState<FilterCriterion>('all');
  const [promoteSuccessNotice, setPromoteSuccessNotice] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Excel / CSV Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreviewList, setImportPreviewList] = useState<Omit<Child, 'id' | 'createdAt'>[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  const userStages = Array.from(new Set([
    currentUser?.assignedStage,
    ...(currentUser?.assignedStages || [])
  ].filter(Boolean))) as string[];

  const effectiveStage = role === 'amin_khedma_am' 
    ? filters.stageFilter 
    : (userStages.length > 1 && filters.stageFilter !== 'all' 
        ? filters.stageFilter 
        : (filters.stageFilter !== 'all' ? filters.stageFilter : (currentUser?.assignedStage || selectedStageScope)));

  // Search and Filter Logic
  const filteredChildren = children.filter(child => {
    const query = filters.searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      child.name.toLowerCase().includes(query) ||
      (child.phone && child.phone.includes(query)) ||
      (child.parentPhone && child.parentPhone.includes(query)) ||
      (child.parentName && child.parentName.toLowerCase().includes(query)) ||
      (child.parent2Phone && child.parent2Phone.includes(query)) ||
      (child.parent2Name && child.parent2Name.toLowerCase().includes(query)) ||
      (child.birthDate && child.birthDate.includes(query));

    const matchesStage = effectiveStage === 'all' 
      ? (role === 'amin_khedma_am' || userStages.length === 0
          ? true 
          : (userStages.includes(child.stage) || (child.secondaryStages && child.secondaryStages.some(s => userStages.includes(s)))))
      : (child.stage === effectiveStage || (child.secondaryStages && child.secondaryStages.includes(effectiveStage)));
    const matchesBirthMonth = filters.birthMonthFilter === 'all' || child.birthMonth === Number(filters.birthMonthFilter);
    const matchesAge = filters.ageFilter === 'all' || child.age === Number(filters.ageFilter);

    return matchesSearch && matchesStage && matchesBirthMonth && matchesAge;
  });

  // Count active filters (excluding default 'all' and blank search)
  const activeFiltersCount = [
    filters.stageFilter !== 'all',
    filters.birthMonthFilter !== 'all',
    filters.ageFilter !== 'all',
    Boolean(filters.searchQuery.trim())
  ].filter(Boolean).length;

  // Export to Excel (.xlsx) using SheetJS
  const exportToExcel = () => {
    exportChildrenToXLSX(filteredChildren, effectiveStage === 'all' ? 'جميع المراحل' : effectiveStage);
  };

  const downloadSampleTemplate = () => {
    downloadExcelTemplate();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setImportError(null);

    try {
      const parsedRows = await parseExcelOrCsvFile(file);
      if (parsedRows.length === 0) {
        setImportError('لم يتم العثور على أي أسماء مخدومين صالحة في ملف الإكسيل');
        return;
      }

      setImportPreviewList(parsedRows);
      setIsImportModalOpen(true);
    } catch (err: any) {
      setImportError('حدث خطأ أثناء قراءة ملف الإكسيل: ' + (err.message || 'تنسيق غير مدعوم'));
    } finally {
      e.target.value = '';
    }
  };

  const confirmImport = async () => {
    try {
      await batchAddChildren(importPreviewList);
      setImportSuccessMsg(`تم بنجاح استيراد وإضافة ${importPreviewList.length} مخدوم دفعة واحدة إلى المنظومة والسحابة!`);
      setIsImportModalOpen(false);
      setImportPreviewList([]);
      setTimeout(() => setImportSuccessMsg(null), 6000);
    } catch (err: any) {
      setImportError('فشل حفظ البيانات: ' + (err.message || 'حدث خطأ'));
    }
  };

  const currentMonthNum = new Date().getMonth() + 1;

  return (
    <div className="space-y-3 sm:space-y-4">
      
      {/* Directory Title & Quick Controls Header - Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-[#1a0a12] p-3 sm:p-4 rounded-2xl border border-amber-200/80 dark:border-[#3e1423] shadow-2xs">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-stone-100">كشف الأولاد</h2>
            <span className="px-2 py-0.5 rounded-full bg-burgundy-100 dark:bg-burgundy-950/70 text-burgundy-900 dark:text-churchgold-300 text-xs font-bold border border-burgundy-200 dark:border-burgundy-800">
              {filteredChildren.length} مخدوم
            </span>
          </div>

          {/* Quick Add Button (visible on mobile in header) */}
          <button
            onClick={onAddChild}
            className="sm:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-burgundy-800 hover:bg-burgundy-900 text-white text-xs font-bold shadow-xs border border-churchgold-400/30 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-churchgold-300" />
            <span>إضافة ولد</span>
          </button>
        </div>

        {/* Action Buttons for Desktop / Tablet */}
        <div className="hidden sm:flex items-center gap-2">
          {role === 'amin_khedma_am' && (
            <button
              onClick={() => {
                if (confirm('هل ترغب في تصعيد وترحيل كافة المراحل للمرحلة التالية للعام الجديد؟')) {
                  const res = promoteAllStages();
                  setPromoteSuccessNotice(`تم بنجاح تصعيد وترحيل ${res.promotedCount} مخدوم وتخريج ${res.graduationCount} للمرحلة التالية!`);
                  setTimeout(() => setPromoteSuccessNotice(null), 7000);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800 transition-colors cursor-pointer"
              title="تصعيد وترحيل كافة المراحل للعام الدراسي الجديد"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              <span>تصعيد المراحل للعام الجديد</span>
            </button>
          )}

          {/* Excel Import Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-[#28131d] hover:bg-amber-100 dark:hover:bg-[#381a28] text-amber-900 dark:text-churchgold-300 text-xs font-bold transition-colors border border-amber-300/80 dark:border-[#541e33] cursor-pointer"
            title="استيراد كشف أولاد من ملف Excel أو CSV"
          >
            <Upload className="w-3.5 h-3.5 text-amber-700 dark:text-churchgold-400" />
            <span>استيراد Excel</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx, .xls, .csv, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={downloadSampleTemplate}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-[#250d18] hover:bg-stone-200 dark:hover:bg-[#341121] text-slate-600 dark:text-stone-300 text-xs font-bold transition-colors border border-amber-200/60 dark:border-[#4d1d2c] cursor-pointer"
            title="تحميل نموذج إكسيل فارغ لتعبئة بيانات الأولاد ورفعها"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>نموذج Excel</span>
          </button>

          <button
            onClick={exportToExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-[#250d18] hover:bg-amber-100/50 dark:hover:bg-[#341121] text-slate-700 dark:text-stone-300 text-xs font-bold transition-colors border border-amber-200/60 dark:border-[#4d1d2c] cursor-pointer"
            title="تصدير كشف الأولاد إلى ملف Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-churchgold-600 dark:text-churchgold-400" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-[#250d18] hover:bg-amber-100/50 dark:hover:bg-[#341121] text-slate-700 dark:text-stone-300 text-xs font-bold transition-colors border border-amber-200/60 dark:border-[#4d1d2c] cursor-pointer"
            title="تصدير كشف الأولاد أو طباعته كـ تقرير PDF رسمي"
          >
            <Printer className="w-3.5 h-3.5 text-churchgold-600 dark:text-churchgold-400" />
            <span>تصدير PDF / طباعة</span>
          </button>

          <button
            onClick={onAddChild}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-burgundy-700 to-burgundy-800 hover:from-burgundy-800 hover:to-burgundy-900 text-white text-xs font-bold transition-all shadow-xs border border-churchgold-400/30 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-churchgold-300" />
            <span>إضافة ولد جديد</span>
          </button>
        </div>
      </div>

      {promoteSuccessNotice && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{promoteSuccessNotice}</span>
        </div>
      )}

      {/* Unified Compact Search & Smart Filter Bar */}
      <div className="bg-white dark:bg-[#1a0a12] p-2.5 sm:p-3.5 rounded-2xl border border-amber-200/80 dark:border-[#3e1423] shadow-2xs space-y-2.5 transition-colors">
        
        {/* Main Row: Search Input + Filter Selector + Advanced Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-churchgold-600 dark:text-churchgold-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="ابحث بالاسم، التليفون، المنطقة، أو ولي الأمر..."
              className="w-full pl-7 pr-9 py-2 bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl text-xs font-semibold text-slate-800 dark:text-stone-100 placeholder:text-slate-400 dark:placeholder:text-stone-500 focus:bg-white dark:focus:bg-[#2c0e1c] focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-stone-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Single Filter Selector & Value */}
          <div className="flex items-center gap-1.5">
            {/* Filter Criterion Selector */}
            <div className="flex items-center gap-1 bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-2 py-1.5 shrink-0">
              <Filter className="w-3.5 h-3.5 text-churchgold-600 dark:text-churchgold-400 shrink-0" />
              <select
                value={activeCriterion}
                onChange={(e) => setActiveCriterion(e.target.value as FilterCriterion)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-stone-200 focus:outline-none cursor-pointer"
                title="اختر طريقة الفلترة"
              >
                <option value="all">فلتر: عام</option>
                {(role === 'amin_khedma_am' || userStages.length > 1) && <option value="stage">المرحلة</option>}
                <option value="birthMonth">شهر الميلاد</option>
                <option value="age">السن</option>
              </select>
            </div>

            {/* Inline Criterion Value Selector when chosen */}
            {activeCriterion === 'stage' && (role === 'amin_khedma_am' || userStages.length > 1) && (
              <select
                value={filters.stageFilter}
                onChange={(e) => setFilters(prev => ({ ...prev, stageFilter: e.target.value }))}
                className="bg-amber-50 dark:bg-[#2e0f1d] border border-burgundy-300 dark:border-[#521c32] rounded-xl px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-stone-200 focus:outline-none animate-in fade-in"
              >
                <option value="all">{role === 'amin_khedma_am' ? 'جميع المراحل' : 'جميع مراحلي'}</option>
                {(role === 'amin_khedma_am' ? stagesList.map(s => s.name) : userStages).map(stgName => (
                  <option key={stgName} value={stgName}>{stgName}</option>
                ))}
              </select>
            )}

            {activeCriterion === 'birthMonth' && (
              <select
                value={filters.birthMonthFilter}
                onChange={(e) => setFilters(prev => ({ ...prev, birthMonthFilter: e.target.value }))}
                className="bg-amber-50 dark:bg-[#2e0f1d] border border-burgundy-300 dark:border-[#521c32] rounded-xl px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-stone-200 focus:outline-none animate-in fade-in"
              >
                <option value="all">جميع الشهور</option>
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label} {m.value === currentMonthNum ? '🎂' : ''}
                  </option>
                ))}
              </select>
            )}

            {activeCriterion === 'age' && (
              <select
                value={filters.ageFilter}
                onChange={(e) => setFilters(prev => ({ ...prev, ageFilter: e.target.value }))}
                className="bg-amber-50 dark:bg-[#2e0f1d] border border-burgundy-300 dark:border-[#521c32] rounded-xl px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-stone-200 focus:outline-none animate-in fade-in"
              >
                <option value="all">جميع الأعمار</option>
                {Array.from({ length: 15 }, (_, i) => i + 4).map(age => (
                  <option key={age} value={age}>{age} سنوات</option>
                ))}
              </select>
            )}

            {/* Toggle Full Multi-Filters */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                showAdvancedFilters || activeFiltersCount > 0
                  ? 'bg-burgundy-100 dark:bg-[#331120] text-burgundy-900 dark:text-churchgold-300 border-burgundy-300 dark:border-[#4d1f2e]'
                  : 'bg-stone-50 dark:bg-[#240b17] text-slate-600 dark:text-stone-400 border-amber-200/80 dark:border-[#4d1d2c]'
              }`}
              title="تخصيص الفلاتر المتقدمة"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-burgundy-800 text-white text-[9px] font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Multi-Filter Panel (When user specifically wants all filters active) */}
        {showAdvancedFilters && (
          <div className="pt-2 border-t border-amber-100 dark:border-[#2f101b] grid grid-cols-2 sm:grid-cols-4 gap-2 animate-in fade-in">
            {role === 'amin_khedma_am' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-stone-400 mb-0.5">المرحلة</label>
                <select
                  value={filters.stageFilter}
                  onChange={(e) => setFilters(prev => ({ ...prev, stageFilter: e.target.value }))}
                  className="w-full bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800 dark:text-stone-200"
                >
                  <option value="all">الكل</option>
                  {stagesList.map(s => (
                    <option key={s.id || s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-stone-400 mb-0.5">شهر الميلاد</label>
              <select
                value={filters.birthMonthFilter}
                onChange={(e) => setFilters(prev => ({ ...prev, birthMonthFilter: e.target.value }))}
                className="w-full bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800 dark:text-stone-200"
              >
                <option value="all">الكل</option>
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-stone-400 mb-0.5">السن</label>
              <select
                value={filters.ageFilter}
                onChange={(e) => setFilters(prev => ({ ...prev, ageFilter: e.target.value }))}
                className="w-full bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800 dark:text-stone-200"
              >
                <option value="all">الكل</option>
                {Array.from({ length: 15 }, (_, i) => i + 4).map(age => (
                  <option key={age} value={age}>{age} سنين</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Clear Filters Indicator */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-amber-100/60 dark:border-[#33111d]">
            <span className="text-slate-500 dark:text-stone-400 font-bold">
              مطابق: {filteredChildren.length} من {children.length}
            </span>
            <button
              onClick={() => {
                resetFilters();
                setActiveCriterion('all');
              }}
              className="text-burgundy-700 dark:text-churchgold-300 hover:underline font-black cursor-pointer"
            >
              إلغاء التصفية ✕
            </button>
          </div>
        )}

      </div>

      {/* UNIFIED RESPONSIVE CARDS VIEW - Focused on Stages & Direct Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredChildren.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white dark:bg-[#1a0a12] rounded-2xl border border-amber-200/80 dark:border-[#3e1423]">
            <User className="w-8 h-8 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
            <p className="text-xs font-bold text-slate-700 dark:text-stone-300">لا يوجد أولاد مطابقين للبحث</p>
          </div>
        ) : (
          filteredChildren.map(child => {
            const hasMultipleStages = child.secondaryStages && child.secondaryStages.length > 0;

            return (
              <div
                key={child.id}
                className="bg-white dark:bg-[#1a0a12] p-3.5 sm:p-4 rounded-2xl border border-amber-200/80 dark:border-[#381422] hover:border-amber-400 dark:hover:border-[#521c32] shadow-2xs hover:shadow-xs transition-all space-y-3"
              >
                {/* 1. Header: Name & Stages (Primary Stage & All Secondary Stages) */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shrink-0 shadow-xs ${
                      child.gender === 'boy' 
                        ? 'bg-gradient-to-tr from-sky-700 to-sky-500' 
                        : 'bg-gradient-to-tr from-pink-600 to-rose-400'
                    }`}>
                      {child.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-sm sm:text-base text-slate-950 dark:text-stone-100 truncate block">
                        {child.name}
                      </div>
                      <div className="text-xs text-slate-700 dark:text-stone-300 font-bold">
                        السن: {child.age} سنة • {child.gender === 'boy' ? 'ولد 👦' : 'بنت 👧'}
                      </div>
                    </div>
                  </div>

                  {/* Stages Badges (Essential for users seeing multiple stages) */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`px-2.5 py-1 rounded-lg border text-xs font-black ${getStageBadgeClass(child.stage)}`}>
                      {child.stage}
                    </span>
                    {hasMultipleStages && (
                      <div className="flex flex-wrap gap-1 justify-end max-w-[170px]">
                        {child.secondaryStages!.map(st => (
                          <span key={st} className="px-2 py-0.5 rounded text-xs font-bold bg-amber-50 dark:bg-[#28131e] text-amber-950 dark:text-churchgold-300 border border-amber-300 dark:border-[#4d1d2c]">
                            +{st}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Essential Contact Box: Direct Phone Numbers & Quick Actions */}
                <div className="bg-amber-50/70 dark:bg-[#220c17] p-3 rounded-xl border border-amber-200 dark:border-[#381422] space-y-2.5">
                  {/* Primary Parent Phone */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs text-slate-700 dark:text-stone-300 font-bold">
                        ولي الأمر الأساسي: <span className="text-slate-950 dark:text-stone-100 font-black">{child.parentName || 'ولي الأمر'}</span>
                      </div>
                      {child.parentPhone ? (
                        <div className="font-mono font-black text-xs sm:text-sm text-slate-950 dark:text-white mt-0.5" dir="ltr">
                          {child.parentPhone}
                        </div>
                      ) : (
                        <div className="text-xs text-stone-500 italic mt-0.5">لا يوجد رقم مسجل</div>
                      )}
                    </div>

                    {child.parentPhone && (
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`tel:${child.parentPhone}`}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                          title="اتصال بولي الأمر الأساسي"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>اتصال</span>
                        </a>
                        <a
                          href={`https://wa.me/2${child.parentPhone.replace(/[^0-9]/g, '')}`}
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

                  {/* Secondary Parent Phone (ولي أمر آخر إن وجد) */}
                  {(child.parent2Name || child.parent2Phone) && (
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-amber-200/60 dark:border-[#33111e]">
                      <div className="min-w-0">
                        <div className="text-xs text-slate-700 dark:text-stone-300 font-bold">
                          ولي أمر آخر: <span className="text-slate-950 dark:text-stone-100 font-black">{child.parent2Name || 'ولي أمر إضافي'}</span>
                        </div>
                        {child.parent2Phone ? (
                          <div className="font-mono font-black text-xs sm:text-sm text-slate-950 dark:text-white mt-0.5" dir="ltr">
                            {child.parent2Phone}
                          </div>
                        ) : (
                          <div className="text-xs text-stone-500 italic mt-0.5">لا يوجد رقم مسجل</div>
                        )}
                      </div>

                      {child.parent2Phone && (
                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={`tel:${child.parent2Phone}`}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
                            title="اتصال بولي الأمر الآخر"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>اتصال</span>
                          </a>
                          <a
                            href={`https://wa.me/2${child.parent2Phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
                            title="واتساب"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>واتساب</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Child Personal Phone (if exists) */}
                  {child.phone && (
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-amber-200/60 dark:border-[#33111e]">
                      <div className="min-w-0">
                        <div className="text-xs text-slate-700 dark:text-stone-300 font-bold">
                          تليفون المخدوم:
                        </div>
                        <div className="font-mono font-black text-xs sm:text-sm text-slate-950 dark:text-white mt-0.5" dir="ltr">
                          {child.phone}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`tel:${child.phone}`}
                          className="px-2.5 py-1 rounded-lg bg-burgundy-100 dark:bg-[#341121] text-burgundy-950 dark:text-churchgold-200 text-xs font-bold flex items-center gap-1 border border-burgundy-200 dark:border-[#4d1d2c]"
                          title="اتصال بالولد"
                        >
                          <Phone className="w-3 h-3" />
                          <span>اتصال</span>
                        </a>
                        <a
                          href={`https://wa.me/2${child.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-[#12281c] text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-1 border border-emerald-300 dark:border-[#1d4633]"
                          title="واتساب الولد"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>واتساب</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Card Footer: "البيانات الإضافية" Button & Quick Actions */}
                <div className="flex items-center justify-between pt-1.5">
                  <button
                    onClick={() => setSelectedDetailsChild(child)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-burgundy-900 hover:bg-burgundy-950 text-churchgold-200 text-xs sm:text-sm font-black shadow-xs border border-churchgold-500/40 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-churchgold-300" />
                    <span>البيانات الإضافية والتفاصيل ➔</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditChild(child)}
                      className="p-2 rounded-xl bg-stone-100 dark:bg-[#250d18] text-amber-800 dark:text-churchgold-300 hover:bg-amber-100 dark:hover:bg-[#381421] border border-amber-200/80 dark:border-[#4d1d2c] transition-colors cursor-pointer"
                      title="تعديل بيانات المخدوم"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف بيانات المخدوم "${child.name}"؟`)) {
                          deleteChild(child.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-[#290d16] text-rose-700 hover:bg-rose-100 dark:hover:bg-[#3d1320] border border-rose-200 dark:border-[#521c2e] transition-colors cursor-pointer"
                      title="حذف المخدوم"
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

      {/* Person Attendance History Modal */}
      <PersonAttendanceModal
        isOpen={!!viewingAttendanceChild}
        onClose={() => setViewingAttendanceChild(null)}
        person={viewingAttendanceChild}
        targetType="child"
      />

      {/* Full Person Details Modal */}
      <PersonDetailsModal
        isOpen={!!selectedDetailsChild}
        onClose={() => setSelectedDetailsChild(null)}
        person={selectedDetailsChild}
        type="child"
        onEdit={(c) => onEditChild(c as Child)}
        onDelete={(id) => deleteChild(id)}
        onViewAttendanceHistory={(c) => setViewingAttendanceChild(c as Child)}
      />

      {/* Excel / CSV Import Preview Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a0a12] border border-amber-200/80 dark:border-[#3e1423] rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl text-slate-800 dark:text-stone-200 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 border-b border-amber-100 dark:border-[#381622]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-[#341121] text-amber-900 dark:text-churchgold-300">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-stone-100">استيراد كشف الأولاد من Excel</h3>
                  <p className="text-xs text-slate-500 dark:text-stone-400">الملف: {importFileName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between">
              <span>تم العثور على {importPreviewList.length} مخدوم جاهزين للإضافة.</span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                {importPreviewList.filter(c => c.gender === 'boy').length} أولاد • {importPreviewList.filter(c => c.gender === 'girl').length} بنات
              </span>
            </div>

            {/* Candidate List Cards (Zero Tables - Clean Card Format) */}
            <div className="overflow-y-auto max-h-72 border border-amber-200/60 dark:border-[#4d1d2c] rounded-2xl p-2 space-y-2 bg-stone-50/50 dark:bg-[#14060d]">
              {importPreviewList.map((c, i) => (
                <div 
                  key={i} 
                  className="p-3 bg-white dark:bg-[#1c0812] rounded-xl border border-amber-200/60 dark:border-[#381422] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs hover:border-amber-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-[#341121] text-burgundy-900 dark:text-churchgold-300 font-mono font-black text-xs flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <div className="font-black text-sm text-slate-900 dark:text-stone-100 flex items-center gap-1.5">
                        <span>{c.name}</span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          c.gender === 'boy' 
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' 
                            : 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300'
                        }`}>
                          {c.gender === 'boy' ? 'ولد 👦' : 'بنت 👧'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-stone-400 mt-0.5 flex items-center gap-2">
                        <span>المرحلة: <strong className="text-burgundy-800 dark:text-churchgold-300">{c.stage}</strong></span>
                        {c.age && <span>• السن: {c.age} سنين</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 dark:text-stone-300 flex items-center gap-3">
                    {c.parentName && <span>ولي الأمر: <strong className="text-slate-900 dark:text-stone-100">{c.parentName}</strong></span>}
                    {(c.parentPhone || c.phone) && (
                      <span className="font-mono font-bold text-slate-800 dark:text-stone-200" dir="ltr">
                        📞 {c.parentPhone || c.phone}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-100 dark:border-[#381622]">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-[#250d18] text-slate-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-200 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmImport}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>تأكيد استيراد {importPreviewList.length} مخدوم</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Global Import Success or Error Messages */}
      {importSuccessMsg && (
        <div className="fixed bottom-5 left-5 z-50 p-3.5 bg-emerald-800 text-white rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{importSuccessMsg}</span>
        </div>
      )}

      {importError && (
        <div className="fixed bottom-5 left-5 z-50 p-3.5 bg-rose-800 text-white rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom duration-200">
          <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
          <span>{importError}</span>
          <button onClick={() => setImportError(null)} className="mr-2 text-rose-200 hover:text-white">✕</button>
        </div>
      )}

      {/* Print / PDF Official Report Modal */}
      <PrintReportModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        initialStage={effectiveStage}
        reportType="directory"
      />

    </div>
  );
};
