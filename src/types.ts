export type Role = 'khadem' | 'amin_fasl' | 'amin_khedma_am';

export type ThemeMode = 'light' | 'dark';

export type Stage = string;

export interface AssistantSupervisor {
  name: string;
  phone?: string;
}

export interface StageItem {
  id: string;
  name: string;
  description?: string;
  supervisorName?: string; // اسم أمين الخدمة / أمين المرحلة
  supervisorPhone?: string; // تليفون أمين الخدمة
  assistantSupervisors?: AssistantSupervisor[]; // مساعدو أمين الخدمة
  captainName?: string; // للتوافق العكسي
  captainPhone?: string;
  firstMateName?: string; // للتوافق العكسي
  firstMatePhone?: string;
  meetingTime?: string; // موعد الخدمة / القداس
  isCustom?: boolean;
}

export interface AppUser {
  id: string;
  username: string;
  name: string;
  role: Role;
  assignedStage: Stage;
  assignedStages?: Stage[]; // مراحل الخدمة المتعددة التي يخدم بها
  isTempPassword?: boolean;
  password?: string; // مشفر بـ SHA-256
  passwordHash?: string; // التشفير الصريح لكلمة السر
  phone?: string;
  job?: string;
  area?: string;
  birthDate?: string;
  notes?: string;
  canManageSupervisors?: boolean; // صلاحية خاصة لتعديل وتسكين أمين خدمة بالتحقق الأمني
  isAuthorizedAdmin?: boolean; // مفوض إدارياً لإدارة الحسابات
  createdAt?: string;
}

export interface ChurchEventNotification {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time?: string;
  targetStage: Stage; // 'عامة' for all or specific Stage
  type: 'event' | 'alert' | 'spiritual' | 'meeting';
  createdBy?: string;
  createdAt?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Child {
  id: string;
  name: string;
  stage: Stage; // المرحلة الأساسية
  age: number;
  birthDate: string; // YYYY-MM-DD (تاريخ الميلاد كاملاً)
  birthMonth: number; // 1-12
  area?: string; // المنطقة (اختياري / ملغي)
  phone: string; // رقم تلفون الولد
  // بيانات ولي الأمر الأول (الأساسي)
  parentName: string; // اسم ولي الأمر الأول
  parentRelation?: string; // صلة القرابة (أب، والد، جد...)
  parentPhone: string; // رقم تليفون ولي الأمر الأول
  parentJob?: string; // وظيفة ولي الأمر الأول (اختياري)
  // بيانات ولي الأمر الثاني (ولي أمر آخر إضافي / احتياطي)
  parent2Name?: string; // اسم ولي الأمر الثاني
  parent2Relation?: string; // صلة القرابة (أم، والدة، جدة...)
  parent2Phone?: string; // رقم تليفون ولي الأمر الثاني
  parent2Job?: string; // وظيفة ولي الأمر الثاني (اختياري)
  address?: string;
  notes?: string;
  gender: 'boy' | 'girl';
  secondaryStages?: Stage[]; // مراحل وأنشطة إضافية للمخدوم (مثل: كورال، شمامسة، نادي، إلخ)
  createdAt: string;
}

export interface Servant {
  id: string;
  name: string;
  assignedStage: Stage; // المرحلة الأساسية
  assignedStages?: Stage[]; // المراحل المتعددة التي يخدم بها الخادم
  area?: string;
  phone: string;
  job?: string;
  birthDate: string;
  birthMonth: number;
  roleTitle?: string; // أمين مرحلة / أمين مساعد / خادم مرحلة / خادم عام
  roleType?: 'captain' | 'first_mate' | 'crew' | 'general_dock'; // الدور التنظيمي
  email?: string;
  notes?: string;
  createdAt: string;
}

export interface Supervisor {
  id: string;
  name: string;
  supervisedStage?: Stage;
  assignedStage?: Stage;
  title?: string;
  isAssistant?: boolean; // هل هو مساعد أمين خدمة
  roleType?: 'supervisor' | 'assistant_supervisor';
  area?: string;
  phone: string;
  job?: string; // الوظيفة
  birthDate?: string;
  birthMonth?: number;
  email?: string;
  notes?: string;
  createdAt: string;
}

export type BookCategory = 'khedma' | 'mahrajan' | 'aqeda_taqs' | 'bible' | string;

export interface Book {
  id: string;
  title: string;
  category: BookCategory; // كتب الخدمة، المهرجان، العقيدة والطقس، الكتاب المقدس
  targetStage: Stage; // المرحلة الرئيسية للتوافق
  targetStages?: Stage[]; // المراحل التي يظهر لها هذا الكتاب (يمكن أن يظهر لأكثر من مرحلة أو عامة)
  author?: string;
  year?: string;
  description: string;
  contentSummary?: string; // ملخص المحتوى أو الفصول
  pdfUrl?: string; // Data URL أو رابط ملف الـ PDF
  pdfFileName?: string; // اسم ملف الـ PDF المرفق
  pdfFileSize?: string; // حجم ملف الـ PDF
  coverImage?: string; // Data URL أو رابط صورة غلاف الكتاب
  fileUrl?: string; // للتوافق العكسي
  coverBg?: string; // لون الغلاف للواجهة
  pageCount?: number;
}

export type ChildEventType = 'mass' | 'sunday_school' | 'festival';
export type StaffEventType = 'mass' | 'sunday_school' | 'general_meeting' | 'supervisors_meeting';
export type EventType = ChildEventType | StaffEventType;

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  targetType: 'child' | 'servant' | 'supervisor';
  eventType: ChildEventType | StaffEventType;
  records: Record<string, { status: AttendanceStatus; note?: string }>; // personId -> status & note
}

export interface FilterState {
  searchQuery: string; // searches name, area, phone, parent phone, parent name, job
  stageFilter: string; // 'all' or specific stage
  birthMonthFilter: string; // 'all' or 1..12
  ageFilter: string; // 'all' or age
  areaFilter: string; // 'all' or specific area
}
