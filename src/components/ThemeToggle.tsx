import React from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'icon' | 'pill' | 'full';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'icon', className = '' }) => {
  const { theme, toggleTheme } = useApp();
  const isDark = theme === 'dark';

  if (variant === 'pill') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        id="theme-toggle-pill-btn"
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-2xs cursor-pointer ${
          isDark
            ? 'bg-[#261019] hover:bg-[#341622] text-churchgold-400 border-[#5e2738]'
            : 'bg-white hover:bg-amber-50/60 text-burgundy-900 border-amber-200/80'
        } ${className}`}
        title={isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
        aria-label="تبديل مظهر الموقع"
      >
        {isDark ? (
          <>
            <Sun className="w-4 h-4 text-churchgold-400 shrink-0" />
            <span>الوضع الفاتح</span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-burgundy-700 shrink-0" />
            <span>الوضع الداكن</span>
          </>
        )}
      </button>
    );
  }

  if (variant === 'full') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        id="theme-toggle-full-btn"
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
          isDark
            ? 'bg-[#240e17] hover:bg-[#301420] text-stone-200 border-[#4a1c2b]'
            : 'bg-white/80 hover:bg-amber-50/70 text-burgundy-950 border-amber-200/70 shadow-2xs'
        } ${className}`}
        title={isDark ? 'التحويل للوضع الفاتح' : 'التحويل للوضع الداكن'}
        aria-label="تبديل مظهر الموقع"
      >
        <div className="flex items-center gap-2">
          {isDark ? (
            <Sun className="w-4 h-4 text-churchgold-400 shrink-0" />
          ) : (
            <Moon className="w-4 h-4 text-burgundy-700 shrink-0" />
          )}
          <span>{isDark ? 'المظهر النهاري (فاتح)' : 'المظهر الليلي (داكن)'}</span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
            isDark
              ? 'bg-churchgold-500/20 text-churchgold-300 border border-churchgold-500/30'
              : 'bg-burgundy-100 text-burgundy-800'
          }`}
        >
          {isDark ? 'ليلي' : 'نهاري'}
        </span>
      </button>
    );
  }

  // Default: Icon button
  return (
    <button
      onClick={toggleTheme}
      type="button"
      id="theme-toggle-icon-btn"
      className={`p-2 rounded-xl transition-all border shadow-2xs cursor-pointer ${
        isDark
          ? 'bg-[#261019] hover:bg-[#381625] text-churchgold-400 border-[#531f30]'
          : 'bg-white hover:bg-amber-50 text-burgundy-800 border-amber-200/90'
      } ${className}`}
      title={isDark ? 'تفعيل المظهر النهاري' : 'تفعيل المظهر الليلي (الداكن)'}
      aria-label="تبديل مظهر الموقع"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-churchgold-400 animate-in spin-in-90 duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-burgundy-700 animate-in spin-in-90 duration-200" />
      )}
    </button>
  );
};
