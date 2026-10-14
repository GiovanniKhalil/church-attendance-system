import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, User, KeyRound, Sparkles, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, changePassword, currentUser, users } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // First-time change temporary password state
  const [isChangingTempPass, setIsChangingTempPass] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tempPassSuccess, setTempPassSuccess] = useState(false);

  // Forgot password mode state
  const [isForgotPass, setIsForgotPass] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  if (!isOpen) return null;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('يرجى كتابة اسم المستخدم أو البريد الإلكتروني وكلمة السر');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(username, password);
      if (!res.success) {
        setError(res.error || 'فشل تسجيل الدخول');
        return;
      }

      if (res.isTemp) {
        setIsChangingTempPass(true);
      } else {
        if (onClose) onClose();
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeTempPassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 4) {
      setError('كلمة السر يجب أن تكون 4 أحرف أو أرقام على الأقل');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمتا السر غير متطابقتين');
      return;
    }

    if (currentUser) {
      setIsSubmitting(true);
      try {
        await changePassword(currentUser.id, newPassword);
        setTempPassSuccess(true);
        setTimeout(() => {
          setIsChangingTempPass(false);
          setTempPassSuccess(false);
          if (onClose) onClose();
        }, 1200);
      } catch (err: any) {
        setError(err.message || 'فشل تحديث كلمة المرور');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const targetUser = users.find(u => u.username.toLowerCase().trim() === forgotUsername.toLowerCase().trim());
    if (!targetUser) {
      setError('اسم المستخدم غير مسجل في المنظومة. يرجى التأكد من اسم الحساب.');
      return;
    }

    if (!forgotNewPass.trim() || forgotNewPass.length < 4) {
      setError('يرجى كتابة كلمة سر جديدة (4 أحرف أو أرقام على الأقل)');
      return;
    }

    setIsSubmitting(true);
    try {
      // Update password in AppContext
      await changePassword(targetUser.id, forgotNewPass);
      
      // Auto login
      const loginRes = await login(targetUser.username, forgotNewPass);
      if (loginRes.success) {
        setForgotSuccess(true);
        setTimeout(() => {
          setIsForgotPass(false);
          setForgotSuccess(false);
          if (onClose) onClose();
        }, 1200);
      } else {
        setError('تم تغيير كلمة السر. يرجى تسجيل الدخول بها الآن.');
      }
    } catch (err: any) {
      setError(err.message || 'فشل استرجاع كلمة المرور');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-[#1a0a12] rounded-3xl max-w-md w-full shadow-2xl border border-amber-200/80 dark:border-[#4d1d2c] text-slate-900 dark:text-stone-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#18060f] via-[#2d0d1b] to-[#14050c] p-6 text-white text-center relative border-b border-[#3c1322]">
          <img 
            src="/church_logo.jpg" 
            alt="شعار كنيسة ماريوحنا المعمدان بالمعراج" 
            className="w-14 h-14 rounded-full object-cover ring-2 ring-churchgold-400 shadow-lg shadow-black/50 mx-auto mb-2.5"
            referrerPolicy="no-referrer"
          />
          <h2 className="text-lg font-extrabold tracking-tight text-stone-100">
            كنيسة ماريوحنا المعمدان بالمعراج
          </h2>
          <p className="text-xs text-churchgold-300 font-bold mt-0.5">
            {isChangingTempPass ? 'تغيير كلمة السر المؤقتة' : 'تسجيل الدخول لمنظومة الخدمة'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {isChangingTempPass ? (
            /* First Time Temp Password Change Form */
            <form onSubmit={handleChangeTempPassSubmit} className="space-y-4 text-xs font-medium text-slate-700">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-xs text-amber-900">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>كلمة سر مؤقتة من أمين الخدمة</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  أهلاً بك يا <strong>{currentUser?.name}</strong>! لقد دخلت باستخدام كلمة السر المؤقتة التي أنشأها أمين الخدمة العام. يرجى اختيار كلمة سر جديدة خاصة بك.
                </p>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-stone-200">كلمة السر الجديدة *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="أدخل كلمة السر الجديدة الخاصة بك"
                    className="w-full bg-slate-50 dark:bg-[#250d18] border border-amber-300 dark:border-[#4d1d2c] rounded-xl pr-3 pl-9 py-2.5 text-sm font-semibold text-slate-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-stone-200">تأكيد كلمة السر الجديدة *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد كتابة كلمة السر الجديدة"
                    className="w-full bg-slate-50 dark:bg-[#250d18] border border-amber-300 dark:border-[#4d1d2c] rounded-xl pr-3 pl-9 py-2.5 text-sm font-semibold text-slate-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {tempPassSuccess ? (
                <div className="p-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>تم حفظ كلمة السر الجديدة بنجاح! جاري تحويلك...</span>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-burgundy-700 to-burgundy-800 hover:from-burgundy-800 hover:to-burgundy-900 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 mt-2 cursor-pointer border border-churchgold-400/30"
                >
                  <ShieldCheck className="w-4 h-4 text-churchgold-300" />
                  <span>حفظ كلمة السر والدخول</span>
                </button>
              )}
            </form>
          ) : isForgotPass ? (
            /* Forgot Password Form */
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 text-xs font-medium text-slate-700">
              <div className="p-3 bg-amber-50 dark:bg-[#28131e] border border-amber-300 dark:border-[#4d1d2c] rounded-2xl text-amber-950 dark:text-churchgold-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-xs text-amber-950 dark:text-churchgold-200">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>استرجاع أو تعيين كلمة سر جديدة</span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-stone-300 leading-relaxed">
                  اختر اسم مستخدم حسابك ثم اكتب كلمة السر الجديدة التي ترغب في تعيينها مباشرة.
                </p>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-stone-200">اختر أو اكتب اسم المستخدم *</label>
                <div className="relative">
                  <select
                    value={forgotUsername}
                    onChange={(e) => setForgotUsername(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#250d18] border border-amber-300 dark:border-[#4d1d2c] rounded-xl pr-3 pl-9 py-2.5 text-xs font-bold text-slate-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
                  >
                    <option value="">-- اختر حسابك من القائمة --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.username}>
                        {u.name} (@{u.username}) - {u.assignedStage}
                      </option>
                    ))}
                  </select>
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                <div className="mt-1.5">
                  <input
                    type="text"
                    value={forgotUsername}
                    onChange={(e) => setForgotUsername(e.target.value)}
                    placeholder="أو اكتب اسم المستخدم يدوياً (مثال: admin)"
                    className="w-full bg-slate-50 dark:bg-[#250d18] border border-amber-300 dark:border-[#4d1d2c] rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-stone-200">كلمة السر الجديدة المطلوب تعيينها *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={forgotNewPass}
                    onChange={(e) => setForgotNewPass(e.target.value)}
                    placeholder="أدخل كلمة السر الجديدة"
                    className="w-full bg-slate-50 dark:bg-[#250d18] border border-amber-300 dark:border-[#4d1d2c] rounded-xl pr-3 pl-9 py-2.5 text-sm font-semibold text-slate-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {forgotSuccess ? (
                <div className="p-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>تم تحديث كلمة السر وتطبيقاها للحساب بنجاح! جاري تحويلك...</span>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-burgundy-700 to-burgundy-800 hover:from-burgundy-800 hover:to-burgundy-900 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 cursor-pointer border border-churchgold-400/30"
                  >
                    <ShieldCheck className="w-4 h-4 text-churchgold-300" />
                    <span>حفظ كلمة السر الجديدة والدخول</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPass(false);
                      setError(null);
                    }}
                    className="w-full py-2 bg-stone-100 dark:bg-[#250d18] hover:bg-stone-200 text-slate-700 dark:text-stone-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    العودة لشاشة الدخول العادية
                  </button>
                </div>
              )}
            </form>
          ) : (
            /* Standard Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-medium text-slate-700 dark:text-stone-300">
              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-stone-200">اسم المستخدم *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="مثال: admin أو mina_amin"
                    className="w-full bg-slate-50 dark:bg-[#250d18] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl pr-3 pl-9 py-2.5 text-sm font-semibold text-slate-900 dark:text-stone-100 placeholder-slate-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-burgundy-600/30 focus:border-burgundy-600"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-800 dark:text-stone-200">كلمة السر *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPass(true);
                      setError(null);
                    }}
                    className="text-[11px] font-bold text-burgundy-700 dark:text-churchgold-400 hover:underline cursor-pointer"
                  >
                    نسيت كلمة السر؟
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة السر"
                    className="w-full bg-slate-50 dark:bg-[#250d18] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl pr-3 pl-9 py-2.5 text-sm font-semibold text-slate-900 dark:text-stone-100 placeholder-slate-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-burgundy-600/30 focus:border-burgundy-600"
                  />
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-[#240c17] border border-amber-200/80 dark:border-[#461928] space-y-1 text-[11px] text-slate-600 dark:text-stone-300">
                <span className="font-bold text-slate-800 dark:text-churchgold-300 block">💡 ملاحظة الأمان:</span>
                <p>الحسابات يتم إنشاؤها فقط عن طريق <strong>أمين الخدمة العام</strong> مع كلمة سر مؤقتة. يتم تغييرها عند أول دخول.</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-burgundy-700 to-burgundy-800 hover:from-burgundy-800 hover:to-burgundy-900 text-white font-bold rounded-xl shadow-lg shadow-burgundy-950/30 border border-churchgold-400/40 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>دخول لحسابي</span>
                <ArrowRight className="w-4 h-4 rotate-180 text-churchgold-300" />
              </button>

              <div className="pt-3 text-center">
                <p className="text-[11px] text-slate-500 dark:text-stone-400">
                  كنيسة القديس يوحنا المعمدان بالمعراج
                </p>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
