import React, { useState, useEffect } from 'react';
import { StageItem, AssistantSupervisor, Child, Servant, Supervisor } from '../types';
import { useApp } from '../context/AppContext';
import { 
  X, Layers, User, Phone, CheckCircle2, AlertCircle, Trash2, 
  Save, Users, ShieldCheck, MessageCircle, Calendar, Edit3, Plus, UserPlus, Crown
} from 'lucide-react';
import { getStageBadgeClass } from '../utils/themeColors';

interface ServiceDetailsEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: StageItem | null;
}

export const ServiceDetailsEditModal: React.FC<ServiceDetailsEditModalProps> = ({
  isOpen,
  onClose,
  stage
}) => {
  const { 
    stagesList, updateStage, deleteStage, 
    children, servants, supervisors, role,
    assignServantRole, addSupervisor
  } = useApp();

  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [supervisorPhone, setSupervisorPhone] = useState('');
  const [selectedServantId, setSelectedServantId] = useState('');
  const [supervisorInputMode, setSupervisorInputMode] = useState<'pick' | 'custom'>('pick');
  const [assistantSupervisors, setAssistantSupervisors] = useState<AssistantSupervisor[]>([]);
  const [meetingTime, setMeetingTime] = useState('');

  const [activeSubTab, setActiveSubTab] = useState<'info' | 'children' | 'servants'>('info');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (stage) {
      setServiceName(stage.name || '');
      setDescription(stage.description || '');
      setSupervisorName(stage.supervisorName || '');
      setSupervisorPhone(stage.supervisorPhone || '');
      setAssistantSupervisors(stage.assistantSupervisors ? [...stage.assistantSupervisors] : []);
      setMeetingTime(stage.meetingTime || '');
      setActiveSubTab('info');
      setSuccessMsg(null);
      setErrorMsg(null);

      // Match existing servant
      const match = servants.find(s => 
        (stage.supervisorName && s.name === stage.supervisorName) || 
        (stage.supervisorPhone && s.phone && s.phone === stage.supervisorPhone)
      );
      if (match) {
        setSelectedServantId(match.id);
      } else {
        setSelectedServantId('');
      }
      setSupervisorInputMode('pick');
    }
  }, [stage, isOpen, servants]);

  const handleAddAssistant = () => {
    setAssistantSupervisors(prev => [...prev, { name: '', phone: '' }]);
  };

  const handleUpdateAssistant = (idx: number, field: 'name' | 'phone', val: string) => {
    setAssistantSupervisors(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleRemoveAssistant = (idx: number) => {
    setAssistantSupervisors(prev => prev.filter((_, i) => i !== idx));
  };

  if (!isOpen || !stage) return null;

  // Filter children and servants belonging to this stage
  const stageChildren = children.filter(c => c.stage === stage.name);
  const stageServants = servants.filter(s => s.assignedStage === stage.name);
  const stageSupervisors = supervisors.filter(sup => sup.supervisedStage === stage.name || sup.assignedStage === stage.name);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedName = serviceName.trim();
    if (!trimmedName) {
      setErrorMsg('يرجى تحديد اسم الخدمة');
      return;
    }

    // Check if new name collides with another stage
    if (trimmedName !== stage.name && stagesList.some(s => s.id !== stage.id && s.name === trimmedName)) {
      setErrorMsg('اسم هذه الخدمة مستخدم بالفعل لخدمة أخرى');
      return;
    }

    const cleanAssistants = assistantSupervisors
      .map(a => ({ name: a.name.trim(), phone: a.phone?.trim() || '' }))
      .filter(a => a.name.length > 0);

    // 1. Update the stage record
    updateStage(stage.id, {
      name: trimmedName,
      description: description.trim(),
      supervisorName: supervisorName.trim(),
      supervisorPhone: supervisorPhone.trim(),
      assistantSupervisors: cleanAssistants,
      meetingTime: meetingTime.trim(),
    });

    // 2. Promote the selected servant to Supervisor (أمين مرحلة وفصل)
    if (selectedServantId) {
      await assignServantRole(selectedServantId, trimmedName, 'captain', `أمين مرحلة (${trimmedName})`);
    } else if (supervisorName.trim()) {
      const matchServant = servants.find(s => s.name === supervisorName.trim() || (supervisorPhone && s.phone === supervisorPhone.trim()));
      if (matchServant) {
        await assignServantRole(matchServant.id, trimmedName, 'captain', `أمين مرحلة (${trimmedName})`);
      } else {
        addSupervisor({
          name: supervisorName.trim(),
          phone: supervisorPhone.trim(),
          supervisedStage: trimmedName,
          assignedStage: trimmedName,
          isAssistant: false,
          roleType: 'supervisor',
          title: `أمين مرحلة (${trimmedName})`
        });
      }
    }

    // 3. Promote assistants if matched with servants
    for (const asst of cleanAssistants) {
      const matchAsst = servants.find(s => s.name === asst.name || (asst.phone && s.phone === asst.phone));
      if (matchAsst) {
        await assignServantRole(matchAsst.id, trimmedName, 'first_mate', `مساعد أمين مرحلة (${trimmedName})`);
      } else {
        addSupervisor({
          name: asst.name,
          phone: asst.phone || '',
          supervisedStage: trimmedName,
          assignedStage: trimmedName,
          isAssistant: true,
          roleType: 'assistant_supervisor',
          title: `مساعد أمين مرحلة (${trimmedName})`
        });
      }
    }

    setSuccessMsg(`✅ تم حفظ وتحديث بيانات الخدمة وترقية (${supervisorName || 'الأمين'}) كأمين رسمي للمرحلة بنجاح!`);
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1500);
  };

  const handleDelete = () => {
    if (stage.name === 'عامة') {
      alert('لا يمكن حذف خدمة "عامة" لأنها تخدم كافة المراحل والقطاعات.');
      return;
    }

    if (stageChildren.length > 0 || stageServants.length > 0) {
      const confirmed = confirm(
        `تنبيه: الخدمة مرتبطة بـ (${stageChildren.length}) مخدوم و (${stageServants.length}) خادم. هل أنت متأكد من حذفها؟`
      );
      if (!confirmed) return;
    } else {
      if (!confirm(`هل أنت متأكد من حذف خدمة "${stage.name}" نهائياً؟`)) return;
    }

    deleteStage(stage.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#1a0a12] rounded-3xl max-w-xl w-full shadow-2xl border border-amber-200/80 dark:border-[#3e1423] overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-4 max-h-[92vh] flex flex-col transition-colors duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-950 p-4 sm:p-5 text-white flex items-center justify-between shrink-0 border-b border-churchgold-400/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-churchgold-600 to-amber-500 text-burgundy-950 shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-amber-50">تفاصيل وتعديل بيانات الخدمة</h3>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStageBadgeClass(stage.name)}`}>
                  {stage.name}
                </span>
              </div>
              <p className="text-xs text-churchgold-300 mt-0.5">
                تعديل اسم الخدمة، أمين الخدمة، واستعراض الخدام والمخدومين
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl hover:bg-white/10 text-amber-200/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 p-3 bg-stone-50 dark:bg-[#220b16] border-b border-amber-200/60 dark:border-[#381622] gap-2 text-center shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('children')}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'children'
                ? 'bg-amber-100/80 dark:bg-[#341121] border-churchgold-400 text-burgundy-900 dark:text-churchgold-300 shadow-2xs'
                : 'bg-white dark:bg-[#1a0a12] border-amber-200/60 dark:border-[#4d1f2e] text-slate-700 dark:text-stone-300'
            }`}
          >
            <div className="text-sm font-black text-churchgold-600 dark:text-churchgold-400">{stageChildren.length}</div>
            <div className="text-[10px] text-slate-500 dark:text-stone-400">مخدوم في الخدمة (عرض القائمة)</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('servants')}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'servants'
                ? 'bg-amber-100/80 dark:bg-[#341121] border-churchgold-400 text-burgundy-900 dark:text-churchgold-300 shadow-2xs'
                : 'bg-white dark:bg-[#1a0a12] border-amber-200/60 dark:border-[#4d1f2e] text-slate-700 dark:text-stone-300'
            }`}
          >
            <div className="text-sm font-black text-churchgold-600 dark:text-churchgold-400">{stageServants.length}</div>
            <div className="text-[10px] text-slate-500 dark:text-stone-400">خادم مسجل (عرض القائمة)</div>
          </button>
        </div>

        {/* Sub Tabs Selector */}
        <div className="flex border-b border-amber-200/80 dark:border-[#381622] bg-white dark:bg-[#1a0a12] px-4 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('info')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'info'
                ? 'border-churchgold-500 text-burgundy-900 dark:text-churchgold-300'
                : 'border-transparent text-slate-500 dark:text-stone-400'
            }`}
          >
            ✏️ تعديل بيانات الخدمة وأمينها
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('children')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'children'
                ? 'border-churchgold-500 text-burgundy-900 dark:text-churchgold-300'
                : 'border-transparent text-slate-500 dark:text-stone-400'
            }`}
          >
            👦 كشف المخدومين ({stageChildren.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('servants')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'servants'
                ? 'border-churchgold-500 text-burgundy-900 dark:text-churchgold-300'
                : 'border-transparent text-slate-500 dark:text-stone-400'
            }`}
          >
            🛡️ كشف الخدام ({stageServants.length})
          </button>
        </div>

        {/* Notification Messages */}
        {successMsg && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-slate-800 dark:text-stone-200">
          
          {/* TAB 1: Edit Service Info */}
          {activeSubTab === 'info' && (
            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Service Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                  اسم الخدمة / المرحلة *
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="مثال: حضانة، ابتدائي، شباب وخريجين..."
                  className="w-full bg-stone-50 dark:bg-[#200a14] border border-amber-200/80 dark:border-[#4d1f2e] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
                  required
                />
                <p className="text-[10px] text-slate-500 dark:text-stone-400 mt-1">
                  💡 تغيير الاسم هنا يقوم بتحديث أسماء المراحل تلقائياً لكل الأولاد والخدام المرتبطين بها.
                </p>
              </div>

              {/* Service Supervisor Selection & Promotion Section (بدل ما يكتب يختار) */}
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-[#230b17] border-2 border-amber-300 dark:border-[#4d1d2c] space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-gradient-to-tr from-churchgold-600 to-amber-500 text-burgundy-950 font-black shrink-0">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-black text-burgundy-950 dark:text-churchgold-200 block">
                        أمين الخدمة / أمين الفصل ({stage.name}) 👑
                      </label>
                      <span className="text-[11px] text-churchgold-800 dark:text-churchgold-400 font-bold">
                        بدل ما تكتب: اختر الخادم من بيانات الخدام وسيتم ترقيته تلقائياً حسب موقعه ليكون أمين الفصل
                      </span>
                    </div>
                  </div>

                  {supervisorInputMode === 'custom' && (
                    <button
                      type="button"
                      onClick={() => setSupervisorInputMode('pick')}
                      className="text-xs text-burgundy-900 dark:text-churchgold-300 underline font-bold cursor-pointer shrink-0"
                    >
                      الرجوع للاختيار من كشف الخدام ➔
                    </button>
                  )}
                </div>

                {supervisorInputMode === 'pick' ? (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 dark:text-stone-200 mb-1.5">
                        اختر الخادم من الكشف لتعيينه وترقيته كـ أمين لهذا الفصل:
                      </label>
                      <select
                        value={selectedServantId}
                        onChange={(e) => {
                          const sId = e.target.value;
                          setSelectedServantId(sId);
                          const found = servants.find(s => s.id === sId);
                          if (found) {
                            setSupervisorName(found.name);
                            setSupervisorPhone(found.phone || '');
                          } else if (!sId) {
                            setSupervisorName('');
                            setSupervisorPhone('');
                          }
                        }}
                        className="w-full bg-white dark:bg-[#18080f] border-2 border-churchgold-400 dark:border-churchgold-600 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700 cursor-pointer shadow-xs"
                      >
                        <option value="">-- اضغط هنا لاختيار الخادم من كشف الخدام ({servants.length} خادم) --</option>
                        {stageServants.length > 0 && (
                          <optgroup label={`⭐ خدام مسجلين بمرحلة ${stage.name} (${stageServants.length} خادم)`}>
                            {stageServants.map(s => (
                              <option key={s.id} value={s.id}>
                                ⭐ {s.name} • ({s.roleTitle || 'خادم'}) {s.phone ? `• 📞 ${s.phone}` : ''}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        <optgroup label="باقي خدام الكنيسة">
                          {servants.filter(s => s.assignedStage !== stage.name).map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name} • ({s.assignedStage || 'عامة'}) {s.phone ? `• 📞 ${s.phone}` : ''}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    {/* Preview Selected Servant Card with Automatic Promotion Note */}
                    {selectedServantId ? (
                      <div className="p-3.5 bg-white dark:bg-[#180710] rounded-2xl border-2 border-emerald-400 dark:border-emerald-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-churchgold-400 text-burgundy-950 font-black flex items-center justify-center text-lg shadow-xs shrink-0">
                            👑
                          </div>
                          <div>
                            <div className="font-black text-xs sm:text-sm text-slate-950 dark:text-stone-100 flex items-center gap-1.5 flex-wrap">
                              <span>{supervisorName}</span>
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black border border-emerald-300">
                                تم اختياره لأمانة الفصل ✓
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-700 dark:text-stone-300 mt-1 flex items-center gap-2 flex-wrap">
                              <span>📞 رقم الهاتف: <strong className="font-mono text-slate-950 dark:text-stone-100 font-bold" dir="ltr">{supervisorPhone || 'بدون تليفون'}</strong></span>
                              <span className="text-amber-800 dark:text-churchgold-400 font-bold">• ترقية واعتماد رسمي كـ أمين مرحلة وفصل ({stage.name})</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedServantId('');
                            setSupervisorName('');
                            setSupervisorPhone('');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-[11px] text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-bold self-end sm:self-auto cursor-pointer border border-rose-200 dark:border-rose-900"
                        >
                          إلغاء الاختيار ✕
                        </button>
                      </div>
                    ) : supervisorName ? (
                      <div className="p-3 bg-amber-100/60 dark:bg-[#2e101d] rounded-xl border border-amber-300 dark:border-[#4d1d2c] flex items-center justify-between text-xs font-bold text-slate-800 dark:text-stone-200">
                        <span>الأمين الحالي المسجل: <strong>{supervisorName}</strong> {supervisorPhone ? `(📞 ${supervisorPhone})` : ''}</span>
                        <span className="text-[10px] text-churchgold-700 dark:text-churchgold-400">اختر من القائمة أعلاه للتغيير والترقية</span>
                      </div>
                    ) : null}

                    <div className="flex justify-end pt-0.5">
                      <button
                        type="button"
                        onClick={() => setSupervisorInputMode('custom')}
                        className="text-[11px] text-slate-500 dark:text-stone-400 hover:text-burgundy-900 dark:hover:text-churchgold-300 underline cursor-pointer"
                      >
                        ✍️ خادم جديد لم يتم إضافته للكشف بعد؟ اضغط هنا للكتابة اليدوية
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Custom manual text inputs fallback */
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-stone-300 mb-1">
                          اسم أمين الخدمة (كتابة يدوية) *
                        </label>
                        <input
                          type="text"
                          value={supervisorName}
                          onChange={(e) => setSupervisorName(e.target.value)}
                          placeholder="مثال: أ/ مينا عادل، خ/ هاني نصيف..."
                          className="w-full bg-white dark:bg-[#18080f] border border-amber-200/80 dark:border-[#4d1f2e] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-stone-300 mb-1">
                          رقم تليفون أمين الخدمة
                        </label>
                        <input
                          type="tel"
                          value={supervisorPhone}
                          onChange={(e) => setSupervisorPhone(e.target.value)}
                          placeholder="مثال: 01012345678"
                          className="w-full bg-white dark:bg-[#18080f] border border-amber-200/80 dark:border-[#4d1f2e] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Assistant Supervisors Section (مساعدين أمين الخدمة / أمين الفصل) */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-[#240c17] border border-amber-200/80 dark:border-[#4d1f2e] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-burgundy-900 dark:text-churchgold-300 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-churchgold-600 dark:text-churchgold-400" />
                      <span>مساعدين أمين الخدمة / الفصل ({assistantSupervisors.length})</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-stone-400 mt-0.5">
                      يمكنك تعيين أكثر من مساعد واختيارهم مباشرة من كشف الخدام
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddAssistant}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-churchgold-600 to-amber-600 hover:from-churchgold-700 hover:to-amber-700 text-burgundy-950 font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة مساعد</span>
                  </button>
                </div>

                {assistantSupervisors.length === 0 ? (
                  <div className="p-3 text-center rounded-xl bg-white/70 dark:bg-[#1a0811] border border-dashed border-amber-200 dark:border-[#3d1524] text-[11px] text-slate-500 dark:text-stone-400">
                    لا يوجد مساعدين مسجلين لهذا الفصل حالياً. اضغط على "إضافة مساعد" بالجهة المقابلة لاختيار أو تعيين مساعد.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {assistantSupervisors.map((asst, index) => (
                      <div 
                        key={index} 
                        className="p-3 rounded-xl bg-white dark:bg-[#1a0811] border border-amber-200/80 dark:border-[#3d1524] space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-[#341121] text-amber-900 dark:text-churchgold-300 text-[10px] font-black flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-stone-200">
                              مساعد أمين الفصل #{index + 1}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveAssistant(index)}
                            className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-xs flex items-center gap-1 cursor-pointer font-bold"
                            title="حذف هذا المساعد"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
                          </button>
                        </div>

                        {/* Quick Servant Dropdown Picker for this Assistant */}
                        <div className="space-y-2">
                          <select
                            onChange={(e) => {
                              const sId = e.target.value;
                              const found = servants.find(s => s.id === sId);
                              if (found) {
                                handleUpdateAssistant(index, 'name', found.name);
                                handleUpdateAssistant(index, 'phone', found.phone || '');
                              }
                            }}
                            className="w-full bg-stone-50 dark:bg-[#200a14] border border-amber-200/70 dark:border-[#4d1f2e] rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-stone-200 focus:outline-none cursor-pointer"
                          >
                            <option value="">-- اضغط هنا لاختيار المساعد من كشف الخدام ({servants.length} خادم) --</option>
                            {stageServants.length > 0 && (
                              <optgroup label={`خدام مسجلين بمرحلة ${stage.name}`}>
                                {stageServants.map(s => (
                                  <option key={s.id} value={s.id}>
                                    ⭐ {s.name} • ({s.roleTitle || 'خادم'}) {s.phone ? `• ${s.phone}` : ''}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                            <optgroup label="باقي خدام الكنيسة">
                              {servants.filter(s => s.assignedStage !== stage.name).map(s => (
                                <option key={s.id} value={s.id}>
                                  {s.name} • ({s.assignedStage || 'عامة'}) {s.phone ? `• ${s.phone}` : ''}
                                </option>
                              ))}
                            </optgroup>
                          </select>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={asst.name}
                              onChange={(e) => handleUpdateAssistant(index, 'name', e.target.value)}
                              placeholder="اسم المساعد (أو يتم تعبئته تلقائياً من القائمة أعلاه)..."
                              className="bg-stone-50 dark:bg-[#200a14] border border-amber-200/70 dark:border-[#4d1f2e] rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-stone-100 focus:outline-none"
                            />

                            <input
                              type="tel"
                              value={asst.phone || ''}
                              onChange={(e) => handleUpdateAssistant(index, 'phone', e.target.value)}
                              placeholder="رقم التليفون (مثال: 012...)"
                              className="bg-stone-50 dark:bg-[#200a14] border border-amber-200/70 dark:border-[#4d1f2e] rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-stone-100 focus:outline-none"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Meeting Time / Schedule */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                  مواعيد وأيام الخدمة أو القداس
                </label>
                <input
                  type="text"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  placeholder="مثال: الجمعة 8:00 ص القداس، 10:30 ص مدارس الأحد"
                  className="w-full bg-stone-50 dark:bg-[#200a14] border border-amber-200/80 dark:border-[#4d1f2e] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              {/* Description / Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                  وصف الخدمة أو الفئة المستهدفة
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب ملاحظات أو وصف المرحلة والصفوف الدراسية..."
                  rows={2}
                  className="w-full bg-stone-50 dark:bg-[#200a14] border border-amber-200/80 dark:border-[#4d1f2e] rounded-xl p-3 text-xs text-slate-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              {/* Save Button */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-burgundy-900 to-burgundy-800 hover:from-burgundy-950 hover:to-burgundy-900 text-churchgold-100 text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Save className="w-4 h-4 text-churchgold-300" />
                  <span>حفظ كافة تعديلات الخدمة</span>
                </button>

                {stage.name !== 'عامة' && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف الخدمة</span>
                  </button>
                )}
              </div>
            </form>
          )}

          {/* TAB 2: Children in this Stage */}
          {activeSubTab === 'children' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 dark:text-stone-100">
                  المخدومين المسجلين في خدمة {stage.name} ({stageChildren.length} مخدوم):
                </h4>
              </div>

              {stageChildren.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 dark:text-stone-400 bg-stone-50 dark:bg-[#200a14] rounded-2xl border border-amber-100 dark:border-[#381622]">
                  لا يوجد مخدومين مسجلين في هذه الخدمة حالياً. يمكنك إضافة أولاد وإسنادهم لهذه المرحلة من شاشة الأولاد.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {stageChildren.map((kid, idx) => (
                    <div 
                      key={kid.id}
                      className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#200a14] border border-amber-200/60 dark:border-[#381622] flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}.</span>
                        <div className="w-7 h-7 rounded-lg bg-burgundy-900 text-churchgold-200 flex items-center justify-center font-bold text-xs shrink-0">
                          {kid.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900 dark:text-stone-100">{kid.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-stone-400 flex items-center gap-2">
                            <span>السن: {kid.age} سنة</span>
                            {kid.parentPhone && <span>📞 {kid.parentPhone}</span>}
                          </div>
                        </div>
                      </div>

                      {kid.parentPhone && (
                        <div className="flex items-center gap-1">
                          <a
                            href={`tel:${kid.parentPhone}`}
                            className="p-1 rounded-lg bg-emerald-600 text-white text-xs"
                            title="اتصال"
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Servants in this Stage */}
          {activeSubTab === 'servants' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 dark:text-stone-100">
                  الخدام المكلفين بخدمة {stage.name} ({stageServants.length} خادم):
                </h4>
              </div>

              {stageServants.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 dark:text-stone-400 bg-stone-50 dark:bg-[#200a14] rounded-2xl border border-amber-100 dark:border-[#381622]">
                  لا يوجد خدام مسجلين في هذه الخدمة حالياً. يمكنك إضافة أو تعديل خادم وإسناده لهذه المرحلة من شاشة الخدام.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {stageServants.map((srv, idx) => (
                    <div 
                      key={srv.id}
                      className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#200a14] border border-amber-200/60 dark:border-[#381622] flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}.</span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {srv.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900 dark:text-stone-100">{srv.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-stone-400 flex items-center gap-2">
                            <span>{srv.roleTitle || 'خادم'}</span>
                            {srv.phone && <span>📞 {srv.phone}</span>}
                          </div>
                        </div>
                      </div>

                      {srv.phone && (
                        <div className="flex items-center gap-1">
                          <a
                            href={`tel:${srv.phone}`}
                            className="p-1 rounded-lg bg-emerald-600 text-white text-xs"
                            title="اتصال"
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                          <a
                            href={`https://wa.me/2${srv.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-lg bg-emerald-500 text-white text-xs"
                            title="واتساب"
                          >
                            <MessageCircle className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 dark:bg-[#200a14] border-t border-amber-200/80 dark:border-[#381622] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-200/80 dark:bg-[#2b0e1d] text-slate-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-300 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
