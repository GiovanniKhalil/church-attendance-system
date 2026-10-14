import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Share, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem('pwa_banner_dismissed') === 'true';
  });

  // If already running in standalone mode or user dismissed this session
  if (isInstalled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) setShowGuideModal(true);
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {/* Top Floating PWA Banner */}
      <div className="bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-amber-950 border-b border-churchgold-400/30 text-white px-3 sm:px-4 py-2 sm:py-2.5 shadow-lg relative z-30 animate-in slide-in-from-top duration-300 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-churchgold-500 to-amber-500 text-burgundy-950 flex items-center justify-center shrink-0 shadow-xs ring-1 ring-churchgold-300/40">
              <Smartphone className="w-4 h-4 text-burgundy-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-black text-amber-100">
                <span>تثبيت منظومة الخدمة كـ تطبيق</span>
                <span className="hidden sm:inline-block px-2 py-0.2 rounded-full bg-churchgold-500/20 text-churchgold-300 text-[10px] border border-churchgold-400/30">
                  PWA سريع بدون إنترنت
                </span>
              </div>
              <p className="text-[11px] text-stone-300 hidden md:block">
                ثبّت التطبيق على هاتفك أو كمبيوترك لسرعة الوصول واستخدام ميزات الخدمة والافتقاد بضغطة واحدة من الشاشة الرئيسية.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-churchgold-500 to-amber-500 hover:from-churchgold-600 hover:to-amber-600 text-burgundy-950 font-black text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer border border-churchgold-300/50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>إضافة للشاشة الرئيسية / Install</span>
            </button>

            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
              title="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Installation & Shortcut Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a0a12] text-slate-900 dark:text-stone-100 border border-amber-200/80 dark:border-[#3e1423] rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-burgundy-800 to-burgundy-900 text-churchgold-300 flex items-center justify-center mx-auto shadow-md ring-2 ring-churchgold-400/40">
              <Smartphone className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-stone-100">
                تثبيت التطبيق وعمل اختصار (Shortcut)
              </h3>
              <p className="text-xs text-slate-500 dark:text-stone-400 mt-1">
                اتبع الخطوات التالية بحسب نوع جهازك لإضافة التطبيق لشاشتك:
              </p>
            </div>

            {isIOS ? (
              <div className="bg-stone-50 dark:bg-[#250d18] border border-amber-200/70 dark:border-[#4d1d2c] rounded-2xl p-4 text-right space-y-3 text-xs font-semibold text-slate-700 dark:text-stone-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-burgundy-700 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                  <div>
                    اضغط على زر <strong>المشاركة (Share)</strong> في شريط Safari بالأسفل:
                    <div className="mt-1 flex items-center gap-1 text-burgundy-700 dark:text-churchgold-400 font-bold">
                      <Share className="w-4 h-4" />
                      <span>أيقونة السهم لأعلى</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-burgundy-700 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                  <div>
                    مرر للأسفل واضغط على:
                    <div className="mt-1 flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <PlusSquare className="w-4 h-4" />
                      <span>إضافة إلى الصفحة الرئيسية (Add to Home Screen)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-burgundy-700 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                  <div>
                    اضغط على <strong>إضافة (Add)</strong> في أعلى اليمين. سيظهر التطبيق فوراً على شاشتك!
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-stone-50 dark:bg-[#250d18] border border-amber-200/70 dark:border-[#4d1d2c] rounded-2xl p-4 text-right space-y-2.5 text-xs font-semibold text-slate-700 dark:text-stone-300">
                <div>
                  <span className="font-black text-slate-900 dark:text-stone-100 block">📱 على الموبايل (أندرويد / Chrome):</span>
                  <span className="text-[11px] text-slate-600 dark:text-stone-300 block mt-0.5">
                    ١. افتح قائمة المتصفح <strong>(⋮)</strong> بأعلى الشاشة.
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-stone-300 block">
                    ٢. اختر <strong>"تثبيت التطبيق" (Install app)</strong> أو <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home screen)</strong>.
                  </span>
                </div>

                <div className="pt-2 border-t border-amber-100 dark:border-[#381421]">
                  <span className="font-black text-slate-900 dark:text-stone-100 block">💻 على الكمبيوتر (Windows / Mac):</span>
                  <span className="text-[11px] text-slate-600 dark:text-stone-300 block mt-0.5">
                    اضغط على أيقونة التثبيت (🖥️ أو ⬇️) في شريط العنوان بالأعلى بجانب النجمة، أو من قائمة المتصفح (⋮) اختر <strong>"تثبيت التطبيق"</strong>.
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-burgundy-800 hover:bg-burgundy-900 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              فهمت، شكراً
            </button>

          </div>
        </div>
      )}
    </>
  );
};
