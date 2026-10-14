import React, { useState, useRef, useEffect } from 'react';
import { Book, BookCategory, Stage } from '../types';
import { useApp } from '../context/AppContext';
import { 
  X, BookOpen, Download, FileText, Bookmark, 
  Upload, Image as ImageIcon, FileCheck, CheckCircle2, Eye, ShieldCheck, Check
} from 'lucide-react';
import { getStageBadgeClass } from '../utils/themeColors';

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookToView?: Book | null;
  onAddBook?: (book: Omit<Book, 'id'>) => void;
  onUpdateBook?: (id: string, updated: Partial<Book>) => void;
}

export const BookModal: React.FC<BookModalProps> = ({
  isOpen,
  onClose,
  bookToView,
  onAddBook,
  onUpdateBook
}) => {
  const { role, stagesList } = useApp();

  if (!isOpen) return null;

  const isViewMode = !!bookToView;
  const isAminAm = role === 'amin_khedma_am';

  // All available stages for selection (including 'عامة')
  const availableStages: Stage[] = [
    'عامة',
    ...stagesList.map(s => s.name).filter(n => n !== 'عامة')
  ];

  // File Inputs Refs
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // State for stages
  const [selectedStages, setSelectedStages] = useState<Stage[]>(() => {
    if (bookToView?.targetStages && bookToView.targetStages.length > 0) {
      return bookToView.targetStages;
    }
    if (bookToView?.targetStage) {
      return [bookToView.targetStage];
    }
    return ['عامة'];
  });

  // State for Add Mode
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<BookCategory>('khedma');
  const [author, setAuthor] = useState('اللجنة الإيبارشية لمدارس الأحد');
  const [year, setYear] = useState('2026');
  const [description, setDescription] = useState('');
  const [contentSummary, setContentSummary] = useState('');
  const [pageCount, setPageCount] = useState<number>(100);

  // Sync state when bookToView changes
  useEffect(() => {
    if (bookToView) {
      if (bookToView.targetStages && bookToView.targetStages.length > 0) {
        setSelectedStages(bookToView.targetStages);
      } else if (bookToView.targetStage) {
        setSelectedStages([bookToView.targetStage]);
      } else {
        setSelectedStages(['عامة']);
      }
    }
  }, [bookToView]);

  // Save feedback state
  const [stagesSavedMessage, setStagesSavedMessage] = useState(false);

  // Uploaded Files State
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);
  const [pdfFileName, setPdfFileName] = useState<string | undefined>(undefined);
  const [pdfFileSize, setPdfFileSize] = useState<string | undefined>(undefined);
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);

  // PDF Modal Embedded View State
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  // Handle stage toggling
  const handleToggleStage = (stg: Stage) => {
    setSelectedStages(prev => {
      if (prev.includes(stg)) {
        if (prev.length === 1) return prev; // Keep at least one stage
        return prev.filter(s => s !== stg);
      } else {
        return [...prev, stg];
      }
    });
  };

  const handleSelectAllStages = () => {
    setSelectedStages([...availableStages]);
  };

  const handleSelectGeneralOnly = () => {
    setSelectedStages(['عامة']);
  };

  // Handle saving modified stages in View Mode (Amin Am only)
  const handleSaveStagesForBook = () => {
    if (!bookToView || !onUpdateBook) return;
    onUpdateBook(bookToView.id, {
      targetStages: selectedStages,
      targetStage: selectedStages[0] || 'عامة'
    });
    setStagesSavedMessage(true);
    setTimeout(() => setStagesSavedMessage(false), 3000);
  };

  // Handle PDF File Select
  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('يرجى اختيار ملف بصيغة PDF فقط');
      return;
    }

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    setPdfFileName(file.name);
    setPdfFileSize(`${sizeInMb} ميجابايت`);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPdfUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Cover Image Select
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCoverImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Submit New Book
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !onAddBook) return;

    onAddBook({
      title,
      category,
      targetStage: selectedStages[0] || 'عامة',
      targetStages: selectedStages.length > 0 ? selectedStages : ['عامة'],
      author,
      year,
      description,
      contentSummary,
      pageCount: Number(pageCount) || 100,
      pdfUrl,
      pdfFileName,
      pdfFileSize,
      coverImage
    });

    onClose();
  };

  const getCategoryLabel = (cat: BookCategory) => {
    switch (cat) {
      case 'khedma': return 'كتب التحضير والخدمة';
      case 'mahrajan': return 'كتب المهرجان';
      case 'aqeda_taqs': return 'العقيدة والطقس';
      case 'bible': return 'الكتاب المقدس';
      default: return 'عام';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#1a0a12] rounded-3xl max-w-2xl w-full shadow-2xl border border-amber-200/80 dark:border-[#3e1423] overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-4 max-h-[90vh] flex flex-col transition-colors duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-950 p-4 sm:p-5 text-white flex items-center justify-between shrink-0 border-b border-churchgold-400/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-churchgold-600 to-amber-500 text-burgundy-950 rounded-xl shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-amber-50">
                {isViewMode ? bookToView.title : 'إضافة كتاب أو منهج PDF للمكتبة'}
              </h3>
              <p className="text-[11px] text-churchgold-300">
                {isViewMode ? 'عرض وتصفح تفاصيل الكتاب والمراحل المتاح لها' : 'حدد عنوان الكتاب، القسم، والمراحل التي يظهر لها (يمكن اختيار أكثر من مرحلة)'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-amber-200/80 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode */}
        {isViewMode ? (
          <div className="p-6 space-y-5 text-xs text-slate-700 dark:text-stone-300 max-h-[80vh] overflow-y-auto">
            
            {/* Book Cover Header Banner */}
            <div className={`rounded-2xl overflow-hidden relative shadow-md ${bookToView.coverImage ? 'bg-slate-900' : `bg-gradient-to-r ${bookToView.coverBg || 'from-burgundy-900 to-burgundy-950'}`} text-white p-6 border border-churchgold-400/20`}>
              {bookToView.coverImage && (
                <div className="absolute inset-0 opacity-30 bg-cover bg-center pointer-events-none" style={{ backgroundImage: `url(${bookToView.coverImage})` }} />
              )}
              <div className="relative z-10 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-amber-200 text-[11px] font-bold border border-white/10">
                    {getCategoryLabel(bookToView.category)}
                  </span>
                  {(bookToView.targetStages || [bookToView.targetStage || 'عامة']).map(stg => (
                    <span key={stg} className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getStageBadgeClass(stg)}`}>
                      {stg}
                    </span>
                  ))}
                </div>

                <h2 className="text-xl sm:text-2xl font-black leading-snug text-amber-50">{bookToView.title}</h2>
                
                <div className="flex items-center gap-3 text-xs text-amber-200/80 font-medium">
                  {bookToView.author && <span>المؤلف: {bookToView.author}</span>}
                  {bookToView.year && <span>• إصدار {bookToView.year}</span>}
                  {bookToView.pageCount && <span>• {bookToView.pageCount} صفحة</span>}
                </div>
              </div>
            </div>

            {/* Stage Visibility Configuration Box (General Secretary Amin Am Only) */}
            <div className="bg-stone-50 dark:bg-[#250d18] p-4 rounded-2xl border border-amber-200/80 dark:border-[#3e1423] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-churchgold-600 dark:text-churchgold-400" />
                  <span className="font-bold text-slate-900 dark:text-stone-100 text-xs">
                    مراحل ظهور هذا الكتاب:
                  </span>
                </div>
                {isAminAm ? (
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800">
                    صلاحية أمين الخدمة العام (تحكم متعدد)
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 dark:text-stone-400">
                    محدد بواسطة أمين الخدمة العام
                  </span>
                )}
              </div>

              {isAminAm ? (
                <div className="space-y-3 pt-1 border-t border-amber-100 dark:border-[#3a1324]">
                  <p className="text-[11px] text-slate-600 dark:text-stone-400">
                    اضغط على أي مرحلة لتفعيل أو إلغاء ظهور الكتاب لها (يمكن اختياره لأكثر من مرحلة في نفس الوقت):
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {availableStages.map(stg => {
                      const isSelected = selectedStages.includes(stg);
                      return (
                        <button
                          key={stg}
                          type="button"
                          onClick={() => handleToggleStage(stg)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                            isSelected
                              ? 'bg-churchgold-600 text-burgundy-950 border-churchgold-500 shadow-xs font-black'
                              : 'bg-white dark:bg-[#1a0a12] text-slate-600 dark:text-stone-300 border-amber-200/80 dark:border-[#4d1d2c] hover:bg-amber-50'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-burgundy-950" />}
                          <span>{stg}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllStages}
                        className="px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-[#341121] text-slate-700 dark:text-stone-200 text-[10px] font-bold hover:bg-stone-300 cursor-pointer"
                      >
                        اختيار كل المراحل
                      </button>
                      <button
                        type="button"
                        onClick={handleSelectGeneralOnly}
                        className="px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-[#341121] text-slate-700 dark:text-stone-200 text-[10px] font-bold hover:bg-stone-300 cursor-pointer"
                      >
                        عامة فقط
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveStagesForBook}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 text-white font-black text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>حفظ تعديل المراحل</span>
                    </button>
                  </div>

                  {stagesSavedMessage && (
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold text-center animate-in fade-in">
                      ✅ تم حفظ مراحل ظهور الكتاب بنجاح وتحديث ظهوره للمراحل المحددة!
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {(bookToView.targetStages || [bookToView.targetStage || 'عامة']).map(stg => (
                    <span key={stg} className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStageBadgeClass(stg)}`}>
                      {stg}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            {bookToView.description && (
              <div className="space-y-1.5 bg-stone-50 dark:bg-[#250d18] p-4 rounded-2xl border border-amber-200/80 dark:border-[#3e1423]">
                <h4 className="font-bold text-slate-900 dark:text-stone-100 text-xs flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-churchgold-600 dark:text-churchgold-400" />
                  <span>عن الكتاب والمنهج:</span>
                </h4>
                <p className="text-slate-600 dark:text-stone-300 leading-relaxed text-xs">{bookToView.description}</p>
              </div>
            )}

            {/* Content Summary */}
            {bookToView.contentSummary && (
              <div className="space-y-2 bg-stone-50 dark:bg-[#250d18] p-4 rounded-2xl border border-amber-200/80 dark:border-[#3e1423]">
                <h4 className="font-bold text-slate-900 dark:text-stone-100 text-xs flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-churchgold-600 dark:text-churchgold-400" />
                  <span>فصول ومحتوى الدروس:</span>
                </h4>
                <div className="whitespace-pre-line text-xs font-medium text-slate-700 dark:text-stone-300 leading-relaxed bg-white dark:bg-[#1f0a14] p-3 rounded-xl border border-amber-200/60 dark:border-[#4d1d2c]">
                  {bookToView.contentSummary}
                </div>
              </div>
            )}

            {/* PDF Attachment Box */}
            {(bookToView.pdfUrl || bookToView.fileUrl) ? (
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-[#250d18] border border-amber-200/80 dark:border-[#3e1423] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-burgundy-900 text-churchgold-300 rounded-xl shadow-xs border border-churchgold-400/30">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-stone-100 text-xs">
                      {bookToView.pdfFileName || 'ملف الـ PDF المرفق للكتاب'}
                    </h5>
                    <p className="text-[11px] text-slate-600 dark:text-stone-400">يمكنك قراءة وتصفح أو تحميل الكتاب كاملاً بصيغة PDF</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowPdfViewer(true)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-burgundy-900 hover:bg-burgundy-950 text-white dark:text-churchgold-300 font-bold text-xs transition-colors shadow-xs cursor-pointer border border-churchgold-400/30"
                  >
                    <Eye className="w-4 h-4" />
                    <span>تصفح PDF</span>
                  </button>

                  <a
                    href={bookToView.pdfUrl || bookToView.fileUrl}
                    download={bookToView.pdfFileName || `${bookToView.title}.pdf`}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-churchgold-600 to-amber-600 hover:from-churchgold-700 text-burgundy-950 font-black text-xs transition-all shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل PDF</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-stone-100 dark:bg-[#250d18] text-center space-y-1 border border-dashed border-amber-200 dark:border-[#3e1423]">
                <p className="font-bold text-xs text-slate-700 dark:text-stone-300">لم يتم إرفاق ملف PDF رقمي لهذا الكتاب بعد.</p>
                <p className="text-[11px] text-slate-500 dark:text-stone-400">يمكن لأمين الخدمة العام رفع وتعديل ملف الـ PDF لاحقاً.</p>
              </div>
            )}

            {/* Embedded PDF Viewer Modal */}
            {showPdfViewer && (bookToView.pdfUrl || bookToView.fileUrl) && (
              <div className="fixed inset-0 z-60 bg-black/80 flex flex-col p-3 sm:p-6 animate-in fade-in">
                <div className="bg-burgundy-950 text-white p-3 rounded-t-2xl flex items-center justify-between border-b border-churchgold-400/30">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-churchgold-300" />
                    <span className="font-bold text-xs">{bookToView.title} (PDF)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={bookToView.pdfUrl || bookToView.fileUrl}
                      download={bookToView.pdfFileName || `${bookToView.title}.pdf`}
                      className="px-3 py-1 rounded-lg bg-churchgold-600 text-burgundy-950 text-xs font-bold hover:bg-churchgold-500 cursor-pointer flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل</span>
                    </a>
                    <button
                      onClick={() => setShowPdfViewer(false)}
                      className="p-1 hover:bg-white/10 rounded-lg text-white cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 bg-white rounded-b-2xl overflow-hidden shadow-2xl">
                  <iframe
                    src={bookToView.pdfUrl || bookToView.fileUrl}
                    title={bookToView.title}
                    className="w-full h-full border-none"
                  />
                </div>
              </div>
            )}

          </div>
        ) : (
          /* Add Book Form Mode (Amin Am Only) */
          <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
            
            {/* Title */}
            <div>
              <label className="block font-bold mb-1 text-slate-800 dark:text-stone-200">عنوان الكتاب أو اسم المنهج *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: كتاب مهرجان الكرازة 2026 - دروس الطقس والعقيدة"
                className="w-full bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block font-bold mb-1 text-slate-800 dark:text-stone-200">قسم وتصنيف الكتاب *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BookCategory)}
                className="w-full bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-3 py-2.5 font-bold text-slate-900 dark:text-stone-100 focus:outline-none"
              >
                <option value="khedma">📚 كتب التحضير ودليل الخادم</option>
                <option value="mahrajan">✨ كتب ومسابقات المهرجان</option>
                <option value="aqeda_taqs">⛪ كتب العقيدة والطقس والصلوات</option>
                <option value="bible">📖 دراسات الكتاب المقدس والتفسير</option>
              </select>
            </div>

            {/* Multi-Stage Selector (Exclusive for General Secretary) */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#250d18] border border-amber-200/80 dark:border-[#3e1423] space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-900 dark:text-stone-100 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-churchgold-600 dark:text-churchgold-400" />
                  <span>تحديد المراحل التي يظهر لها هذا الكتاب *</span>
                </label>
                <span className="text-[10px] bg-churchgold-100 dark:bg-[#341121] text-churchgold-950 dark:text-churchgold-300 px-2 py-0.5 rounded font-bold border border-churchgold-300 dark:border-[#4d1d2c]">
                  يمكن اختيار أكثر من مرحلة
                </span>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-stone-400">
                اختر المراحل التي يسمح لخدامها بقراءة وتحميل هذا الكتاب. اختيار "عامة" يجعله ظاهراً لخدام العامة.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {availableStages.map(stg => {
                  const isSelected = selectedStages.includes(stg);
                  return (
                    <button
                      key={stg}
                      type="button"
                      onClick={() => handleToggleStage(stg)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isSelected
                          ? 'bg-churchgold-600 text-burgundy-950 border-churchgold-500 shadow-xs font-black'
                          : 'bg-white dark:bg-[#1a0a12] text-slate-600 dark:text-stone-300 border-amber-200/80 dark:border-[#4d1d2c] hover:bg-amber-50'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-burgundy-950" />}
                      <span>{stg}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pt-1 text-[10px]">
                <button
                  type="button"
                  onClick={handleSelectAllStages}
                  className="px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-[#341121] text-slate-700 dark:text-stone-200 font-bold hover:bg-stone-300 cursor-pointer"
                >
                  اختيار كل المراحل
                </button>
                <button
                  type="button"
                  onClick={handleSelectGeneralOnly}
                  className="px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-[#341121] text-slate-700 dark:text-stone-200 font-bold hover:bg-stone-300 cursor-pointer"
                >
                  عامة فقط
                </button>
              </div>
            </div>

            {/* PDF File Upload Box */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#250d18] border border-amber-200/80 dark:border-[#3e1423] space-y-2">
              <label className="block font-bold text-slate-900 dark:text-stone-100 text-xs flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-churchgold-600 dark:text-churchgold-400" />
                <span>رفع ملف الـ PDF الأصلي للكتاب *</span>
              </label>

              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handlePdfFileChange}
                className="hidden"
              />

              {pdfUrl ? (
                <div className="p-3 bg-white dark:bg-[#1d0913] rounded-xl border border-amber-200/80 dark:border-[#4d1d2c] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-stone-100 text-xs">{pdfFileName}</div>
                      <div className="text-[10px] text-slate-500 dark:text-stone-400">{pdfFileSize}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPdfUrl(undefined);
                      setPdfFileName(undefined);
                      setPdfFileSize(undefined);
                    }}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold cursor-pointer"
                  >
                    تغيير
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => pdfInputRef.current?.click()}
                  className="border-2 border-dashed border-amber-300 dark:border-[#4d1d2c] hover:border-amber-500 rounded-xl p-4 text-center cursor-pointer bg-white/80 dark:bg-[#1d0913] transition-all space-y-1"
                >
                  <Upload className="w-6 h-6 text-churchgold-600 dark:text-churchgold-400 mx-auto" />
                  <p className="font-bold text-slate-900 dark:text-stone-100 text-xs">اضغط هنا لاختيار ملف PDF من جهازك</p>
                  <p className="text-[11px] text-slate-500 dark:text-stone-400">يتم حفظ الملف داخل المنظومة لإمكانية قراءته وتحميله مباشرة</p>
                </div>
              )}
            </div>

            {/* Cover Image Upload Box */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#250d18] border border-amber-200/80 dark:border-[#3e1423] space-y-2">
              <label className="block font-bold text-slate-800 dark:text-stone-200 text-xs flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-churchgold-600 dark:text-churchgold-400" />
                <span>رفع صورة غلاف الكتاب (اختياري)</span>
              </label>

              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="hidden"
              />

              {coverImage ? (
                <div className="flex items-center gap-3 p-2 bg-white dark:bg-[#1d0913] rounded-xl border border-amber-200/80 dark:border-[#4d1d2c]">
                  <img src={coverImage} alt="غلاف الكتاب" className="w-12 h-16 object-cover rounded-lg shadow-2xs" />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> تم رفع صورة الغلاف
                    </span>
                    <button
                      type="button"
                      onClick={() => setCoverImage(undefined)}
                      className="text-[11px] text-rose-600 hover:underline font-bold mt-1 block cursor-pointer"
                    >
                      حذف الصورة
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="w-full py-2.5 px-3 bg-white dark:bg-[#1d0913] hover:bg-stone-50 dark:hover:bg-[#250d18] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl text-slate-700 dark:text-stone-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-churchgold-600 dark:text-churchgold-400" />
                  <span>اختر صورة غلاف (JPG, PNG)</span>
                </button>
              )}
            </div>

            {/* Author & Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-stone-200">المؤلف / الجهة المصدرة</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="مثال: أسقفية الشباب / كنيسة ماريوحنا"
                  className="w-full bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-stone-200">السنة / الإصدار</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2026"
                  className="w-full bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-stone-100"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold mb-1 text-slate-800 dark:text-stone-200">وصف الكتاب والمنهج</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="نبذة مختصرة عن هدف المنهج، النقاط الروحية، والوسائل..."
                className="w-full bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-stone-100"
              />
            </div>

            {/* Content Summary */}
            <div>
              <label className="block font-bold mb-1 text-slate-800 dark:text-stone-200">فصول الدروس وعناوين الحصص</label>
              <textarea
                rows={2}
                value={contentSummary}
                onChange={(e) => setContentSummary(e.target.value)}
                placeholder="درس 1: ... &#10;درس 2: ..."
                className="w-full bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-3 py-2 font-mono text-[11px] text-slate-800 dark:text-stone-100"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-amber-100 dark:border-[#341121]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-[#250d18] hover:bg-stone-200 dark:hover:bg-[#341121] text-slate-700 dark:text-stone-300 font-bold text-xs cursor-pointer border border-amber-200/60 dark:border-[#4d1d2c]"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-churchgold-600 to-amber-600 hover:from-churchgold-700 hover:to-amber-700 text-burgundy-950 font-black text-xs shadow-md transition-all cursor-pointer border border-churchgold-400/40"
              >
                حفظ وإضافة للمكتبة
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
