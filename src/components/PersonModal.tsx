import React, { useState, useEffect } from 'react';
import { Child, Servant, Supervisor, Stage } from '../types';
import { MONTHS, AREAS } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { 
  X, User, Phone, MapPin, Briefcase, Calendar, Cake, 
  FileText, CheckCircle2, Users, Crown, Sparkles, AlertCircle, ArrowRight
} from 'lucide-react';

type PersonType = 'child' | 'servant' | 'supervisor';

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: PersonType;
  initialData?: Child | Servant | Supervisor | null;
  onSave: (data: any) => void;
}

export const PersonModal: React.FC<PersonModalProps> = ({
  isOpen,
  onClose,
  type,
  initialData,
  onSave
}) => {
  const { stagesList, servants } = useApp();

  const isChild = type === 'child';
  const isServant = type === 'servant';
  const isSupervisor = type === 'supervisor';

  // For supervisor appointment: choose an existing servant or create a new one
  const [supervisorSelectionMode, setSupervisorSelectionMode] = useState<'pick_existing' | 'create_new'>('pick_existing');
  const [selectedServantId, setSelectedServantId] = useState<string>('');

  const getModalTitle = () => {
    if (initialData) {
      if (isChild) return 'تعديل بيانات المخدوم';
      if (isServant) return 'تعديل بيانات الخادم';
      return 'تعديل بيانات القيادي / أمين الفصل';
    }
    if (isChild) return 'إضافة ولد جديد إلى المرحلة';
    if (isServant) return 'إضافة خادم جديد إلى الكشف';
    return 'تكليف قيادة جديدة (أمين مرحلة أو مساعد أمين)';
  };

  const [formData, setFormData] = useState<any>({
    name: '',
    stage: 'ابتدائي (ثالثة ورابعة)',
    assignedStage: 'ابتدائي (ثالثة ورابعة)',
    supervisedStage: 'ابتدائي (ثالثة ورابعة)',
    age: 9,
    birthDate: '2017-07-15',
    birthMonth: 7,
    phone: '',
    parentName: '',
    parentRelation: 'الأب',
    parentPhone: '',
    parent2Name: '',
    parent2Relation: 'الأم',
    parent2Phone: '',
    roleTitle: 'خادم فصل',
    gender: 'boy',
    notes: '',
    secondaryStages: [] as string[],
    assignedStages: [] as string[],
    isAssistant: false,
    roleType: 'supervisor' as 'supervisor' | 'assistant_supervisor'
  });

  useEffect(() => {
    if (initialData) {
      const isSupAssistant = !!((initialData as any).isAssistant || (initialData as any).roleType === 'assistant_supervisor');
      setFormData({
        ...initialData,
        stage: (initialData as Child).stage || 'ابتدائي (ثالثة ورابعة)',
        assignedStage: (initialData as Servant).assignedStage || (initialData as Supervisor).assignedStage || 'ابتدائي (ثالثة ورابعة)',
        supervisedStage: (initialData as Supervisor).supervisedStage || (initialData as Servant).assignedStage || 'ابتدائي (ثالثة ورابعة)',
        parentRelation: (initialData as Child).parentRelation || 'الأب',
        parent2Name: (initialData as Child).parent2Name || '',
        parent2Relation: (initialData as Child).parent2Relation || 'الأم',
        parent2Phone: (initialData as Child).parent2Phone || '',
        secondaryStages: (initialData as Child).secondaryStages || [],
        assignedStages: (initialData as Servant).assignedStages || [],
        isAssistant: isSupAssistant,
        roleType: isSupAssistant ? 'assistant_supervisor' : 'supervisor'
      });
      setSelectedServantId(initialData.id || '');
    } else {
      setSupervisorSelectionMode('pick_existing');
      setSelectedServantId('');
      setFormData({
        name: '',
        stage: 'ابتدائي (ثالثة ورابعة)',
        assignedStage: 'ابتدائي (ثالثة ورابعة)',
        supervisedStage: 'ابتدائي (ثالثة ورابعة)',
        secondaryStages: [],
        assignedStages: [],
        age: 9,
        birthDate: '2017-07-15',
        birthMonth: 7,
        phone: '',
        parentName: '',
        parentRelation: 'الأب',
        parentPhone: '',
        parent2Name: '',
        parent2Relation: 'الأم',
        parent2Phone: '',
        roleTitle: 'خادم فصل',
        gender: 'boy',
        notes: '',
        isAssistant: false,
        roleType: 'supervisor'
      });
    }
  }, [initialData, isOpen, type]);

  // Handle picking an existing servant for leadership
  const handleSelectExistingServant = (servantId: string) => {
    setSelectedServantId(servantId);
    if (!servantId) return;

    const found = servants.find(s => s.id === servantId);
    if (found) {
      const isAssistantNow = formData.isAssistant || formData.roleType === 'assistant_supervisor';
      setFormData((prev: any) => ({
        ...prev,
        name: found.name,
        phone: found.phone,
        birthDate: found.birthDate || '1995-01-01',
        birthMonth: found.birthMonth || 1,
        supervisedStage: found.assignedStage || prev.supervisedStage,
        assignedStage: found.assignedStage || prev.assignedStage,
        isAssistant: isAssistantNow,
        roleType: isAssistantNow ? 'assistant_supervisor' : 'supervisor',
        notes: found.notes || ''
      }));
    }
  };

  const handleBirthDateChange = (dateStr: string) => {
    let calculatedAge = formData.age;
    let calculatedMonth = formData.birthMonth;

    if (dateStr) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);

        if (month) calculatedMonth = month;
        if (year && month && day) {
          const today = new Date();
          let calculated = today.getFullYear() - year;
          if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) {
            calculated--;
          }
          if (calculated >= 0) calculatedAge = calculated;
        }
      }
    }

    setFormData((prev: any) => ({
      ...prev,
      birthDate: dateStr,
      birthMonth: calculatedMonth,
      age: calculatedAge
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('يرجى تحديد أو إدخال اسم الشخص أولاً');
      return;
    }

    // Extract month from birthDate
    let month = formData.birthMonth;
    if (formData.birthDate) {
      const parts = formData.birthDate.split('-');
      if (parts.length === 3) {
        month = parseInt(parts[1], 10);
      }
    }

    if (isChild) {
      onSave({
        name: formData.name,
        stage: formData.stage,
        age: Number(formData.age),
        birthDate: formData.birthDate,
        birthMonth: month,
        phone: formData.phone || '',
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        parent2Name: formData.parent2Name || '',
        parent2Phone: formData.parent2Phone || '',
        gender: formData.gender,
        secondaryStages: formData.secondaryStages || [],
        notes: formData.notes
      });
    } else if (isServant) {
      onSave({
        name: formData.name,
        assignedStage: formData.assignedStage,
        assignedStages: formData.assignedStages || [],
        phone: formData.phone,
        birthDate: formData.birthDate,
        birthMonth: month,
        roleTitle: formData.roleTitle,
        notes: formData.notes
      });
    } else {
      // Supervisor / Leadership appointment
      const isAssistant = formData.isAssistant || formData.roleType === 'assistant_supervisor';
      const stage = formData.supervisedStage || formData.assignedStage || 'عامة';
      const leadershipTitle = isAssistant ? `مساعد أمين مرحلة (${stage})` : `أمين مرحلة (${stage})`;

      onSave({
        servantId: supervisorSelectionMode === 'pick_existing' ? selectedServantId : undefined,
        name: formData.name,
        supervisedStage: stage,
        assignedStage: stage,
        title: leadershipTitle,
        isAssistant: isAssistant,
        roleType: isAssistant ? 'assistant_supervisor' : 'supervisor',
        phone: formData.phone,
        birthDate: formData.birthDate,
        birthMonth: month,
        notes: formData.notes
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  const selectedServantDetails = servants.find(s => s.id === selectedServantId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#1a0a12] rounded-3xl max-w-2xl w-full shadow-2xl border border-amber-200/80 dark:border-[#3e1423] overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-4 max-h-[90vh] flex flex-col transition-colors duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-950 p-4 sm:p-5 text-white flex items-center justify-between shrink-0 border-b border-churchgold-400/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-churchgold-600 to-amber-500 flex items-center justify-center font-bold text-burgundy-950 shadow-xs">
              {isSupervisor ? <Crown className="w-5 h-5 text-burgundy-950" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-black text-amber-50">{getModalTitle()}</h3>
              {isSupervisor && (
                <p className="text-[11px] text-churchgold-300 font-medium">
                  الخدام أساس الخدمة، والقيادات هي تكليف لخادم عادي يظل مسجلاً في كشف الخدام
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-amber-200/80 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs font-medium text-slate-700 dark:text-stone-300 overflow-y-auto">
          
          {/* 
            ====================================================================
            SPECIAL SUPERVISOR MODE: Select existing servant vs Add new servant
            ====================================================================
          */}
          {isSupervisor && !initialData && (
            <div className="space-y-3 pb-3 border-b border-amber-100 dark:border-[#341121]">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-800 dark:text-stone-200 text-xs">طريقة تعيين القيادة:</span>
                <div className="flex items-center bg-stone-100 dark:bg-[#250d18] p-1 rounded-xl border border-amber-200/80 dark:border-[#4d1d2c]">
                  <button
                    type="button"
                    onClick={() => setSupervisorSelectionMode('pick_existing')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      supervisorSelectionMode === 'pick_existing'
                        ? 'bg-amber-500 text-burgundy-950 shadow-xs font-black'
                        : 'text-slate-600 dark:text-stone-400 hover:text-slate-900'
                    }`}
                  >
                    👥 اختيار خادم مسجل من الكشف
                  </button>
                  <button
                    type="button"
                    onClick={() => setSupervisorSelectionMode('create_new')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      supervisorSelectionMode === 'create_new'
                        ? 'bg-amber-500 text-burgundy-950 shadow-xs font-black'
                        : 'text-slate-600 dark:text-stone-400 hover:text-slate-900'
                    }`}
                  >
                    ✍️ تسجيل خادم جديد كقيادي
                  </button>
                </div>
              </div>

              {/* Mode A: Pick Existing Servant Dropdown */}
              {supervisorSelectionMode === 'pick_existing' && (
                <div className="space-y-2 bg-amber-50/50 dark:bg-[#250c18] p-3 rounded-2xl border border-amber-200/80 dark:border-[#4d1d2c]">
                  <label className="block font-bold text-slate-800 dark:text-stone-200">
                    اختر الخادم المراد تكليفه بدور قيادي *
                  </label>
                  <select
                    required
                    value={selectedServantId}
                    onChange={(e) => handleSelectExistingServant(e.target.value)}
                    className="w-full bg-white dark:bg-[#1a0a12] border border-amber-300 dark:border-[#541c30] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="">-- اضغط هنا لاختيار الخادم من كشف الخدام ({servants.length} خادم) --</option>
                    {servants.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} • ({s.assignedStage})
                      </option>
                    ))}
                  </select>

                  {/* Selected Servant Summary Preview Card */}
                  {selectedServantDetails && (
                    <div className="mt-2 p-2.5 bg-white dark:bg-[#1d0b15] rounded-xl border border-emerald-300/80 dark:border-emerald-800 flex items-center justify-between gap-3 animate-in fade-in duration-150">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {selectedServantDetails.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-slate-900 dark:text-stone-100">
                            {selectedServantDetails.name}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-stone-400">
                            <span>المرحلة الحالية: {selectedServantDetails.assignedStage}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200">
                        خادم مسجل بالكشف ✓
                      </span>
                    </div>
                  )}

                  <p className="text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1 mt-1">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>سيتم تعيين الخادم كقيادي مع بقائه في كشف الخدام، وفي حال الرغبة في إقالته يعود خادماً عادياً تلقائياً.</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Leadership Role Type (👑 أمين vs 🤝 مساعد) */}
          {isSupervisor && (
            <div className="bg-stone-50 dark:bg-[#240b17] p-3 rounded-2xl border border-amber-200/80 dark:border-[#4d1d2c] space-y-2">
              <label className="block font-bold text-slate-800 dark:text-stone-200 text-xs">
                نوع التكليف والصفة القيادية *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isAssistant: false, roleType: 'supervisor' })}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    !formData.isAssistant && formData.roleType !== 'assistant_supervisor'
                      ? 'bg-amber-500 text-burgundy-950 border-amber-600 ring-2 ring-amber-400/40 font-black shadow-xs'
                      : 'bg-white dark:bg-[#1a0a12] text-slate-700 dark:text-stone-300 border-amber-200/80 dark:border-[#4d1d2c]'
                  }`}
                >
                  <span className="text-base">👑</span>
                  <span>أمين مرحلة / فصل</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isAssistant: true, roleType: 'assistant_supervisor' })}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    formData.isAssistant || formData.roleType === 'assistant_supervisor'
                      ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-400/40 font-black shadow-xs'
                      : 'bg-white dark:bg-[#1a0a12] text-slate-700 dark:text-stone-300 border-amber-200/80 dark:border-[#4d1d2c]'
                  }`}
                >
                  <span className="text-base">🤝</span>
                  <span>مساعد أمين مرحلة</span>
                </button>
              </div>
            </div>
          )}

          {/* Full Name & Gender (if not picking existing servant) */}
          {(!isSupervisor || supervisorSelectionMode === 'create_new' || initialData) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="block font-bold mb-1 text-slate-800 dark:text-stone-200">الاسم بالكامل *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={isChild ? "مثال: مينا كيرلس شفيق" : "مثال: أستاذ بيشوي مجدي"}
                  className="w-full bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-stone-100 focus:bg-white dark:focus:bg-[#2c0e1c] focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
                />
              </div>

              {/* Gender if Child */}
              {isChild && (
                <div className="bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-3 py-2">
                  <label className="block font-bold mb-1 text-slate-800 dark:text-stone-200 text-[11px]">النوع</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-800 dark:text-stone-200">
                      <input
                        type="radio"
                        name="gender"
                        value="boy"
                        checked={formData.gender === 'boy'}
                        onChange={() => setFormData({ ...formData, gender: 'boy' })}
                      />
                      <span>ولد 👦</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-800 dark:text-stone-200">
                      <input
                        type="radio"
                        name="gender"
                        value="girl"
                        checked={formData.gender === 'girl'}
                        onChange={() => setFormData({ ...formData, gender: 'girl' })}
                      />
                      <span>بنت 👧</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stage */}
          <div>
            <label className="block font-bold mb-1 text-slate-800 dark:text-stone-200">
              {isChild ? 'المرحلة الدراسية' : isServant ? 'المرحلة الخدمية' : 'المرحلة المسئول عنها كقيادي *'}
            </label>
            <select
              value={isChild ? formData.stage : isServant ? formData.assignedStage : formData.supervisedStage}
              onChange={(e) => {
                const val = e.target.value;
                if (isChild) setFormData({ ...formData, stage: val });
                else if (isServant) setFormData({ ...formData, assignedStage: val });
                else setFormData({ ...formData, supervisedStage: val, assignedStage: val });
              }}
              className="w-full bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-burgundy-600/30 cursor-pointer"
            >
              {stagesList.map(s => (
                <option key={s.id || s.name} value={s.name}>{s.name}</option>
              ))}
            </select>

            {/* Multi-stage selection for Servants */}
            {isServant && (
              <div className="mt-2.5 p-3 bg-emerald-50/60 dark:bg-[#12241b] rounded-2xl border border-emerald-200/80 dark:border-[#1d4633] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 dark:text-stone-200 text-xs">
                    مراحل إضافية يخدم بها هذا الخادم:
                  </label>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                    {(formData.assignedStages || []).length} مراحل إضافية
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-stone-400">
                  يمكن للخادم أن يخدم في أكثر من مرحلة في نفس الوقت (مثال: يخدم في الابتدائي والحضانة والكورال):
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {stagesList.filter(s => s.name !== formData.assignedStage).map(stg => {
                    const isSelected = (formData.assignedStages || []).includes(stg.name);
                    return (
                      <button
                        key={stg.id || stg.name}
                        type="button"
                        onClick={() => {
                          const current = formData.assignedStages || [];
                          const updated = isSelected 
                            ? current.filter((s: string) => s !== stg.name)
                            : [...current, stg.name];
                          setFormData({ ...formData, assignedStages: updated });
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
            )}

            {/* Multi-stage / Secondary Stage Booking for Children */}
            {isChild && (
              <div className="mt-2.5 p-3 bg-amber-50/60 dark:bg-[#250d18] rounded-2xl border border-amber-200/80 dark:border-[#4d1d2c] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 dark:text-stone-200 text-xs">
                    مراحل أو فصول وأنشطة إضافية للمخدوم (مراحل متعددة):
                  </label>
                  <span className="text-[10px] text-churchgold-600 dark:text-churchgold-400 font-bold">
                    {(formData.secondaryStages || []).length} مراحل إضافية
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-stone-400">
                  يمكن إضافة المخدوم في أكثر من مرحلة أو نشاط كنسي بالتوازي (مثال: كورال، شمامسة، نادي):
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {stagesList.filter(s => s.name !== formData.stage).map(stg => {
                    const isSelected = (formData.secondaryStages || []).includes(stg.name);
                    return (
                      <button
                        key={stg.id || stg.name}
                        type="button"
                        onClick={() => {
                          const current = formData.secondaryStages || [];
                          const updated = isSelected 
                            ? current.filter((s: string) => s !== stg.name)
                            : [...current, stg.name];
                          setFormData({ ...formData, secondaryStages: updated });
                        }}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-amber-600 text-white shadow-xs font-black' 
                            : 'bg-white dark:bg-[#1a0a12] text-slate-700 dark:text-stone-300 border border-amber-200/60 dark:border-[#3e1423] hover:bg-amber-100 dark:hover:bg-[#2e101c]'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {stg.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Phone */}
          {(!isSupervisor || supervisorSelectionMode === 'create_new' || initialData) && (
            <div>
              <label className="block font-bold mb-1 text-slate-800 dark:text-stone-200">
                رقم الهاتف / الواتساب {isChild ? '(تليفون المخدوم الشخصي إن وجد)' : '*'}
              </label>
              <input
                type="tel"
                required={!isChild}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="012xxxxxxxx"
                className="w-full bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-3 py-2 font-mono font-bold text-slate-800 dark:text-stone-100 focus:bg-white dark:focus:bg-[#2c0e1c] focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
              />
            </div>
          )}

          {/* Birth Date Section */}
          {(!isSupervisor || supervisorSelectionMode === 'create_new' || initialData) && (
            <div className="bg-stone-50 dark:bg-[#240b17] p-3 rounded-2xl border border-amber-200/80 dark:border-[#4d1d2c] space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="font-bold text-slate-800 dark:text-stone-200 flex items-center gap-1.5 text-xs">
                  <Calendar className="w-4 h-4 text-churchgold-600 dark:text-churchgold-400" />
                  <span>تاريخ الميلاد كاملاً (اليوم / الشهر / السنة) *</span>
                </label>
                {formData.birthDate && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-[#341121] text-amber-900 dark:text-churchgold-300 border border-amber-200 dark:border-[#4d1d2c]">
                    السن: {formData.age} سنوات • شهر الميلاد: {formData.birthMonth}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => handleBirthDateChange(e.target.value)}
                    className="w-full bg-white dark:bg-[#1d0913] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-stone-400 mb-0.5">السن المحسوب</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white dark:bg-[#1d0913] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-stone-100 focus:outline-none"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-stone-400 mb-0.5">شهر الميلاد</label>
                    <select
                      value={formData.birthMonth}
                      onChange={(e) => setFormData({ ...formData, birthMonth: parseInt(e.target.value) })}
                      className="w-full bg-white dark:bg-[#1d0913] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-stone-100 focus:outline-none"
                    >
                      {MONTHS.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Child specific parents fields (Primary Guardian & Secondary Guardian) */}
          {isChild && (
            <div className="space-y-3 pt-2 border-t border-amber-100 dark:border-[#341121]">
              {/* 1. Primary Guardian */}
              <div className="p-3.5 bg-amber-50/70 dark:bg-[#240b17] rounded-2xl border border-amber-200/90 dark:border-[#4d1d2c] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-burgundy-950 dark:text-churchgold-200 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-churchgold-600" />
                    <span>بيانات ولي الأمر الأساسي * (إلزامي)</span>
                  </span>
                  <span className="text-[10px] text-amber-800 dark:text-churchgold-400 font-bold">المسؤول الأول</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-stone-300 mb-1">
                      اسم ولي الأمر الأساسي *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      placeholder="مثال: كيرلس شفيق ميخائيل"
                      className="w-full bg-white dark:bg-[#1d0913] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-stone-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-stone-300 mb-1">
                      رقم تليفون / واتساب ولي الأمر الأساسي *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      placeholder="01xxxxxxxxx"
                      className="w-full bg-white dark:bg-[#1d0913] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-3 py-2 text-xs font-mono font-black text-slate-900 dark:text-stone-100 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Secondary Guardian (Optional) */}
              <div className="p-3.5 bg-stone-50 dark:bg-[#200a15] rounded-2xl border border-stone-200 dark:border-[#381120] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                    <span>بيانات ولي أمر آخر (إضافي / احتياطي - اختياري)</span>
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold">للطوارئ أو المتابعة</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-stone-300 mb-1">
                      اسم ولي الأمر الآخر
                    </label>
                    <input
                      type="text"
                      value={formData.parent2Name || ''}
                      onChange={(e) => setFormData({ ...formData, parent2Name: e.target.value })}
                      placeholder="مثال: مريم سمير (الأم / الخالة)"
                      className="w-full bg-white dark:bg-[#1d0913] border border-stone-200 dark:border-[#381120] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-stone-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-stone-300 mb-1">
                      رقم تليفون / واتساب ولي الأمر الآخر
                    </label>
                    <input
                      type="tel"
                      value={formData.parent2Phone || ''}
                      onChange={(e) => setFormData({ ...formData, parent2Phone: e.target.value })}
                      placeholder="01xxxxxxxxx"
                      className="w-full bg-white dark:bg-[#1d0913] border border-stone-200 dark:border-[#381120] rounded-xl px-3 py-2 text-xs font-mono font-black text-slate-900 dark:text-stone-100 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block font-bold mb-1 text-slate-800 dark:text-stone-200">ملاحظات خاصة</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={isSupervisor ? "ملاحظات عن التكليف القيادي أو التفرغ..." : "أي ملاحظات إضافية..."}
              className="w-full bg-stone-50 dark:bg-[#240b17] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-3 py-2 text-slate-800 dark:text-stone-100 focus:bg-white dark:focus:bg-[#2c0e1c] focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-amber-100 dark:border-[#341121]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-[#250d18] hover:bg-stone-200 dark:hover:bg-[#341121] text-slate-700 dark:text-stone-300 font-bold transition-colors cursor-pointer border border-amber-200/60 dark:border-[#4d1d2c]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-churchgold-600 to-amber-600 hover:from-churchgold-700 hover:to-amber-700 text-burgundy-950 font-black shadow-md transition-all cursor-pointer border border-churchgold-400/40"
            >
              {isSupervisor ? 'تأكيد التكليف القيادي' : 'حفظ البيانات'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
