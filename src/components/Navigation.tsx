import React from 'react';
import { useApp, TabId } from '../context/AppContext';
import { 
  BookOpen, Users, UserCheck, ShieldCheck, 
  UserPlus, CalendarCheck, Crown, LayoutDashboard, Bell, Home
} from 'lucide-react';

interface TabConfig {
  id: TabId;
  label: string;
  icon: any;
  category: 'home' | 'children' | 'servants' | 'supervisors' | 'library';
  badge?: string;
  subTitle?: string;
}

export const Navigation: React.FC = () => {
  const { role, activeTab, setActiveTab } = useApp();

  // Define tabs based on role permissions
  const allTabs: TabConfig[] = [
    {
      id: 'home',
      label: 'الرئيسية والتنبيهات',
      subTitle: 'لوحة التحكم والمناسبات',
      icon: Home,
      category: 'home'
    },
    {
      id: 'library',
      label: 'المكتبة التعليمية',
      subTitle: 'كتب الخدمة والمهرجان',
      icon: BookOpen,
      category: 'library'
    },
    {
      id: 'children_directory',
      label: 'كشف الأولاد',
      subTitle: 'بحث وفلترة المخدومين',
      icon: Users,
      category: 'children'
    },
    {
      id: 'children_attendance',
      label: 'تسجيل حضور الأولاد',
      subTitle: 'قداس • مدارس أحد • مهرجان',
      icon: UserCheck,
      category: 'children',
      badge: '3 أنشطة'
    },
    {
      id: 'servants_directory',
      label: 'كشف الخدام',
      subTitle: 'بيانات الخدام والوظائف',
      icon: ShieldCheck,
      category: 'servants'
    },
    {
      id: 'servants_attendance',
      label: 'حضور الخدام',
      subTitle: 'قداس • مدارس أحد • اجتماع عام',
      icon: CalendarCheck,
      category: 'servants'
    },
    {
      id: 'supervisors_directory',
      label: 'كشف أمناء الفصول',
      subTitle: 'بيانات أمناء المراحل',
      icon: Crown,
      category: 'supervisors'
    },
    {
      id: 'supervisors_attendance',
      label: 'حضور الأمناء',
      subTitle: 'قداس • مدارس أحد • اجتماع عام • اجتماع الأمناء',
      icon: CalendarCheck,
      category: 'supervisors',
      badge: '4 أنشطة'
    }
  ];

  // Filter visible tabs based on role
  const visibleTabs = allTabs.filter(tab => {
    if (tab.id === 'home') return true;
    if (role === 'khadem') {
      return (
        tab.id === 'library' || 
        tab.id === 'children_directory' || 
        tab.id === 'children_attendance' || 
        tab.id === 'servants_attendance'
      );
    }
    if (role === 'amin_fasl') {
      return (
        tab.id === 'library' || 
        tab.id === 'children_directory' || 
        tab.id === 'children_attendance' ||
        tab.id === 'servants_directory' ||
        tab.id === 'servants_attendance'
      );
    }
    // amin_khedma_am has all tabs
    return true;
  });

  return (
    <div className="bg-white border-b border-slate-200 shadow-2xs sticky top-[73px] z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-amber-300' : 'text-slate-500'
                }`} />
                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${
                        isActive ? 'bg-indigo-500/80 text-amber-200' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
