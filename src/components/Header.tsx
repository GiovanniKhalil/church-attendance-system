import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { 
  Users, UserCheck, BookOpen, Crown, ShieldCheck, 
  RotateCcw, Sparkles, Cake, Cross, ChevronDown, Lock, LogOut, KeyRound, User, UserPlus
} from 'lucide-react';

import { parseBirthDate } from './BirthdayWidget';

export const Header: React.FC<{ 
  onOpenBirthdays: () => void;
  onOpenLogin: () => void;
  onOpenUserManagement: () => void;
}> = ({ onOpenBirthdays, onOpenLogin, onOpenUserManagement }) => {
  const { role, setRole, children, servants, currentUser, logout, selectedStageScope } = useApp();

  const today = new Date();
  const todayDay = today.getDate();
  const currentMonthNum = today.getMonth() + 1; // 1-12

  // Stage scope for children
  const effectiveStage = role === 'amin_khedma_am' ? selectedStageScope : (currentUser?.assignedStage || selectedStageScope);

  const scopedKids = effectiveStage === 'all' ? children : children.filter(c => c.stage === effectiveStage);
  const scopedServants = servants;

  // Today's birthdays count
  const todayKidsCount = scopedKids.filter(c => {
    const { day, month } = parseBirthDate(c.birthDate, c.birthMonth);
    return month === currentMonthNum && day === todayDay;
  }).length;

  const todayServantsCount = scopedServants.filter(s => {
    const { day, month } = parseBirthDate(s.birthDate, s.birthMonth);
    return month === currentMonthNum && day === todayDay;
  }).length;

  const todayTotal = todayKidsCount + todayServantsCount;

  // Month total count
  const monthKidsCount = scopedKids.filter(c => parseBirthDate(c.birthDate, c.birthMonth).month === currentMonthNum).length;
  const monthServantsCount = scopedServants.filter(s => parseBirthDate(s.birthDate, s.birthMonth).month === currentMonthNum).length;
  const monthTotal = monthKidsCount + monthServantsCount;

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const rolesConfig: { id: Role; label: string; desc: string; icon: any; color: string }[] = [
    {
      id: 'khadem',
      label: 'الخادم',
      desc: 'حضور الأولاد والمكتبة وكشف الفصل',
      icon: Users,
      color: 'text-indigo-600'
    },
    {
      id: 'amin_fasl',
      label: 'أمين الفصل',
      desc: 'يشمل أيضاً كشف وحضور الخدام',
      icon: ShieldCheck,
      color: 'text-emerald-600'
    },
    {
      id: 'amin_khedma_am',
      label: 'أمين الخدمة العام',
      desc: 'صلاحية شاملة وإدارة الحسابات',
      icon: Crown,
      color: 'text-amber-600'
    }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Church Branding */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-900 flex items-center justify-center text-amber-300 shadow-md ring-2 ring-amber-400/30">
              <Cross className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  منظومة خدمة الكنيسة
                </h1>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  متاحة أوفلاين
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                متابعة الحضور والغياب والمكتبة وإدارة الحسابات بالمرحلة والفصل
              </p>
            </div>
          </div>

          {/* Quick Stats, User Profile & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Birthday Alert Button */}
            <button
              onClick={onOpenBirthdays}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs ${
                todayTotal > 0
                  ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                  : 'bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200'
              }`}
              title="تنبيهات أعياد الميلاد"
            >
              <Cake className={`w-4 h-4 ${todayTotal > 0 ? 'text-white animate-bounce' : 'text-pink-500'}`} />
              <span className="hidden sm:inline">أعياد الميلاد</span>
              {todayTotal > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full bg-white text-rose-700 text-[11px] font-black">
                  {todayTotal} اليوم!
                </span>
              ) : monthTotal > 0 ? (
                <span className="w-5 h-5 rounded-full bg-pink-600 text-white text-[11px] font-bold flex items-center justify-center">
                  {monthTotal}
                </span>
              ) : null}
            </button>

            {/* Admin Accounts Management Button */}
            {role === 'amin_khedma_am' && (
              <button
                onClick={onOpenUserManagement}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-2xs"
                title="إدارة حسابات الخدام"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>إدارة الحسابات</span>
              </button>
            )}

            {/* Role Display / Switcher */}
            {role === 'amin_khedma_am' ? (
              <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                {rolesConfig.map(r => {
                  const Icon = r.icon;
                  const isActive = role === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isActive 
                          ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? r.color : 'text-slate-400'}`} />
                      <span>{r.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-900 text-xs font-bold shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>المرحلة المعينة: {currentUser?.assignedStage}</span>
              </div>
            )}

            {/* User Profile / Auth Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs text-xs font-bold"
                >
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-400 to-indigo-500 text-slate-950 font-black flex items-center justify-center text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-right">
                    <div className="leading-tight">{currentUser.name}</div>
                    <div className="text-[10px] text-amber-300 font-medium">
                      {currentUser.role === 'amin_khedma_am' ? 'أمين الخدمة العام' : currentUser.assignedStage}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl mb-2 text-right space-y-1">
                      <div className="font-bold text-slate-900">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500">اسم المستخدم: @{currentUser.username}</div>
                      <div className="text-[11px] text-indigo-700 font-bold">
                        {currentUser.role === 'amin_khedma_am' ? 'الصفة: أمين الخدمة العام (كل المراحل)' : `الصفة: ${currentUser.role === 'amin_fasl' ? 'أمين فصل' : 'خادم'} - مرحلة ${currentUser.assignedStage}`}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenLogin();
                      }}
                      className="w-full text-right px-3 py-2 rounded-xl hover:bg-indigo-50 text-indigo-800 flex items-center gap-2 font-bold transition-colors"
                    >
                      <User className="w-4 h-4 text-indigo-600" />
                      <span>تبديل الحساب / تسجيل دخول كخادم آخر</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenLogin();
                      }}
                      className="w-full text-right px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2 font-bold text-slate-700"
                    >
                      <KeyRound className="w-4 h-4 text-slate-500" />
                      <span>تغيير كلمة السر</span>
                    </button>

                    {role === 'amin_khedma_am' && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenUserManagement();
                        }}
                        className="w-full text-right px-3 py-2 rounded-xl hover:bg-amber-50 text-amber-900 flex items-center gap-2 font-bold transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span>إدارة حسابات المنظومة</span>
                      </button>
                    )}

                    <div className="my-1 border-t border-slate-100"></div>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-right px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-700 flex items-center gap-2 font-bold transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md"
              >
                <User className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};

