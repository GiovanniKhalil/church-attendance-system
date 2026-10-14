import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Lock, User, KeyRound, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, 
  Cross, Sparkles, BookOpen, Users, Calendar, Cake, Eye, EyeOff, LogIn, UserPlus,
  Briefcase, Phone, MapPin, Anchor, Ship, Crown, UserCheck
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { PWAInstallBanner } from './PWAInstallBanner';
import { AREAS } from '../data/mockData';
import { validateUsername } from '../utils/cryptoUtils';

export const LoginPage: React.FC = () => {
  const { login, registerServant, changePassword, currentUser, stagesList, users } = useApp();

  // Mode: Default to 'register' per requirement (first open opens on registration page)
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');

  // Login Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [usernameWarning, setUsernameWarning] = useState<string | null>(null);
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBirthDate, setRegBirthDate] = useState('1996-01-01');
  const [regNotes, setRegNotes] = useState('');

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim()) {
      setError('يرجى إدخال اسم الخادم بالكامل');
      return;
    }
    
    // Strict Username format & uniqueness validation
    const usernameValidation = validateUsername(regUsername, users);
    if (!usernameValidation.valid) {
      setError(usernameValidation.error || 'اسم المستخدم غير مقبول');
      return;
    }

    if (!regPassword.trim() || regPassword.length < 4) {
      setError('كلمة السر يجب ألا تقل عن 4 خانات');
      return;
    }
    if (!regPhone.trim()) {
      setError('يرجى إدخال رقم هاتف الخادم للتواصل والمتابعة');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerServant({
        name: regName.trim(),
        username: regUsername.trim(),
        password: regPassword.trim(),
        phone: regPhone.trim(),
        birthDate: regBirthDate,
        assignedStage: 'في انتظار التعيين',
        notes: regNotes.trim()
      });

      if (!res.success) {
        setError(res.error || 'فشل تسجيل حساب الخادم');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('يرجى كتابة اسم المستخدم أو رقم الهاتف وكلمة السر');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(username, password);
      if (!res.success) {
        setError(res.error || 'اسم المستخدم أو كلمة السر غير صحيحة');
        return;
      }

      if (res.isTemp) {
        setIsChangingTempPass(true);
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
        }, 1000);
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

    if (!forgotUsername.trim()) {
      setError('يرجى كتابة اسم المستخدم أو رقم الهاتف المسجل');
      return;
    }

    if (!forgotNewPass.trim() || forgotNewPass.length < 4) {
      setError('يرجى كتابة كلمة سر جديدة (4 أحرف أو أرقام على الأقل)');
      return;
    }

    setIsSubmitting(true);
    try {
      const loginRes = await login(forgotUsername.trim(), forgotNewPass);
      if (loginRes.success) {
        setForgotSuccess(true);
        setTimeout(() => {
          setIsForgotPass(false);
          setForgotSuccess(false);
        }, 1000);
      } else {
        // Attempt update directly
        setError('يرجى التأكد من اسم المستخدم أو التواصل مع أمين الخدمة العام لإعادة تعيين كلمة السر.');
      }
    } catch (err: any) {
      setError(err.message || 'فشل استرجاع كلمة المرور');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6f0] dark:bg-[#0e0307] text-slate-900 dark:text-stone-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-['Cairo',sans-serif] relative overflow-hidden" dir="rtl">
      
      {/* PWA App Install Banner */}
      <div className="w-full fixed top-0 left-0 right-0 z-30">
        <PWAInstallBanner />
      </div>

      {/* Top Floating Controls (Theme Toggle) */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center gap-2">
        <ThemeToggle variant="pill" />
      </div>

      {/* Background Decorative Lighting Circles */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-burgundy-600/15 dark:bg-burgundy-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-churchgold-500/15 dark:bg-churchgold-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Single Centered Card */}
      <div className="max-w-xl w-full bg-white dark:bg-[#180710] text-slate-950 dark:text-stone-100 rounded-3xl shadow-xl border border-stone-200 dark:border-[#381120] overflow-hidden p-6 sm:p-8 z-10 my-6 transition-colors duration-200">
        
        {/* Top Header with Church Logo & Name */}
        <div className="flex flex-col items-center text-center pb-5 mb-5 border-b border-stone-200 dark:border-[#2e0e1b]">
          <div className="relative mb-3">
            <img 
              src="/church_logo.jpg" 
              alt="شعار كنيسة ماريوحنا المعمدان بالمعراج" 
              className="w-20 h-20 rounded-full object-cover ring-2 ring-churchgold-400 shadow-md shadow-black/20" 
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="font-black text-xl sm:text-2xl text-burgundy-950 dark:text-churchgold-200 leading-tight">
            كنيسة ماريوحنا بالمعراج
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-churchgold-300 font-bold mt-1">
            التربية الكنسية ومدارس الأحد • خدمة ماريوحنا
          </p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold mt-0.5">
            مطرانية المعادي للأقباط الأرثوذكس
          </p>
        </div>

        {/* Main Auth Toggle (Register vs Login) */}
        {!isChangingTempPass && !isForgotPass && (
          <div className="flex items-center p-1 bg-stone-100 dark:bg-[#220a16] rounded-2xl border border-stone-200 dark:border-[#381120] mb-5">
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'register'
                  ? 'bg-gradient-to-r from-burgundy-800 to-burgundy-950 text-white shadow-md border border-churchgold-400/40'
                  : 'text-slate-700 dark:text-stone-300 hover:text-burgundy-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4 text-churchgold-300" />
              <span>تسجيل خادم جديد</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'login'
                  ? 'bg-gradient-to-r from-burgundy-800 to-burgundy-950 text-white shadow-md border border-churchgold-400/40'
                  : 'text-slate-700 dark:text-stone-300 hover:text-burgundy-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4 text-churchgold-300" />
              <span>تسجيل الدخول</span>
            </button>
          </div>
        )}

          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
              {isChangingTempPass 
                ? 'تغيير كلمة السر المؤقتة 🔑' 
                : isForgotPass 
                ? 'استرجاع كلمة السر 🔒' 
                : authMode === 'register' 
                ? 'تسجيل بيانات خادم جديد 👋' 
                : 'تسجيل الدخول للخدمة ✨'}
            </h2>
            <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-stone-100 mt-1">
              {isChangingTempPass 
                ? 'أدخل كلمة سر جديدة لحسابك المرة الأولى' 
                : isForgotPass 
                ? 'اكتب اسم حسابك أو رقم هاتفك لتحديد كلمة سر جديدة' 
                : authMode === 'register'
                ? 'سجل بياناتك الشخصية كخادم للبدء فوراً (يتم تسكين الخدمة بواسطة أمين الخدمة العام)'
                : 'أدخل اسم المستخدم أو رقم الهاتف وكلمة السر المعتمدة'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-500 text-rose-950 text-xs sm:text-sm font-black flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-700" />
              <span>{error}</span>
            </div>
          )}



          {/* VIEW 1: First Time Temp Password */}
          {isChangingTempPass ? (
            <form onSubmit={handleChangeTempPassSubmit} className="space-y-4 text-xs font-medium text-slate-700">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-xs text-amber-950">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>كلمة سر مؤقتة</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  أهلاً بك يا <strong>{currentUser?.name}</strong>! لقد دخلت باستخدام كلمة سر مؤقتة. يرجى كتابة كلمة السر الجديدة الخاصة بك.
                </p>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800">كلمة السر الجديدة *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="أدخل كلمة السر الجديدة الخاصة بك"
                    className="w-full bg-white border border-slate-200 rounded-xl pr-3 pl-9 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-burgundy-500/20"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800">تأكيد كلمة السر الجديدة *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد كتابة كلمة السر الجديدة"
                    className="w-full bg-white border border-slate-200 rounded-xl pr-3 pl-9 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-burgundy-500/20"
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
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-burgundy-700 to-burgundy-800 hover:from-burgundy-800 hover:to-burgundy-900 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-churchgold-300" />
                  <span>حفظ كلمة السر والدخول</span>
                </button>
              )}
            </form>
          ) : isForgotPass ? (
            /* VIEW 2: Forgot Password Form */
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 text-xs font-medium text-slate-700">
              <div className="p-3.5 bg-amber-50 dark:bg-[#28131d] border border-amber-200 dark:border-[#4d1d2c] rounded-2xl text-amber-950 dark:text-churchgold-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>تعيين كلمة سر جديدة لحسابك</span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-stone-400 leading-relaxed">
                  اكتب اسم المستخدم أو رقم هاتفك المسجل ثم حدد كلمة السر الجديدة للدخول بها مباشرة.
                </p>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-stone-200">اسم المستخدم أو رقم الهاتف المسجل *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={forgotUsername}
                    onChange={(e) => setForgotUsername(e.target.value)}
                    placeholder="مثال: bishoy أو 01234567890"
                    className="w-full bg-white dark:bg-[#250d18] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl pr-3 pl-9 py-2.5 text-xs font-semibold text-slate-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
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
                    className="w-full bg-white dark:bg-[#250d18] border border-amber-200/80 dark:border-[#4d1d2c] rounded-xl pr-3 pl-9 py-2.5 text-sm font-semibold text-slate-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy-600/30"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                </div>
              </div>

              {forgotSuccess ? (
                <div className="p-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>تم تحديث كلمة السر والدخول بنجاح! جاري تحويلك...</span>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-burgundy-700 to-burgundy-800 hover:from-burgundy-800 hover:to-burgundy-900 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
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
                    className="w-full py-2.5 bg-slate-200 dark:bg-[#290d19] hover:bg-slate-300 text-slate-800 dark:text-stone-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    العودة لشاشة الدخول العادية
                  </button>
                </div>
              )}
            </form>
          ) : authMode === 'register' ? (
            /* VIEW 3: Registration Form (DEFAULT ON APP OPEN) */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs font-medium text-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-black mb-1 text-slate-950 dark:text-stone-100">الاسم الرباعي للخادم *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="مثال: مينا كمال بشري"
                      className="w-full bg-white dark:bg-[#250d18] border-2 border-amber-300 dark:border-[#4d1d2c] rounded-xl pr-3 pl-9 py-2.5 text-xs sm:text-sm font-bold text-slate-950 dark:text-stone-100 placeholder:text-slate-500 dark:placeholder:text-stone-400 focus:outline-none focus:border-burgundy-700 dark:focus:border-churchgold-400"
                    />
                    <User className="w-4 h-4 text-burgundy-800 dark:text-churchgold-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-black mb-1 text-slate-950 dark:text-stone-100">
                    اسم المستخدم للدخول (Username) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\s+/g, '');
                        setRegUsername(raw);
                      }}
                      placeholder="مثال: mina_kamal أو peter.ashraf"
                      className="w-full bg-white dark:bg-[#250d18] border-2 border-amber-300 dark:border-[#4d1d2c] rounded-xl pr-3 pl-9 py-2.5 text-xs sm:text-sm font-bold text-slate-950 dark:text-stone-100 placeholder:text-slate-500 dark:placeholder:text-stone-400 focus:outline-none focus:border-burgundy-700 dark:focus:border-churchgold-400"
                    />
                    <ShieldCheck className="w-4 h-4 text-burgundy-800 dark:text-churchgold-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-black mb-1 text-slate-950 dark:text-stone-100">كلمة السر *</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="اختر كلمة سر لحسابك"
                      className="w-full bg-white dark:bg-[#250d18] border-2 border-amber-300 dark:border-[#4d1d2c] rounded-xl pr-3 pl-9 py-2.5 text-xs sm:text-sm font-bold text-slate-950 dark:text-stone-100 placeholder:text-slate-500 dark:placeholder:text-stone-400 focus:outline-none focus:border-burgundy-700 dark:focus:border-churchgold-400"
                    />
                    <Lock className="w-4 h-4 text-burgundy-800 dark:text-churchgold-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-black mb-1 text-slate-950 dark:text-stone-100">رقم الهاتف / الواتساب *</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="01xxxxxxxxx"
                      className="w-full bg-white dark:bg-[#250d18] border-2 border-amber-300 dark:border-[#4d1d2c] rounded-xl pr-3 pl-9 py-2.5 text-xs sm:text-sm font-mono font-bold text-slate-950 dark:text-stone-100 placeholder:text-slate-500 dark:placeholder:text-stone-400 focus:outline-none focus:border-burgundy-700 dark:focus:border-churchgold-400"
                    />
                    <Phone className="w-4 h-4 text-burgundy-800 dark:text-churchgold-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-black mb-1 text-slate-950 dark:text-stone-100">تاريخ الميلاد (لتنبيهات أعياد الميلاد الكنسية)</label>
                <input
                  type="date"
                  value={regBirthDate}
                  onChange={(e) => setRegBirthDate(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-[#220a16] border border-stone-300 dark:border-[#3d1323] rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-950 dark:text-stone-100 focus:outline-none focus:border-burgundy-700"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-burgundy-800 via-burgundy-900 to-burgundy-950 hover:from-burgundy-900 hover:to-black text-white font-black rounded-xl shadow-md transition-all text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                <UserPlus className="w-5 h-5 text-churchgold-300" />
                <span>تسجيل حساب خادم جديد والدخول للمنظومة</span>
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setError(null);
                  }}
                  className="text-xs font-bold text-burgundy-800 dark:text-churchgold-400 hover:underline cursor-pointer"
                >
                  لديك حساب خادم مسجل بالفعل؟ اضغط هنا لتسجيل الدخول
                </button>
              </div>
            </form>
          ) : (
            /* VIEW 4: Standard Clean Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-medium text-slate-800">
              <div>
                <label className="block text-xs sm:text-sm font-black mb-1.5 text-slate-950 dark:text-stone-100">اسم المستخدم أو رقم الهاتف *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="أدخل اسم المستخدم أو رقم هاتفك"
                    className="w-full bg-stone-50 dark:bg-[#220a16] border border-stone-300 dark:border-[#3d1323] rounded-xl pr-3.5 pl-10 py-3 text-sm font-bold text-slate-950 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-burgundy-700"
                  />
                  <User className="w-5 h-5 text-burgundy-800 dark:text-churchgold-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs sm:text-sm font-black text-slate-950 dark:text-stone-100">كلمة السر *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPass(true);
                      setError(null);
                    }}
                    className="text-xs font-black text-burgundy-800 dark:text-churchgold-400 hover:underline cursor-pointer"
                  >
                    نسيت كلمة السر؟
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة السر الخاصة بك"
                    className="w-full bg-stone-50 dark:bg-[#220a16] border border-stone-300 dark:border-[#3d1323] rounded-xl pr-3.5 pl-10 py-3 text-sm font-bold text-slate-950 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-burgundy-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-burgundy-800 via-burgundy-900 to-burgundy-950 hover:from-burgundy-900 hover:to-black text-white font-black rounded-xl shadow-md transition-all text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <LogIn className="w-5 h-5 text-churchgold-300" />
                <span>دخول لحسابي بالمنظومة</span>
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>

              <div className="pt-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setError(null);
                  }}
                  className="text-xs sm:text-sm font-black text-burgundy-800 dark:text-churchgold-400 hover:underline cursor-pointer"
                >
                  خادم جديد لأول مرة؟ اضغط هنا لإنشاء وتسجيل حسابك
                </button>
              </div>

              {/* Secure System Footer Note */}
              <div className="pt-4 border-t border-stone-200 dark:border-[#2e0e1b] text-center space-y-1">
                <p className="text-xs font-bold text-slate-800 dark:text-stone-300">
                  🔐 منظومة خدمة آمنة خاصة بخدام وقادة كنيسة القديس يوحنا المعمدان بالمعراج
                </p>
              </div>
            </form>
          )}

      </div>

    </div>
  );
};
