import React, { useState } from 'react';
import { useApp, TabId } from '../context/AppContext';
import { STAGES } from '../data/mockData';
import { 
  Menu, Cake, ShieldCheck, Crown, Users, BookOpen, 
  Home, UserCheck, CalendarCheck, Filter, Sparkles, ChevronDown, User, KeyRound, LogOut, Layers, Smartphone
} from 'lucide-react';
import { parseBirthDate } from './BirthdayWidget';
import { ThemeToggle } from './ThemeToggle';
import { PWAInstallButton } from './PWAInstallButton';

interface AppHeaderProps {
  onToggleSidebar: () => void;
  onOpenBirthdays: () => void;
  onOpenProfile?: () => void;
  onOpenLogin?: () => void;
  onOpenUserManagement: () => void;
  onOpenServicesManager: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onToggleSidebar,
  onOpenBirthdays,
  onOpenProfile,
  onOpenUserManagement,
  onOpenServicesManager
}) => {
  const { 
    activeTab, setActiveTab, role, currentUser, selectedStageScope, 
    setSelectedStageScope, children, servants, logout 
  } = useApp();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Compute today's birthdays count
  const today = new Date();
  const todayDay = today.getDate();
  const currentMonthNum = today.getMonth() + 1;

  const effectiveStage = role === 'amin_khedma_am' ? selectedStageScope : (currentUser?.assignedStage || selectedStageScope);
  const scopedKids = effectiveStage === 'all' ? children : children.filter(c => c.stage === effectiveStage);
  
  const todayKidsCount = scopedKids.filter(c => {
    const { day, month } = parseBirthDate(c.birthDate, c.birthMonth);
    return month === currentMonthNum && day === todayDay;
  }).length;

  const todayServantsCount = servants.filter(s => {
    const { day, month } = parseBirthDate(s.birthDate, s.birthMonth);
    return month === currentMonthNum && day === todayDay;
  }).length;

  const totalBirthdaysToday = todayKidsCount + todayServantsCount;

  const getTabTitle = (tab: TabId) => {
    switch(tab) {
      case 'home': return { title: 'لوحة التحكم والمناسبات', icon: Home };
      case 'library': return { title: 'المكتبة والمناهج والطقس', icon: BookOpen };
      case 'children_directory': return { title: 'كشف مخدومي المرحلة (الأولاد)', icon: Users };
      case 'children_attendance': return { title: 'تسجيل حضور وغياب الأولاد', icon: UserCheck };
      case 'servants_directory': return { title: 'كشف بيانات الخدام والمسؤوليات', icon: ShieldCheck };
      case 'servants_attendance': return { title: 'تسجيل حضور وغياب الخدام', icon: CalendarCheck };
      case 'supervisors_directory': return { title: 'كشف بيانات أمناء الفصول والمراحل', icon: Crown };
      case 'supervisors_attendance': return { title: 'تسجيل حضور وغياب أمناء الفصول', icon: CalendarCheck };
      default: return { title: 'الرئيسية', icon: Home };
    }
  };

  const { title: currentTabTitle, icon: CurrentTabIcon } = getTabTitle(activeTab);

  return (
    <header className="bg-white/95 dark:bg-[#18090f]/95 backdrop-blur-md border-b border-amber-200/60 dark:border-[#381622] sticky top-0 z-20 shadow-2xs no-print transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        
        {/* Right Side (in RTL): Menu Toggle (mobile) + Church Logo & Current Tab Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            id="mobile-sidebar-toggle-btn"
            className="p-2 rounded-xl bg-amber-50/80 hover:bg-amber-100 dark:bg-[#28101a] dark:hover:bg-[#381624] text-burgundy-900 dark:text-churchgold-300 border border-amber-200/80 dark:border-[#4d1f2e] lg:hidden transition-colors cursor-pointer shrink-0"
            title="فتح القائمة الجانبية"
            aria-label="القائمة الجانبية"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* Church Logo Badge */}
            <div className="relative group shrink-0">
              <img 
                src="/church_logo.jpg" 
                alt="شعار كنيسة ماريوحنا المعمدان بالمعراج" 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-churchgold-500/80 shadow-xs"
                referrerPolicy="no-referrer" 
              />
              <span className="absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#18090f]" title="متصل" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-base font-black text-slate-950 dark:text-stone-50 truncate max-w-[125px] sm:max-w-none">
                  {currentTabTitle}
                </h1>
                <span className="hidden xl:inline-block px-2 py-0.5 rounded-full bg-burgundy-50 dark:bg-burgundy-950 text-burgundy-800 dark:text-churchgold-300 text-[10px] font-black border border-burgundy-200/60 dark:border-burgundy-800 whitespace-nowrap">
                  ماريوحنا المعمدان
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-stone-400 hidden sm:flex items-center gap-1.5 mt-0.5">
                <span>كنيسة ماريوحنا المعمدان بالمعراج</span>
                <span className="text-churchgold-600 dark:text-churchgold-400">•</span>
                <span className="text-slate-400 dark:text-stone-500">مطرانية المعادي</span>
              </p>
            </div>
          </div>
        </div>

        {/* Center Quick Switcher for Attendance */}
        <div className="hidden lg:flex items-center gap-1 bg-stone-100/80 dark:bg-[#200a14] p-1 rounded-2xl border border-amber-200/70 dark:border-[#381321] text-xs shadow-2xs">
          <button
            onClick={() => setActiveTab('children_attendance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'children_attendance'
                ? 'bg-burgundy-900 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/50'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-churchgold-400" />
            <span>حضور الأولاد</span>
          </button>

          <button
            onClick={() => setActiveTab('servants_attendance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'servants_attendance'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-white/50'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>تسجيل حضور الخدام</span>
          </button>
        </div>

        {/* Right Side (in RTL): Stage Filter Scope + Birthday alert + Theme Toggle + User Avatar */}
        <div className="flex items-center gap-2">
          
          {/* Stage Scope Selector for Amin Khedma Am (Hidden on Mobile as requested) */}
          {role === 'amin_khedma_am' ? (
            <div className="hidden md:flex items-center gap-1.5 bg-[#fdfbf7] dark:bg-[#230d17] border border-amber-200/80 dark:border-[#4c1c2b] rounded-xl px-2.5 py-1 text-xs shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-burgundy-700 dark:text-churchgold-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 hidden lg:inline">عرض المرحلة:</span>
              <select
                value={selectedStageScope}
                onChange={(e) => setSelectedStageScope(e.target.value as any)}
                id="header-stage-scope-select"
                className="bg-transparent font-bold text-slate-800 dark:text-stone-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="all" className="dark:bg-[#1f0b14] dark:text-white">جميع المراحل ({children.length} ولد)</option>
                {STAGES.map(s => (
                  <option key={s} value={s} className="dark:bg-[#1f0b14] dark:text-white">{s}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 bg-burgundy-50 dark:bg-[#260f18] border border-burgundy-200/70 dark:border-[#4d1f2e] text-burgundy-900 dark:text-churchgold-300 rounded-xl px-2.5 py-1 text-xs font-bold shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-burgundy-700 dark:text-churchgold-400 shrink-0" />
              <span className="truncate max-w-[130px]">{currentUser?.assignedStage || selectedStageScope}</span>
            </div>
          )}

          {/* Birthday Widget Quick Trigger */}
          <button
            onClick={onOpenBirthdays}
            id="header-birthdays-btn"
            className={`flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0 ${
              totalBirthdaysToday > 0
                ? 'bg-gradient-to-r from-rose-700 to-burgundy-700 text-white border-rose-600 animate-pulse'
                : 'bg-amber-50/70 hover:bg-amber-100/70 dark:bg-[#261019] dark:hover:bg-[#341622] text-burgundy-900 dark:text-churchgold-300 border-amber-200/80 dark:border-[#4a1c2b]'
            }`}
            title="عرض أعياد الميلاد"
          >
            <Cake className="w-4 h-4 text-churchgold-500 dark:text-churchgold-400" />
            <span className="hidden sm:inline">أعياد الميلاد</span>
            {totalBirthdaysToday > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white text-burgundy-900 text-[10px] font-black shadow-xs">
                {totalBirthdaysToday}
              </span>
            )}
          </button>

          {/* Theme Toggle Button (Day / Dark Mode Switcher) */}
          <ThemeToggle variant="icon" />

          {/* Quick PWA Install Button */}
          <div className="hidden lg:block">
            <PWAInstallButton variant="header" />
          </div>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              id="header-profile-menu-btn"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-amber-50/60 hover:bg-amber-100/70 dark:bg-[#230d17] dark:hover:bg-[#2f111f] border border-amber-200/80 dark:border-[#4c1c2b] text-slate-800 dark:text-stone-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-burgundy-800 text-churchgold-300 ring-1 ring-churchgold-500/50 flex items-center justify-center text-xs font-black shadow-xs">
                {currentUser?.name?.charAt(0) || 'م'}
              </div>
              <span className="hidden md:inline max-w-[100px] truncate">{currentUser?.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 dark:text-stone-400" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-[#1d0b13] rounded-2xl shadow-2xl border border-amber-200/80 dark:border-[#4d1f2e] p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
                <div className="p-2.5 bg-burgundy-50/70 dark:bg-[#260f18] rounded-xl mb-1.5 text-right border border-burgundy-100/80 dark:border-[#3d1723]">
                  <div className="font-bold text-slate-900 dark:text-stone-100">{currentUser?.name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-stone-400">@{currentUser?.username}</div>
                  <div className="text-[10px] text-burgundy-800 dark:text-churchgold-400 font-extrabold mt-0.5">
                    {currentUser?.role === 'amin_khedma_am' ? 'أمين الخدمة العام' : `المرحلة: ${currentUser?.assignedStage || 'عامة'}`}
                  </div>
                </div>

                {onOpenProfile && (
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full text-right px-3 py-2 rounded-xl hover:bg-amber-50 dark:hover:bg-[#2a101b] text-burgundy-900 dark:text-churchgold-300 font-bold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-burgundy-700 dark:text-churchgold-400" />
                    <span>تعديل بياناتي الشخصية</span>
                  </button>
                )}

                {(role === 'amin_khedma_am' || currentUser?.canManageSupervisors || currentUser?.username?.toLowerCase() === 'giovanni_ayman' || currentUser?.phone === '01203385601') && (
                  <>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenServicesManager();
                      }}
                      className="w-full text-right px-3 py-2 rounded-xl hover:bg-amber-50 dark:hover:bg-[#2a101b] text-amber-900 dark:text-churchgold-400 font-bold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-churchgold-600 dark:text-churchgold-400" />
                      <span>إدارة المراحل والفصول الكنسية</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenUserManagement();
                      }}
                      className="w-full text-right px-3 py-2 rounded-xl hover:bg-amber-50 dark:hover:bg-[#2a101b] text-amber-900 dark:text-churchgold-400 font-bold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-churchgold-600 dark:text-churchgold-400" />
                      <span>إدارة حسابات المستخدمين</span>
                    </button>
                  </>
                )}

                <div className="my-1 border-t border-amber-100 dark:border-[#381622]" />

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-right px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};

