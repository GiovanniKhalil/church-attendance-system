import { Stage, AttendanceStatus, Role } from '../types';

/**
 * Provides distinct, consistent, high-contrast colors for stages,
 * statuses, roles, and categories across the entire church app.
 */

export function getStageBadgeClass(stage: Stage | string): string {
  switch (stage) {
    case 'حضانة':
      return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
    case 'ابتدائي (أولى وثانية)':
      return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    case 'ابتدائي (ثالثة ورابعة)':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    case 'ابتدائي (خامسة وسادسة)':
      return 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800';
    case 'إعدادي':
      return 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800';
    case 'ثانوي':
      return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
    case 'عامة':
    default:
      return 'bg-churchgold-100 text-churchgold-900 border-churchgold-300 dark:bg-churchgold-950/60 dark:text-churchgold-300 dark:border-churchgold-800';
  }
}

export function getStageBorderClass(stage: Stage | string): string {
  switch (stage) {
    case 'حضانة':
      return 'border-r-4 border-r-rose-500';
    case 'ابتدائي (أولى وثانية)':
      return 'border-r-4 border-r-amber-500';
    case 'ابتدائي (ثالثة ورابعة)':
      return 'border-r-4 border-r-emerald-500';
    case 'ابتدائي (خامسة وسادسة)':
      return 'border-r-4 border-r-teal-500';
    case 'إعدادي':
      return 'border-r-4 border-r-sky-500';
    case 'ثانوي':
      return 'border-r-4 border-r-purple-500';
    case 'عامة':
    default:
      return 'border-r-4 border-r-churchgold-500';
  }
}

export function getAttendanceBadgeClass(status: AttendanceStatus): string {
  switch (status) {
    case 'present':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700';
    case 'absent':
      return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-700';
    case 'late':
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700';
    case 'excused':
      return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-700';
    default:
      return 'bg-stone-100 text-stone-800 border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700';
  }
}

export function getAttendanceStatusLabel(status: AttendanceStatus): string {
  switch (status) {
    case 'present': return 'حاضر ✅';
    case 'absent': return 'غائب ❌';
    case 'late': return 'متأخر ⏳';
    case 'excused': return 'معتذر ✉️';
    default: return 'غير محدد';
  }
}

export function getRoleBadgeClass(role: Role): string {
  switch (role) {
    case 'amin_khedma_am':
      return 'bg-burgundy-900 text-churchgold-200 border-churchgold-400/50 shadow-xs dark:bg-[#20050e] dark:text-churchgold-300 dark:border-churchgold-500/50';
    case 'amin_fasl':
      return 'bg-churchgold-500/20 text-churchgold-800 border-churchgold-400/40 dark:bg-churchgold-950/50 dark:text-churchgold-300 dark:border-churchgold-600/50';
    case 'khadem':
    default:
      return 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/60';
  }
}

export function getRoleLabel(role: Role): string {
  switch (role) {
    case 'amin_khedma_am': return 'أمين الخدمة العام';
    case 'amin_fasl': return 'أمين فصل / مرحلة';
    case 'khadem': return 'خادم';
    default: return 'عضو خدمة';
  }
}

export function getBookCategoryBadgeClass(category: string): string {
  switch (category) {
    case 'khedma':
      return 'bg-burgundy-100 text-burgundy-900 border-burgundy-300 dark:bg-burgundy-950/70 dark:text-burgundy-200 dark:border-burgundy-800';
    case 'mahrajan':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800';
    case 'aqeda_taqs':
      return 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800';
    case 'bible':
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800';
    default:
      return 'bg-stone-100 text-stone-800 border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700';
  }
}
