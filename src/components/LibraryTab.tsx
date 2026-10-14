import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Book, BookCategory, Stage } from '../types';
import { 
  BookOpen, Sparkles, Download, Eye, Plus, Search, 
  FileText, Bookmark, Calendar, User, Trash2, CheckCircle2, ShieldCheck, FileCheck, Layers, Settings2
} from 'lucide-react';
import { getStageBadgeClass } from '../utils/themeColors';

export const LibraryTab: React.FC<{ onOpenAddBook: () => void; onViewBook: (book: Book) => void }> = ({
  onOpenAddBook,
  onViewBook
}) => {
  const { books, deleteBook, selectedStageScope, role, currentUser, stagesList } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const isAminAm = role === 'amin_khedma_am';
  const isKhadem = role === 'khadem';
  const isGeneralServant = isKhadem && (!currentUser?.assignedStage || currentUser?.assignedStage === 'عامة');

  const [selectedStage, setSelectedStage] = useState<string>(() => {
    if (isAminAm) return selectedStageScope;
    if (isGeneralServant) return 'عامة';
    return currentUser?.assignedStage || selectedStageScope;
  });

  // Sync state if selectedStageScope changes from global scope selector
  React.useEffect(() => {
    if (isAminAm) {
      setSelectedStage(selectedStageScope);
    } else if (isGeneralServant) {
      setSelectedStage('عامة');
    } else {
      setSelectedStage(currentUser?.assignedStage || selectedStageScope);
    }
  }, [selectedStageScope, isAminAm, isGeneralServant, currentUser]);

  const filteredBooks = books.filter(book => {
    const matchesCategory = activeCategory === 'all' || book.category === activeCategory;
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase()));

    // Stage visibility rules:
    let matchesStage = false;

    if (isGeneralServant) {
      // الخدام في العامة: لا يظهر لهم سوى الكتب المخصصة لـ "عامة"
      matchesStage = (book.targetStages?.includes('عامة') || book.targetStage === 'عامة') ?? false;
    } else if (isAminAm) {
      // الأمين العام يرى جميع الكتب ويمكنه الفلترة بأي مرحلة
      if (selectedStage === 'all') {
        matchesStage = true;
      } else {
        matchesStage = (
          book.targetStages?.includes(selectedStage as Stage) ||
          book.targetStage === selectedStage
        ) ?? false;
      }
    } else {
      // خدام وأمناء المراحل النوعية: يرون كتب مرحلتهم + الكتب العامة
      const userStage = (currentUser?.assignedStage || selectedStageScope) as Stage;
      matchesStage = (
        book.targetStages?.includes(userStage) ||
        book.targetStages?.includes('عامة') ||
        book.targetStage === userStage ||
        book.targetStage === 'عامة'
      ) ?? false;
    }

    return matchesCategory && matchesSearch && matchesStage;
  });

  const allCount = books.length;
  const khedmaCount = books.filter(b => b.category === 'khedma').length;
  const mahrajanCount = books.filter(b => b.category === 'mahrajan').length;
  const aqedaCount = books.filter(b => b.category === 'aqeda_taqs').length;
  const bibleCount = books.filter(b => b.category === 'bible').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Category Switcher */}
      <div className="bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-churchgold-500/30">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -top-10 w-64 h-64 bg-burgundy-700/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-churchgold-500/20 text-churchgold-300 text-xs font-bold border border-churchgold-400/30">
              <BookOpen className="w-3.5 h-3.5 text-churchgold-300" />
              <span>المكتبة التعليمية الرقمية والمناهج المعتمدة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-amber-50">
              مكتبة المناهج والكتب الإيبارشية
            </h2>
            <p className="text-amber-200/80 text-sm max-w-2xl leading-relaxed">
              {isGeneralServant 
                ? 'مرحباً بك خادم عام. يمكنك هنا تصفح وقراءة الكتب والمناهج العامة المتاحة لخدمة الكنيسة.'
                : 'تصفح كتب تحضير الدروس، مناهج مهرجان الكرازة، وكتب العقيدة والطقس لمرحلتك الدراسية.'}
            </p>
          </div>

          {/* Add Book Button: Amin Am Only */}
          {isAminAm && (
            <button
              onClick={onOpenAddBook}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-churchgold-600 to-amber-600 hover:from-churchgold-700 hover:to-amber-700 text-burgundy-950 font-black text-sm shadow-lg transition-all hover:scale-102 active:scale-98 shrink-0 cursor-pointer border border-churchgold-400/40"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة كتاب / PDF جديد</span>
            </button>
          )}
        </div>

        {/* Categories Tabs */}
        <div className="mt-8 pt-6 border-t border-churchgold-500/20 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-churchgold-600 text-burgundy-950 font-black shadow-md'
                : 'bg-burgundy-950/70 text-amber-200/80 hover:bg-burgundy-950/90 border border-churchgold-400/20'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>الكل ({allCount})</span>
          </button>

          <button
            onClick={() => setActiveCategory('khedma')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeCategory === 'khedma'
                ? 'bg-churchgold-600 text-burgundy-950 font-black shadow-md'
                : 'bg-burgundy-950/70 text-amber-200/80 hover:bg-burgundy-950/90 border border-churchgold-400/20'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>كتب الخدمة ({khedmaCount})</span>
          </button>

          <button
            onClick={() => setActiveCategory('mahrajan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeCategory === 'mahrajan'
                ? 'bg-churchgold-600 text-burgundy-950 font-black shadow-md'
                : 'bg-burgundy-950/70 text-amber-200/80 hover:bg-burgundy-950/90 border border-churchgold-400/20'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>مهرجان الكرازة ({mahrajanCount})</span>
          </button>

          <button
            onClick={() => setActiveCategory('aqeda_taqs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeCategory === 'aqeda_taqs'
                ? 'bg-churchgold-600 text-burgundy-950 font-black shadow-md'
                : 'bg-burgundy-950/70 text-amber-200/80 hover:bg-burgundy-950/90 border border-churchgold-400/20'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>عقيدة وطقس ({aqedaCount})</span>
          </button>

          <button
            onClick={() => setActiveCategory('bible')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeCategory === 'bible'
                ? 'bg-churchgold-600 text-burgundy-950 font-black shadow-md'
                : 'bg-burgundy-950/70 text-amber-200/80 hover:bg-burgundy-950/90 border border-churchgold-400/20'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>الكتاب المقدس ({bibleCount})</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#1a0a12] p-4 rounded-2xl border border-amber-200/80 dark:border-[#3e1423] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-200">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-churchgold-600 dark:text-churchgold-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الكتاب، المحتوى، أو المؤلف..."
            className="w-full pl-4 pr-10 py-2.5 bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl text-sm font-medium text-slate-800 dark:text-stone-100 focus:bg-white dark:focus:bg-[#2c0e1c] focus:outline-none focus:ring-2 focus:ring-burgundy-600/30 focus:border-burgundy-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-600 dark:text-stone-300 shrink-0">المرحلة الدراسية:</span>
          {isAminAm ? (
            <div className="flex items-center gap-2">
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
              >
                <option value="all">جميع المراحل الدراسية (عرض شامل)</option>
                <option value="عامة">عامة (كتب عامة لكل الخدام)</option>
                {stagesList.filter(s => s.name !== 'عامة').map(st => (
                  <option key={st.id || st.name} value={st.name}>{st.name}</option>
                ))}
              </select>
              <span className="text-[10px] text-churchgold-600 dark:text-churchgold-400 font-bold hidden sm:inline">
                👑 تحكم أمين الخدمة العام
              </span>
            </div>
          ) : isGeneralServant ? (
            <div className="bg-purple-50 dark:bg-[#260e1d] border border-purple-200 dark:border-[#4d1d2c] text-purple-900 dark:text-purple-300 rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-1.5 shadow-2xs shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>مرحلتك: عامة (معروض الكتب المتاحة للخدمة العامة)</span>
            </div>
          ) : (
            <div className="bg-churchgold-50 dark:bg-[#2a0d1b] border border-churchgold-300 dark:border-[#4d1d2c] text-burgundy-900 dark:text-churchgold-300 rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-1.5 shadow-2xs shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-churchgold-600 shrink-0" />
              <span>مرحلتك المسندة: {currentUser?.assignedStage || selectedStageScope}</span>
            </div>
          )}
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white dark:bg-[#1a0a12] rounded-3xl p-12 text-center border border-dashed border-amber-300/80 dark:border-[#4d1d2c] transition-colors duration-200">
          <BookOpen className="w-12 h-12 text-churchgold-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-stone-200">لا توجد كتب متاحة لهذه المرحلة أو مطابقة للبحث</h3>
          <p className="text-xs text-slate-500 dark:text-stone-400 mt-1">
            {isGeneralServant 
              ? 'تظهر هنا فقط الكتب التي حدد أمين الخدمة العام إتاحتها للمرحلة العامة.' 
              : 'جرب تغيير قسم التصنيف أو كلمة البحث.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBooks.map(book => {
            const stagesList = (book.targetStages && book.targetStages.length > 0) 
              ? book.targetStages 
              : [book.targetStage || 'عامة'];

            return (
              <div 
                key={book.id}
                className="bg-white dark:bg-[#1a0a12] rounded-2xl border border-amber-200/80 dark:border-[#3e1423] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group relative"
              >
                <div>
                  {/* Book Header Cover */}
                  <div 
                    className={`p-5 min-h-[130px] text-white relative flex flex-col justify-between ${
                      book.coverImage 
                        ? 'bg-slate-900' 
                        : `bg-gradient-to-r ${book.coverBg || 'from-burgundy-900 to-burgundy-950'}`
                    }`}
                  >
                    {book.coverImage && (
                      <div 
                        className="absolute inset-0 opacity-40 bg-cover bg-center transition-all group-hover:scale-105" 
                        style={{ backgroundImage: `url(${book.coverImage})` }} 
                      />
                    )}

                    <div className="relative z-10 flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap gap-1.5 max-w-[80%]">
                        {stagesList.map(stg => (
                          <span key={stg} className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${getStageBadgeClass(stg)}`}>
                            {stg}
                          </span>
                        ))}
                        {(book.pdfUrl || book.fileUrl) && (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-xs">
                            <FileCheck className="w-3 h-3" />
                            <span>PDF</span>
                          </span>
                        )}
                      </div>

                      {/* Delete Book: Amin Am Only */}
                      {isAminAm && (
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف كتاب "${book.title}"؟`)) {
                              deleteBook(book.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-black/30 hover:bg-rose-600 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
                          title="حذف الكتاب (صلاحية أمين الخدمة العام)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <h3 className="relative z-10 text-base font-bold leading-snug line-clamp-2 text-amber-50">
                      {book.title}
                    </h3>

                    {book.author && (
                      <p className="relative z-10 text-[11px] text-amber-200/90 mt-1 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{book.author}</span>
                        {book.year && <span>• ({book.year})</span>}
                      </p>
                    )}
                  </div>

                  {/* Book Details Body */}
                  <div className="p-5 space-y-3">
                    <p className="text-xs text-slate-600 dark:text-stone-300 leading-relaxed line-clamp-3">
                      {book.description || 'كتاب منهج وتطبيقات روحية للمرحلة الدراسية المحددة.'}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-stone-400 font-medium pt-1 border-t border-amber-100/60 dark:border-[#2e0f1b]">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-stone-300">
                        <FileText className="w-3.5 h-3.5 text-churchgold-600 dark:text-churchgold-400" />
                        <span>{book.pageCount || 100} صفحة</span>
                      </div>

                      <span className="text-[10px] bg-stone-100 dark:bg-[#250d18] text-slate-700 dark:text-stone-300 border border-amber-200/60 dark:border-[#3e1423] px-2 py-0.5 rounded-md font-bold">
                        {book.category === 'khedma' ? 'كتب الخدمة' : book.category === 'mahrajan' ? 'كتب المهرجان' : 'كتب تثقيفية'}
                      </span>
                    </div>

                    {/* Stage Visibility Tags on Card */}
                    <div className="pt-1 flex flex-wrap items-center gap-1 text-[10px] text-slate-500 dark:text-stone-400">
                      <span className="font-semibold">يظهر لـ:</span>
                      {stagesList.map(stg => (
                        <span key={stg} className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-[#200c17] text-slate-700 dark:text-stone-300 border border-amber-200/40">
                          {stg}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Book Actions */}
                <div className="p-3.5 bg-stone-50 dark:bg-[#250d18] border-t border-amber-200/80 dark:border-[#3e1423] flex items-center gap-2">
                  <button
                    onClick={() => onViewBook(book)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-burgundy-900 hover:bg-burgundy-950 text-white dark:text-churchgold-300 font-bold text-xs shadow-xs transition-colors cursor-pointer border border-churchgold-400/30"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>تصفح المنهج والـ PDF</span>
                  </button>

                  {/* Amin Am Quick Stage Configuration Button */}
                  {isAminAm && (
                    <button
                      onClick={() => onViewBook(book)}
                      className="p-2 rounded-xl bg-churchgold-100 dark:bg-[#341121] hover:bg-churchgold-200 text-burgundy-950 dark:text-churchgold-300 border border-churchgold-300 dark:border-[#4d1d2c] transition-colors cursor-pointer"
                      title="تخصيص مراحل الظهور (أمين الخدمة العام)"
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                  )}

                  {(book.pdfUrl || book.fileUrl) ? (
                    <a
                      href={book.pdfUrl || book.fileUrl}
                      download={book.pdfFileName || `${book.title}.pdf`}
                      className="inline-flex items-center justify-center p-2 rounded-xl bg-gradient-to-r from-churchgold-600 to-amber-600 hover:from-churchgold-700 text-burgundy-950 transition-colors shadow-2xs cursor-pointer"
                      title="تحميل ملف الـ PDF الأصلي"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  ) : (
                    <a
                      href={`data:text/plain;charset=utf-8,${encodeURIComponent(book.title + '\n\n' + book.description + '\n\n' + (book.contentSummary || ''))}`}
                      download={`${book.title}.txt`}
                      className="inline-flex items-center justify-center p-2 rounded-xl bg-stone-200 dark:bg-[#341121] hover:bg-stone-300 dark:hover:bg-[#4d1d2c] text-slate-700 dark:text-stone-300 transition-colors cursor-pointer"
                      title="تحميل ملخص نصي"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
