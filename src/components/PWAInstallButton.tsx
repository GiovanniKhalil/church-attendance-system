import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2, Share, PlusSquare, Sparkles } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'sidebar' | 'banner' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running standalone as an installed web app, don't show the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  const renderGuideModal = () => {
    if (!showGuide) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white dark:bg-[#1a0a12] border border-amber-200/80 dark:border-[#3e1423] rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-slate-800 dark:text-stone-200 text-right">
          
          <div className="flex items-center justify-between pb-2 border-b border-amber-100 dark:border-[#381622]">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-[#341121] text-burgundy-900 dark:text-churchgold-300">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-stone-100">تثبيت التطبيق على الموبايل</h3>
            </div>
            <button 
              onClick={() => setShowGuide(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isIOS ? (
            <div className="space-y-3 text-xs leading-relaxed">
              <p className="font-bold text-slate-700 dark:text-stone-300">
                لتثبيت التطبيق وعمل اختصار (Shortcut) على آيفون / آيباد (Safari):
              </p>
              
              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#250d18] border border-amber-200/60 dark:border-[#4d1f2e] flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black text-slate-900 dark:text-stone-100">١. اضغط على زر المشاركة (Share)</span>
                  <p className="text-[10px] text-slate-500 dark:text-stone-400">في الشريط السفلي لمتصفح سفاري</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#250d18] border border-amber-200/60 dark:border-[#4d1f2e] flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black text-slate-900 dark:text-stone-100">٢. اختر "إضافة إلى الشاشة الرئيسية"</span>
                  <p className="text-[10px] text-slate-500 dark:text-stone-400">Add to Home Screen</p>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-amber-50 dark:bg-[#2a101b] text-burgundy-900 dark:text-churchgold-300 text-[11px] font-bold">
                ✨ سيعمل التطبيق كبرنامج مستقل بكامل الشاشة وبدون شريط المتصفح!
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs leading-relaxed">
              <p className="font-bold text-slate-700 dark:text-stone-300">
                كيفية تثبيت التطبيق وعمل اختصار (Shortcut) على الشاشة الرئيسية:
              </p>

              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#250d18] border border-amber-200/60 dark:border-[#4d1f2e] space-y-2">
                <div>
                  <span className="font-black text-slate-900 dark:text-stone-100 block">📱 على الموبايل (أندرويد / Chrome):</span>
                  <span className="text-[11px] text-slate-600 dark:text-stone-300 block mt-0.5">
                    ١. اضغط على قائمة الثلاث نقاط <strong>(⋮)</strong> بأعلى المتصفح.
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-stone-300 block">
                    ٢. اختر <strong>"تثبيت التطبيق" (Install app)</strong> أو <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home screen)</strong>.
                  </span>
                  <span className="text-[11px] text-amber-800 dark:text-churchgold-300 block mt-1">
                    💡 ملاحظة: عند الضغط المطول على أيقونة التطبيق في شاشة هاتفك، تظهر اختصارات سريعة (مثل: كشف حضور الأولاد، كشف حضور الخدام).
                  </span>
                </div>

                <div className="pt-2 border-t border-amber-100 dark:border-[#381421]">
                  <span className="font-black text-slate-900 dark:text-stone-100 block">💻 على الكمبيوتر (Windows / Mac):</span>
                  <span className="text-[11px] text-slate-600 dark:text-stone-300 block mt-0.5">
                    اضغط على أيقونة التثبيت (🖥️ أو ⬇️) الموجودة في شريط العنوان بأعلى المتصفح، أو من قائمة المتصفح (⋮) اختر <strong>"تثبيت خدمة ماريوحنا"</strong> أو <strong>"إنشاء اختصار..." (Create shortcut)</strong>.
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 text-[11px] font-bold">
                🚀 ستظهر أيقونة "خدمة ماريوحنا" على شاشتك فوراً للدخول السريع بلمسة واحدة!
              </div>
            </div>
          )}

          <button
            onClick={() => setShowGuide(false)}
            className="w-full py-2 bg-burgundy-900 hover:bg-burgundy-950 text-amber-50 rounded-xl text-xs font-bold cursor-pointer"
          >
            فهمت، شكراً
          </button>
        </div>
      </div>
    );
  };

  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className="p-1.5 rounded-xl bg-churchgold-500/15 hover:bg-churchgold-500/25 text-churchgold-800 dark:text-churchgold-300 border border-churchgold-500/30 flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-all active:scale-95"
          title="تثبيت التطبيق على هاتفك"
        >
          <Download className="w-3.5 h-3.5 text-churchgold-600 dark:text-churchgold-400" />
          <span className="hidden sm:inline">تثبيت</span>
        </button>
        {renderGuideModal()}
      </>
    );
  }

  if (variant === 'sidebar') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-churchgold-600/20 to-amber-600/20 hover:from-churchgold-600/30 hover:to-amber-600/30 text-churchgold-200 border border-churchgold-500/30 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-98"
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-churchgold-400" />
            <span>تثبيت التطبيق كـ Shortcut</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-churchgold-500 text-burgundy-950 font-black">
            Install
          </span>
        </button>
        {renderGuideModal()}
      </>
    );
  }

  // Header default variant
  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-churchgold-500 to-amber-500 hover:from-churchgold-400 hover:to-amber-400 text-burgundy-950 text-xs font-extrabold shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0"
        title="تثبيت التطبيق على شاشة الموبايل"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="text-[11px] whitespace-nowrap">تثبيت التطبيق</span>
      </button>
      {renderGuideModal()}
    </>
  );
};
