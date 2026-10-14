import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, Layers, Plus, Trash2, ShieldCheck, CheckCircle2, AlertCircle, 
  Sparkles, Database, Users, Download, Upload, AlertTriangle, RefreshCw, Edit3,
  UserX, ArrowUpRight, Check, Info
} from 'lucide-react';
import { getStageBadgeClass } from '../utils/themeColors';
import { ServiceDetailsEditModal } from './ServiceDetailsEditModal';
import { StageItem } from '../types';

interface ServicesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ServicesManagerModal: React.FC<ServicesManagerModalProps> = ({ isOpen, onClose }) => {
  const { 
    stagesList, addStage, deleteStage, currentUser, role,
    unassignAllServantsFromClasses, promoteAllStages,
    clearAllDatabase, resetToDefaultData, exportDatabaseJSON, importDatabaseJSON,
    children, servants, supervisors, books, attendance,
    assignServantRole
  } = useApp();

  const [activeTab, setActiveTab] = useState<'services' | 'database'>('services');

  // New Service Form
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newSupervisorName, setNewSupervisorName] = useState('');
  const [newSupervisorPhone, setNewSupervisorPhone] = useState('');
  const [newSupervisorServantId, setNewSupervisorServantId] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Operations confirmation dialog states
  const [showUnassignConfirm, setShowUnassignConfirm] = useState(false);
  const [showPromoteConfirm, setShowPromoteConfirm] = useState(false);
  const [operationReport, setOperationReport] = useState<{
    title: string;
    description: string;
    details?: string[];
  } | null>(null);

  // Clear Database confirmation state
  const [confirmClearText, setConfirmClearText] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Import JSON state
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Selected stage for full editing and viewing details
  const [selectedStageToEdit, setSelectedStageToEdit] = useState<StageItem | null>(null);

  if (!isOpen) return null;

  // Only General Secretary (أمين الخدمة العام) has access to modify services & wipe database
  if (role !== 'amin_khedma_am') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="bg-white dark:bg-[#1a0a12] border border-amber-200/80 dark:border-[#3e1423] rounded-3xl max-w-md w-full p-6 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-stone-100">صلاحية مقتصرة</h3>
          <p className="text-xs text-slate-600 dark:text-stone-400">
            تعديل وإضافة الخدمات والمراحل وإدارة قاعدة البيانات مقتصرة فقط على حساب أمين الخدمة العام.
          </p>
          <button onClick={onClose} className="px-5 py-2 bg-burgundy-900 text-amber-50 rounded-xl text-xs font-bold cursor-pointer">
            إغلاق
          </button>
        </div>
      </div>
    );
  }

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const name = newServiceName.trim();
    if (!name) {
      setErrorMsg('يرجى كتابة اسم الخدمة أو المرحلة');
      return;
    }

    if (stagesList.some(s => s.name === name)) {
      setErrorMsg('هذه الخدمة موجودة بالفعل');
      return;
    }

    addStage(name, newServiceDesc.trim(), newSupervisorName.trim(), newSupervisorPhone.trim());
    if (newSupervisorServantId) {
      assignServantRole(newSupervisorServantId, name, 'captain', `أمين مرحلة (${name})`);
    }
    setSuccessMsg(`تمت إضافة خدمة "${name}" وترقية أمينها بنجاح!`);
    setNewServiceName('');
    setNewServiceDesc('');
    setNewSupervisorName('');
    setNewSupervisorPhone('');
    setNewSupervisorServantId('');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleUnassignServants = () => {
    const res = unassignAllServantsFromClasses();
    setShowUnassignConfirm(false);
    setOperationReport({
      title: '✅ تم تفريغ الفصول وتحويل الخدام إلى خدام عام',
      description: `تم بنجاح إلغاء توزيع الخدام من الفصول للعام الجديد، وتحويل ${res.servantsUpdated} خادم و ${res.supervisorsUpdated} أمين فصل لصفة (خادم عام بدون فصول)، مع الحفاظ الكامل على كافة بياناتهم وتليفوناتهم، وتفريغ ${res.classesCleared} مرحلة وفصل لاستقبال التوزيع الجديد.`,
      details: [
        `عدد الخدام المحولين لخدمة عامة: ${res.servantsUpdated}`,
        `عدد الأمناء المحولين لخدمة عامة: ${res.supervisorsUpdated}`,
        `عدد الفصول والمراحل التي تم إخلاؤها: ${res.classesCleared}`
      ]
    });
  };

  const handlePromoteStages = () => {
    const res = promoteAllStages();
    setShowPromoteConfirm(false);

    const detailLines = Object.entries(res.details).map(([transition, count]) => {
      return `${transition}: ${count} مخدوم`;
    });

    setOperationReport({
      title: '🚀 تم تصعيد وترحيل كافة المراحل بنجاح!',
      description: `تم تصعيد ${res.promotedCount} ولد وبنت للمراحل التالية للعام الجديد، مع تخريج ${res.graduationCount} لمرحلة الشباب والخريجين. السن يتم احتسابه ديناميكياً بدقة طبقاً لتاريخ ميلاد كل مخدوم.`,
      details: detailLines.length > 0 ? detailLines : ['جميع المخدومين في المراحل الحالية']
    });
  };

  const handleClearAllConfirmed = () => {
    if (confirmClearText.trim() === 'مسح الكل') {
      clearAllDatabase();
      setShowClearConfirm(false);
      setConfirmClearText('');
      setSuccessMsg('تم مسح وتصفير قاعدة البيانات بالكامل مع الإبقاء على حسابك للدخول.');
      setTimeout(() => setSuccessMsg(null), 5000);
    }
  };

  const handleExportJSON = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `church_database_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSuccessMsg('تم تنزيل النسخة الاحتياطية بنجاح!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const res = importDatabaseJSON(content);
      if (res.success) {
        setImportStatus('✅ تم استيراد واسترجاع قاعدة البيانات بنجاح!');
        setTimeout(() => setImportStatus(null), 4000);
      } else {
        setImportStatus(`❌ خطأ في الاستيراد: ${res.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#1a0a12] rounded-3xl max-w-3xl w-full shadow-2xl border border-amber-200/80 dark:border-[#3e1423] overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-4 max-h-[92vh] flex flex-col transition-colors duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-950 p-5 text-white flex items-center justify-between shrink-0 border-b border-churchgold-400/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-churchgold-600 to-amber-500 text-burgundy-950 shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-amber-50">إدارة الخدمات وقاعدة البيانات والمراحل</h3>
              <p className="text-xs text-churchgold-300">خاص بأمين الخدمة العام • تفريغ الفصول وتصعيد المراحل</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-amber-200/80 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="px-6 pt-4 bg-stone-50 dark:bg-[#250d18] border-b border-amber-200/80 dark:border-[#3e1423] flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('services')}
            className={`pb-2.5 px-3 font-bold text-xs border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'services'
                ? 'border-churchgold-500 text-burgundy-900 dark:text-churchgold-300'
                : 'border-transparent text-slate-500 dark:text-stone-400 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>قائمة الفصول والخدمات ({stagesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`pb-2.5 px-3 font-bold text-xs border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'database'
                ? 'border-churchgold-500 text-burgundy-900 dark:text-churchgold-300'
                : 'border-transparent text-slate-500 dark:text-stone-400 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>إجراءات العام الجديد والبيانات</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {importStatus && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-[#341121] border border-amber-300 dark:border-[#4d1d2c] text-slate-900 dark:text-churchgold-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <span>{importStatus}</span>
            </div>
          )}

          {/* Operation Report Dialog */}
          {operationReport && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/60 dark:to-teal-950/60 border-2 border-emerald-400 dark:border-emerald-700 space-y-3 shadow-md animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{operationReport.title}</span>
                </h4>
                <button
                  onClick={() => setOperationReport(null)}
                  className="p-1 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
                {operationReport.description}
              </p>

              {operationReport.details && operationReport.details.length > 0 && (
                <div className="p-3 rounded-xl bg-white/80 dark:bg-[#1a0812] border border-emerald-200 dark:border-emerald-900 text-xs space-y-1">
                  <div className="font-bold text-slate-900 dark:text-stone-100 mb-1">تفاصيل التنفيذ:</div>
                  {operationReport.details.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-stone-300 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'services' ? (
            /* Services & Stages Tab */
            <div className="space-y-5">
              {/* Add New Service Card */}
              <form onSubmit={handleAddService} className="p-4 rounded-2xl bg-stone-50 dark:bg-[#200a14] border border-amber-200/80 dark:border-[#381622] space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-stone-100">
                  <Plus className="w-4 h-4 text-churchgold-600" />
                  <span>إضافة خدمة أو مرحلة جديدة</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-stone-300 mb-1">
                      اسم الخدمة أو الفصل *
                    </label>
                    <input
                      type="text"
                      required
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      placeholder="مثال: شباب وخريجين، كشافة، كورال..."
                      className="w-full bg-white dark:bg-[#280c18] border border-amber-200/80 dark:border-[#4d1f2e] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-2.5 p-3.5 rounded-2xl bg-amber-50/80 dark:bg-[#280c18] border-2 border-amber-300 dark:border-[#4d1f2e]">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black text-burgundy-950 dark:text-churchgold-200">
                        أمين الخدمة / أمين الفصل (بدل ما تكتب اختر الخادم لترقيته) 👑
                      </label>
                      <span className="text-[10px] text-churchgold-700 dark:text-churchgold-400 font-bold">
                        ترقية واعتماد تلقائي
                      </span>
                    </div>

                    <select
                      value={newSupervisorServantId}
                      onChange={(e) => {
                        const sId = e.target.value;
                        setNewSupervisorServantId(sId);
                        const found = servants.find(s => s.id === sId);
                        if (found) {
                          setNewSupervisorName(found.name);
                          setNewSupervisorPhone(found.phone || '');
                        } else if (!sId) {
                          setNewSupervisorName('');
                          setNewSupervisorPhone('');
                        }
                      }}
                      className="w-full bg-white dark:bg-[#18080f] border-2 border-churchgold-400 dark:border-churchgold-600 rounded-xl px-3 py-2 text-xs font-black text-slate-900 dark:text-stone-100 focus:outline-none cursor-pointer shadow-xs"
                    >
                      <option value="">-- اضغط هنا لاختيار الخادم من كشف الخدام ({servants.length} خادم) --</option>
                      {servants.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} • ({s.assignedStage || 'عامة'}) {s.phone ? `• 📞 ${s.phone}` : ''}
                        </option>
                      ))}
                    </select>

                    {newSupervisorServantId ? (
                      <div className="p-2.5 bg-white dark:bg-[#180710] rounded-xl border border-emerald-400 dark:border-emerald-700 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-stone-100 animate-in fade-in">
                        <div className="flex items-center gap-2">
                          <span className="text-base">👑</span>
                          <span>{newSupervisorName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({newSupervisorPhone || 'بدون تليفون'})</span>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300">
                            سيتم ترقيته كـ أمين الفصل ✓
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setNewSupervisorServantId('');
                            setNewSupervisorName('');
                            setNewSupervisorPhone('');
                          }}
                          className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                        <input
                          type="text"
                          value={newSupervisorName}
                          onChange={(e) => setNewSupervisorName(e.target.value)}
                          placeholder="أو اكتب اسم أمين الخدمة يدوياً..."
                          className="bg-white dark:bg-[#18080f] border border-stone-200 dark:border-[#381120] rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-stone-100 focus:outline-none"
                        />
                        <input
                          type="tel"
                          value={newSupervisorPhone}
                          onChange={(e) => setNewSupervisorPhone(e.target.value)}
                          placeholder="رقم تليفون أمين الخدمة..."
                          className="bg-white dark:bg-[#18080f] border border-stone-200 dark:border-[#381120] rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-stone-100 focus:outline-none"
                          dir="ltr"
                        />
                      </div>
                    )}
                  </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-stone-300 mb-1">
                    وصف الخدمة أو الفئة العمرية
                  </label>
                  <input
                    type="text"
                    value={newServiceDesc}
                    onChange={(e) => setNewServiceDesc(e.target.value)}
                    placeholder="مثال: المرحلة الجامعية وما بعدها..."
                    className="w-full bg-white dark:bg-[#280c18] border border-amber-200/80 dark:border-[#4d1f2e] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>
              </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-churchgold-600 to-amber-600 hover:from-churchgold-700 hover:to-amber-700 text-burgundy-950 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة الخدمة للمنظومة</span>
                  </button>
                </div>
              </form>

              {/* Existing Services List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-stone-300 px-1">
                  <span>الخدمات والمراحل الحالية ({stagesList.length}):</span>
                  <span className="text-[11px] text-slate-400 font-normal">اضغط على أي خدمة لتعديلها وتحديد المساعدين</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {stagesList.map((stage) => {
                    const stageKids = children.filter(c => c.stage === stage.name).length;
                    const stageServants = servants.filter(s => s.assignedStage === stage.name).length;
                    const assistantsCount = stage.assistantSupervisors?.length || 0;

                    return (
                      <div
                        key={stage.id || stage.name}
                        onClick={() => setSelectedStageToEdit(stage)}
                        className="p-3.5 rounded-2xl bg-white dark:bg-[#240b17] border border-amber-200/80 dark:border-[#3e1423] hover:border-churchgold-500/60 dark:hover:border-churchgold-500/60 transition-all cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-black text-slate-900 dark:text-stone-100 text-sm group-hover:text-burgundy-900 dark:group-hover:text-churchgold-300 transition-colors">
                              {stage.name}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStageBadgeClass(stage.name)}`}>
                              {stage.isCustom ? 'خدمة مضافة' : 'أساسية'}
                            </span>
                          </div>

                          {stage.description && (
                            <p className="text-[11px] text-slate-500 dark:text-stone-400 mt-1 line-clamp-1">
                              {stage.description}
                            </p>
                          )}

                          <div className="mt-2.5 pt-2 border-t border-amber-100 dark:border-[#35121e] text-[11px] text-slate-600 dark:text-stone-300 space-y-1">
                            {stage.supervisorName ? (
                              <div className="flex items-center gap-1.5 font-bold">
                                <span className="text-churchgold-600">👤 أمين الخدمة:</span>
                                <span>{stage.supervisorName}</span>
                              </div>
                            ) : (
                              <div className="text-slate-400 text-[10px]">لم يتم تحديد أمين خدمة بعد</div>
                            )}

                            {assistantsCount > 0 && (
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-stone-400 text-[10px]">
                                <span className="text-amber-600">👥 المساعدين:</span>
                                <span>{assistantsCount} مساعد أمين خدمة</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-amber-100/60 dark:border-[#35121e] flex items-center justify-between text-[10px] text-slate-500 dark:text-stone-400">
                          <div className="flex items-center gap-2">
                            <span>👦 {stageKids} مخدوم</span>
                            <span>•</span>
                            <span>✝️ {stageServants} خادم</span>
                          </div>

                          <span className="text-churchgold-600 font-bold group-hover:underline flex items-center gap-0.5">
                            <Edit3 className="w-3 h-3" />
                            تعديل وتفاصيل
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            /* Database & Annual Maintenance Tab */
            <div className="space-y-6">
              
              {/* Database Overview Numbers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-[#250d18] border border-amber-200/80 dark:border-[#3e1423]">
                  <div className="text-xl font-black text-burgundy-900 dark:text-churchgold-300">{children.length}</div>
                  <div className="text-[10px] font-bold text-slate-600 dark:text-stone-400">مخدوم (أولاد)</div>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-[#250d18] border border-amber-200/80 dark:border-[#3e1423]">
                  <div className="text-xl font-black text-burgundy-900 dark:text-churchgold-300">{servants.length}</div>
                  <div className="text-[10px] font-bold text-slate-600 dark:text-stone-400">خادم وخادمة</div>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-[#250d18] border border-amber-200/80 dark:border-[#3e1423]">
                  <div className="text-xl font-black text-burgundy-900 dark:text-churchgold-300">{supervisors.length}</div>
                  <div className="text-[10px] font-bold text-slate-600 dark:text-stone-400">أمين مرحلة وفصل</div>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-[#250d18] border border-amber-200/80 dark:border-[#3e1423]">
                  <div className="text-xl font-black text-burgundy-900 dark:text-churchgold-300">{attendance.length}</div>
                  <div className="text-[10px] font-bold text-slate-600 dark:text-stone-400">سجل حضور كامل</div>
                </div>
              </div>

              {/* ANNUAL CHURCH MAINTENANCE ACTIONS (REQUESTED BY USER) */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50/90 via-churchgold-50/40 to-amber-100/60 dark:from-[#290e1c] dark:via-[#210915] dark:to-[#331122] border-2 border-churchgold-400/60 space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-churchgold-500 text-burgundy-950 font-black">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-burgundy-950 dark:text-churchgold-200">
                      إجراءات بداية العام الخدمي والدراسي الجديد
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-stone-400">
                      أزرار دورية لنقل المخدومين وإعادة توزيع الخدام مع بداية كل سنة خدمة جديدة
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Action 1: Promotion Button */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#1a0811] border border-amber-200/90 dark:border-[#421626] flex flex-col justify-between space-y-3 shadow-2xs">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-black text-burgundy-900 dark:text-churchgold-300">
                        <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>🚀 تصعيد وترحيل كافة المراحل للعام الجديد</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-stone-400 leading-relaxed mt-1.5">
                        ينقل كل مرحلة تلقائياً للمرحلة التي تليها (مثلاً ثانية ابتدائي ⬅️ ثالثة ابتدائي، وسادسة ابتدائي ⬅️ إعدادي، وهكذا). ويتم احتساب السن بدقة طبقاً لتاريخ الميلاد الفعلي.
                      </p>
                    </div>

                    {!showPromoteConfirm ? (
                      <button
                        onClick={() => setShowPromoteConfirm(true)}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                        <span>بدء تصعيد المراحل للعام الجديد</span>
                      </button>
                    ) : (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-300 dark:border-emerald-800 space-y-2">
                        <div className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200">
                          هل أنت متأكد من ترحيل جميع الأولاد للمراحل التالية؟
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handlePromoteStages}
                            className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-black cursor-pointer shadow-2xs"
                          >
                            تأكيد التصعيد الآن
                          </button>
                          <button
                            onClick={() => setShowPromoteConfirm(false)}
                            className="px-3 py-1.5 bg-stone-200 dark:bg-[#341121] text-slate-700 dark:text-stone-300 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action 2: Unassign Servants Button */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#1a0811] border border-amber-200/90 dark:border-[#421626] flex flex-col justify-between space-y-3 shadow-2xs">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-black text-burgundy-900 dark:text-churchgold-300">
                        <UserX className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>🔄 إخلاء الفصول وتحويل الخدام لخدام عام</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-stone-400 leading-relaxed mt-1.5">
                        يلغي إسناد الخدام وأمناء الفصول من كافة الفصول وتفريغها لإجراء التوزيع الجديد، مع تحويل صفتهم إلى (خادم عام) والحفاظ الكامل على بياناتهم وتليفوناتهم دون مسحها.
                      </p>
                    </div>

                    {!showUnassignConfirm ? (
                      <button
                        onClick={() => setShowUnassignConfirm(true)}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                      >
                        <UserX className="w-4 h-4" />
                        <span>إلغاء توزيع الخدام وتفريغ الفصول</span>
                      </button>
                    ) : (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-xl border border-amber-300 dark:border-amber-800 space-y-2">
                        <div className="text-[11px] font-bold text-amber-900 dark:text-churchgold-200">
                          سيتم تحويل كافة الخدام والآمناء لخدام عام وتفريغ الفصول دون مسح بياناتهم. تأكيد؟
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleUnassignServants}
                            className="flex-1 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-black cursor-pointer shadow-2xs"
                          >
                            تأكيد الإخلاء والتفريغ
                          </button>
                          <button
                            onClick={() => setShowUnassignConfirm(false)}
                            className="px-3 py-1.5 bg-stone-200 dark:bg-[#341121] text-slate-700 dark:text-stone-300 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Backup & Restore */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#200a14] border border-amber-200/80 dark:border-[#381622] space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-stone-100">
                  <Database className="w-4 h-4 text-churchgold-500" />
                  <span>تصدير واستيراد قاعدة البيانات (ملف JSON)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-stone-400 leading-relaxed">
                  يمكنك تحميل نسخة احتياطية من كل بيانات الكنيسة في أي وقت كملف <span className="font-mono font-bold text-burgundy-800 dark:text-churchgold-300">.json</span> وحفظه على جهازك، أو استيراد ملف سابق لنقل البيانات بسهولة بين الأجهزة.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleExportJSON}
                    className="px-4 py-2 bg-burgundy-900 hover:bg-burgundy-950 text-churchgold-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs border border-churchgold-400/30"
                  >
                    <Download className="w-4 h-4" />
                    <span>تنزيل ملف النسخة الاحتياطية (Export)</span>
                  </button>

                  <label className="px-4 py-2 bg-stone-200 dark:bg-[#341121] hover:bg-stone-300 dark:hover:bg-[#43172b] text-slate-800 dark:text-stone-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-amber-200/60 dark:border-[#4d1f2e]">
                    <Upload className="w-4 h-4 text-churchgold-500" />
                    <span>استيراد ملف قاعدة بيانات (Import)</span>
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={handleImportFile} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* Danger Zone: Clear All Database (Exclusive to Admin) */}
              <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border-2 border-rose-300 dark:border-rose-900/60 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-rose-900 dark:text-rose-300">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>منطقة تحكم حذرة: مسح وتصفير قاعدة البيانات بالكامل</span>
                </div>
                
                <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                  هذا الخيار يمسح جميع الأولاد والخدام وسجلات الحضور من المتصفح بالكامل، مع الحفاظ فقط على حسابك للدخول.
                </p>

                {!showClearConfirm ? (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>بدء إجراء مسح كل البيانات</span>
                  </button>
                ) : (
                  <div className="p-3 bg-white dark:bg-[#1a070e] rounded-xl border border-rose-400 space-y-2.5">
                    <p className="text-[11px] font-bold text-rose-700 dark:text-rose-300">
                      للتأكيد النهائي، اكتب بالأسفل كلمة <span className="underline font-black text-rose-900 dark:text-rose-100">مسح الكل</span>:
                    </p>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text"
                        value={confirmClearText}
                        onChange={(e) => setConfirmClearText(e.target.value)}
                        placeholder="مسح الكل"
                        className="bg-stone-50 dark:bg-[#280c18] border border-rose-300 dark:border-rose-800 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                      <button
                        onClick={handleClearAllConfirmed}
                        disabled={confirmClearText.trim() !== 'مسح الكل'}
                        className="px-4 py-1.5 bg-rose-700 disabled:opacity-40 text-white rounded-lg text-xs font-black cursor-pointer disabled:cursor-not-allowed"
                      >
                        تأكيد المسح الكلي
                      </button>
                      <button
                        onClick={() => {
                          setShowClearConfirm(false);
                          setConfirmClearText('');
                        }}
                        className="px-3 py-1.5 bg-stone-200 dark:bg-[#341121] text-slate-700 dark:text-stone-300 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Reset to Default Seed Data */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-stone-400 border-t border-amber-100 dark:border-[#381622]">
                <span>تريد استرجاع النماذج الأولية للتجربة؟</span>
                <button
                  onClick={() => {
                    if (confirm('هل ترغب في إعادة ضبط المنظومة للبيانات الافتراضية؟')) {
                      resetToDefaultData();
                      setSuccessMsg('تمت استعادة البيانات الافتراضية بنجاح.');
                    }
                  }}
                  className="flex items-center gap-1.5 text-burgundy-800 dark:text-churchgold-400 hover:underline font-bold cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>استعادة البيانات الافتراضية</span>
                </button>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Service Details & Edit Modal */}
      <ServiceDetailsEditModal
        isOpen={!!selectedStageToEdit}
        onClose={() => setSelectedStageToEdit(null)}
        stage={selectedStageToEdit}
      />
    </div>
  );
};
