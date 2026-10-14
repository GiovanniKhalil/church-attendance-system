import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { updateFirebaseUserPassword } from '../firebase';
import { ShieldAlert, KeyRound, Eye, EyeOff, CheckCircle2, Lock, LogOut } from 'lucide-react';

export const ForcePasswordChangeModal: React.FC = () => {
  const { currentUser, changePassword, logout } = useApp();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!currentUser || !currentUser.isTempPassword) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPass = newPassword.trim();
    if (cleanPass.length < 4) {
      setError('كلمة المرور يجب أن تكون 4 خانات على الأقل لضمان الأمان');
      return;
    }

    if (cleanPass !== confirmPassword.trim()) {
      setError('كلمتا المرور غير متطابقتين، يرجى إعادة التحقق');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Update Firebase Auth password if authenticated
      try {
        await updateFirebaseUserPassword(cleanPass);
      } catch (authErr: any) {
        console.warn('Firebase Auth update password notice:', authErr.message);
      }

      // 2. Update Firestore and Context state: isFirstLogin = false
      await changePassword(currentUser.id, cleanPass);

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تحديث كلمة المرور');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300 font-['Cairo',sans-serif]">
      <div className="bg-white dark:bg-[#1a0a12] border-2 border-amber-400 dark:border-amber-600/80 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-slate-800 dark:text-stone-100 relative overflow-hidden">
        
        {/* Top Decorative Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 dark:bg-[#341121] border border-amber-300 dark:border-amber-700/60 flex items-center justify-center text-amber-700 dark:text-churchgold-300 shadow-md">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-[#351423] text-amber-800 dark:text-churchgold-300 text-xs font-black border border-amber-300 dark:border-amber-800/80 mb-2">
              تنبيه أمني إلزامي (isFirstLogin)
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-stone-100">
              يرجى تعيين كلمة مرور جديدة
            </h2>
            <p className="text-xs text-slate-500 dark:text-stone-400 mt-1 leading-relaxed">
              أهلاً بك يا <span className="font-bold text-slate-900 dark:text-stone-200">{currentUser.name}</span>. تم الدخول بكلمة سر مؤقتة، وللحفاظ على سرية الخدمة وبيانات المخدومين يرجى تعيين كلمة مرور شخصية خاصة بك للمتابعة.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-bold text-center">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-6 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-center space-y-3 animate-in zoom-in-95">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600 dark:text-emerald-400" />
            <div className="font-black text-sm text-emerald-900 dark:text-emerald-200">
              تم تحديث كلمة المرور بنجاح!
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              تم تحديث حسابك في قاعدة البيانات (isFirstLogin: false)، جاري نقلك للمنظومة...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-stone-300 mb-1.5">
                كلمة المرور الجديدة:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="اكتب كلمة مرور جديدة..."
                  required
                  autoFocus
                  className="w-full bg-stone-50 dark:bg-[#250d18] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-stone-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-stone-300 mb-1.5">
                تأكيد كلمة المرور:
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد كتابة كلمة المرور..."
                required
                className="w-full bg-stone-50 dark:bg-[#250d18] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ كلمة المرور والدخول'}</span>
              </button>

              <button
                type="button"
                onClick={logout}
                className="w-full py-2.5 rounded-xl bg-stone-100 dark:bg-[#250d18] hover:bg-stone-200 dark:hover:bg-[#321221] text-slate-600 dark:text-stone-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>تسجيل الخروج والرجوع</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
