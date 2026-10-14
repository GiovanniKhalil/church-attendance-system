import { Child, Servant, Supervisor, Book, AttendanceRecord, Stage, StageItem, AppUser, ChurchEventNotification } from '../types';

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'u_admin',
    username: 'admin',
    name: 'أ/ بيشوي جرجس',
    role: 'amin_khedma_am',
    assignedStage: 'عامة',
    isTempPassword: false,
    password: 'sha256:5e083407fa5280b8682f36a267e74182739b911da75219628f05ab592aa9417a', // encrypted '123'
    phone: '01223456789',
    createdAt: '2025-01-01'
  },
  {
    id: 'u_amin_hadana',
    username: 'hadana_amin',
    name: 'أ/ مريم فؤاد',
    role: 'amin_fasl',
    assignedStage: 'حضانة',
    isTempPassword: false,
    password: 'sha256:5e083407fa5280b8682f36a267e74182739b911da75219628f05ab592aa9417a', // encrypted '123'
    phone: '01201122334',
    createdAt: '2025-01-10'
  },
  {
    id: 'u_amin_elem12',
    username: 'elem12_amin',
    name: 'خ/ هاني نصيف',
    role: 'amin_fasl',
    assignedStage: 'ابتدائي (أولى وثانية)',
    isTempPassword: false,
    password: 'sha256:5e083407fa5280b8682f36a267e74182739b911da75219628f05ab592aa9417a', // encrypted '123'
    phone: '01011223344',
    createdAt: '2025-01-12'
  },
  {
    id: 'u_khadem_elem34',
    username: 'peter_khadem',
    name: 'خ/ بيتر أشرف',
    role: 'amin_fasl',
    assignedStage: 'ابتدائي (ثالثة ورابعة)',
    isTempPassword: false,
    password: 'sha256:5e083407fa5280b8682f36a267e74182739b911da75219628f05ab592aa9417a', // encrypted '123'
    phone: '01144556677',
    createdAt: '2025-02-15'
  },
  {
    id: 'u_amin_elem56',
    username: 'elem56_amin',
    name: 'أ/ هاني توفيق',
    role: 'amin_fasl',
    assignedStage: 'ابتدائي (خامسة وسادسة)',
    isTempPassword: false,
    password: 'sha256:5e083407fa5280b8682f36a267e74182739b911da75219628f05ab592aa9417a', // encrypted '123'
    phone: '01222334455',
    createdAt: '2025-02-01'
  },
  {
    id: 'u_amin_prep',
    username: 'mina_amin',
    name: 'أ/ مينا عادل',
    role: 'amin_fasl',
    assignedStage: 'إعدادي',
    isTempPassword: false,
    password: 'sha256:5e083407fa5280b8682f36a267e74182739b911da75219628f05ab592aa9417a', // encrypted '123'
    phone: '01009876543',
    createdAt: '2025-02-10'
  },
  {
    id: 'u_khadem_sec',
    username: 'bishoy_khadem',
    name: 'خ/ بيشوي نادري',
    role: 'khadem',
    assignedStage: 'ثانوي',
    isTempPassword: false,
    password: 'sha256:5e083407fa5280b8682f36a267e74182739b911da75219628f05ab592aa9417a', // encrypted '123'
    phone: '01233445566',
    createdAt: '2025-02-20'
  },
  {
    id: 'u_giovanni_ayman',
    username: 'Giovanni_Ayman',
    name: 'جيوفاني أيمن سمير',
    role: 'khadem',
    assignedStage: 'عامة',
    canManageSupervisors: true,
    isAuthorizedAdmin: true,
    isTempPassword: false,
    password: 'sha256:5e083407fa5280b8682f36a267e74182739b911da75219628f05ab592aa9417a', // encrypted '123'
    phone: '01203385601',
    notes: 'مفوض إدارياً بالتحقق الأمني لتعديل وتسكين أمين خدمة جديد',
    createdAt: '2025-03-01'
  }
];

export const INITIAL_NOTIFICATIONS: ChurchEventNotification[] = [
  {
    id: 'n1',
    title: 'افتتاح مهرجان الكرازة المرقسية 2026',
    description: 'يبدأ استلام كتب المهرجان والتسجيل في الأنشطة والمسابقات الطقسية والألحان يوم الجمعة القادم بعد القداس مباشرة.',
    date: '2026-08-01',
    time: '10:30 صباحاً',
    targetStage: 'عامة',
    type: 'event',
    createdBy: 'أمين الخدمة العام',
    createdAt: '2026-07-20'
  },
  {
    id: 'n2',
    title: 'اجتماع تحضير خلوة مرحلة إعدادي',
    description: 'تنبيه هام لخدام وأمين فصل مرحلة إعدادي لحضور اجتماع الترتيب النهائي لخلوة الصيف بدير القديس أنبا بيشوي.',
    date: '2026-07-30',
    time: '07:00 مساءً',
    targetStage: 'إعدادي',
    type: 'meeting',
    createdBy: 'أمين فصل إعدادي',
    createdAt: '2026-07-22'
  },
  {
    id: 'n3',
    title: 'رحلة أطفال ابتدائي (ثالثة ورابعة)',
    description: 'تجميع اشتراكات وموافقات أولياء الأمور لرحلة دير الملاك وجولة الألعاب الكنسية.',
    date: '2026-08-05',
    time: '06:00 صباحاً',
    targetStage: 'ابتدائي (ثالثة ورابعة)',
    type: 'event',
    createdBy: 'خ/ بيتر أشرف',
    createdAt: '2026-07-24'
  },
  {
    id: 'n4',
    title: 'قداس إلهي خاص بخدام الكنيسة',
    description: 'قداس الصوم والمناولة لجميع الخدام وأمناء الفصول بجميع المراحل مع كلمة روحية للقدس الأب الكاهن.',
    date: '2026-08-07',
    time: '07:00 صباحاً',
    targetStage: 'عامة',
    type: 'spiritual',
    createdBy: 'أمين الخدمة العام',
    createdAt: '2026-07-25'
  },
  {
    id: 'n5',
    title: 'يوم ترفيهي لأطفال مرحلة حضانة',
    description: 'يوم مسابقات وألعاب ملونة ومسرح عرائس لأطفال حضانة في قاعة الكنيسة الكبرى.',
    date: '2026-08-03',
    time: '04:00 مساءً',
    targetStage: 'حضانة',
    type: 'event',
    createdBy: 'أ/ مريم فؤاد',
    createdAt: '2026-07-26'
  },
  {
    id: 'n6',
    title: 'مؤتمر شباب مرحلة ثانوي - اعترف وافرح',
    description: 'بدء التسجيل لمؤتمر ثانوي السنوي ببيت بيت عنيا بوادي النطرون، يتضمن ورش عمل ومجموعات مناقشة.',
    date: '2026-08-12',
    time: '08:00 صباحاً',
    targetStage: 'ثانوي',
    type: 'spiritual',
    createdBy: 'خ/ بيشوي نادري',
    createdAt: '2026-07-26'
  }
];

export const INITIAL_CHILDREN: Child[] = [
  // --- مرحلة حضانة ---
  {
    id: 'c_had1',
    name: 'يوسف مينا رمزي',
    stage: 'حضانة',
    age: 4,
    birthDate: '2022-03-15',
    birthMonth: 3,
    area: 'شبرا - مسرة',
    phone: '01201234567',
    parentName: 'مينا رمزي توفيق',
    parentRelation: 'الأب',
    parentPhone: '01201234567',
    parentJob: 'مهندس اتصالات',
    parent2Name: 'سارة منير جرجس',
    parent2Relation: 'الأم',
    parent2Phone: '01099887711',
    parent2Job: 'معلمة رياض أطفال',
    notes: 'مواظب جداً، يحب التلوين والترانيم',
    gender: 'boy',
    createdAt: '2025-01-05'
  },
  {
    id: 'c_had2',
    name: 'مارينا شنودة نسيم',
    stage: 'حضانة',
    age: 5,
    birthDate: '2021-08-20',
    birthMonth: 8,
    area: 'شبرا - دوران شبرا',
    phone: '01011223344',
    parentName: 'شنودة نسيم صليب',
    parentRelation: 'الأب',
    parentPhone: '01011223344',
    parentJob: 'طبيب بشري',
    parent2Name: 'مريم عادل أسعد',
    parent2Relation: 'الأم',
    parent2Phone: '01223344551',
    parent2Job: 'صيدلانية',
    notes: 'حفظت صلاة الأبانا بالكامل',
    gender: 'girl',
    createdAt: '2025-01-08'
  },
  {
    id: 'c_had3',
    name: 'أنطون صموئيل فرج',
    stage: 'حضانة',
    age: 5,
    birthDate: '2021-11-10',
    birthMonth: 11,
    area: 'الزيتون',
    phone: '01122334455',
    parentName: 'صموئيل فرج حليم',
    parentRelation: 'الأب',
    parentPhone: '01122334455',
    parentJob: 'محاسب قانوني',
    parent2Name: 'جاكلين رأفت صبحي',
    parent2Relation: 'الأم',
    parent2Phone: '01044332211',
    parent2Job: 'ربة منزل',
    notes: 'ذكاء شديد وحركة نشيطة',
    gender: 'boy',
    createdAt: '2025-02-01'
  },

  // --- ابتدائي (أولى وثانية) ---
  {
    id: 'c_e12_1',
    name: 'دانيال رأفت ملاك',
    stage: 'ابتدائي (أولى وثانية)',
    age: 7,
    birthDate: '2019-05-18',
    birthMonth: 5,
    area: 'حدائق القبة',
    phone: '01233445566',
    parentName: 'رأفت ملاك صبحي',
    parentRelation: 'الأب',
    parentPhone: '01233445566',
    parentJob: 'مدير مبيعات',
    parent2Name: 'هالة نظمي وهبة',
    parent2Relation: 'الأم',
    parent2Phone: '01188776655',
    parent2Job: 'مهندسة معمارية',
    notes: 'شماس بالمرتبة الأولى ومواظب على القداس',
    gender: 'boy',
    createdAt: '2025-01-10'
  },
  {
    id: 'c_e12_2',
    name: 'كاراس هاني نصيف',
    stage: 'ابتدائي (أولى وثانية)',
    age: 6,
    birthDate: '2020-01-04',
    birthMonth: 1,
    area: 'شبرا - روض الفرج',
    phone: '01044556677',
    parentName: 'هاني نصيف جرجس',
    parentRelation: 'الأب',
    parentPhone: '01044556677',
    parentJob: 'صاحب شركة تجارية',
    parent2Name: 'شيري مكرم ناشد',
    parent2Relation: 'الأم',
    parent2Phone: '01211223388',
    parent2Job: 'طبيبة أسنان',
    notes: 'صوت جميل في ألحان الكنيسة',
    gender: 'boy',
    createdAt: '2025-01-15'
  },
  {
    id: 'c_e12_3',
    name: 'فيرونيكا عماد شحاتة',
    stage: 'ابتدائي (أولى وثانية)',
    age: 7,
    birthDate: '2019-09-30',
    birthMonth: 9,
    area: 'العباسية',
    phone: '01155667788',
    parentName: 'عماد شحاتة زكي',
    parentRelation: 'الأب',
    parentPhone: '01155667788',
    parentJob: 'محامي حر',
    parent2Name: 'سلفيا سمير غطاس',
    parent2Relation: 'الأم',
    parent2Phone: '01022334499',
    parent2Job: 'معلمة لغة فرنسية',
    notes: 'تشارك في فريق كورال الأطفال',
    gender: 'girl',
    createdAt: '2025-02-05'
  },

  // --- ابتدائي (ثالثة ورابعة) ---
  {
    id: 'c1',
    name: 'مينا كيرلس شفيق',
    stage: 'ابتدائي (ثالثة ورابعة)',
    age: 9,
    birthDate: '2017-07-12',
    birthMonth: 7,
    area: 'شبرا - مسرة',
    phone: '01223456789',
    parentName: 'كيرلس شفيق حليم',
    parentRelation: 'الأب',
    parentPhone: '01012345678',
    parentJob: 'مهندس برمجيات',
    parent2Name: 'إيفون بطرس سوريال',
    parent2Relation: 'الأم',
    parent2Phone: '01234567890',
    parent2Job: 'أخصائية تحاليل طبية',
    notes: 'مواظب على ألحان الكنيسة وشماس',
    gender: 'boy',
    createdAt: '2025-01-10'
  },
  {
    id: 'c2',
    name: 'سارة ملاك صبحي',
    stage: 'ابتدائي (ثالثة ورابعة)',
    age: 10,
    birthDate: '2016-03-24',
    birthMonth: 3,
    area: 'شبرا - روض الفرج',
    phone: '01122334455',
    parentName: 'ملاك صبحي إبراهيم',
    parentRelation: 'الأب',
    parentPhone: '01298765432',
    parentJob: 'مدير بنك',
    parent2Name: 'دينا مجدي فوزي',
    parent2Relation: 'الأم',
    parent2Phone: '01066778811',
    parent2Job: 'مدرسة لغة عربية',
    notes: 'تارك بالنشاط الكنسي والكورال',
    gender: 'girl',
    createdAt: '2025-01-12'
  },
  {
    id: 'c3',
    name: 'ديفيد سامح رفعت',
    stage: 'ابتدائي (ثالثة ورابعة)',
    age: 9,
    birthDate: '2017-11-05',
    birthMonth: 11,
    area: 'حدائق القبة',
    phone: '01055667788',
    parentName: 'سامح رفعت حليم',
    parentRelation: 'الأب',
    parentPhone: '01055667788',
    parentJob: 'مهندس ديكور',
    parent2Name: 'نانسي منير بشاي',
    parent2Relation: 'الأم',
    parent2Phone: '01199884433',
    parent2Job: 'مصممة جرافيك',
    notes: 'يحتاج افتقاد دوري بسبب ظروف السفر',
    gender: 'boy',
    createdAt: '2025-01-18'
  },

  // --- ابتدائي (خامسة وسادسة) ---
  {
    id: 'c_e56_1',
    name: 'كيرلس بيتر عادل',
    stage: 'ابتدائي (خامسة وسادسة)',
    age: 11,
    birthDate: '2015-06-14',
    birthMonth: 6,
    area: 'مصر الجديدة',
    phone: '01266778899',
    parentName: 'بيتر عادل رزق',
    parentRelation: 'الأب',
    parentPhone: '01266778899',
    parentJob: 'رجل أعمال',
    parent2Name: 'كريستين فايز حنا',
    parent2Relation: 'الأم',
    parent2Phone: '01033445588',
    parent2Job: 'صيدلانية',
    notes: 'تفوق في مسابقة دراسات كتاب المهرجان',
    gender: 'boy',
    createdAt: '2025-01-20'
  },
  {
    id: 'c_e56_2',
    name: 'جوستينا مجدي فهيم',
    stage: 'ابتدائي (خامسة وسادسة)',
    age: 12,
    birthDate: '2014-02-18',
    birthMonth: 2,
    area: 'شبرا - دوران شبرا',
    phone: '01077889900',
    parentName: 'مجدي فهيم أنور',
    parentRelation: 'الأب',
    parentPhone: '01077889900',
    parentJob: 'أستاذ جامعي',
    parent2Name: 'ميرنا شفيق إسكندر',
    parent2Relation: 'الأم',
    parent2Phone: '01277665544',
    parent2Job: 'باحثة أكاديمية',
    notes: 'موهوبة في الرسم والأشغال اليدوية',
    gender: 'girl',
    createdAt: '2025-01-22'
  },
  {
    id: 'c_e56_3',
    name: 'أبانوب شريف خليل',
    stage: 'ابتدائي (خامسة وسادسة)',
    age: 11,
    birthDate: '2015-10-08',
    birthMonth: 10,
    area: 'الزيتون',
    phone: '01188990011',
    parentName: 'شريف خليل موسى',
    parentRelation: 'الأب',
    parentPhone: '01188990011',
    parentJob: 'محاسب بشركة بترول',
    parent2Name: 'هبة نعيم غطاس',
    parent2Relation: 'الأم',
    parent2Phone: '01055443322',
    parent2Job: 'ربة منزل',
    notes: 'حفظ طقس القداس الباسيلي',
    gender: 'boy',
    createdAt: '2025-02-02'
  },

  // --- مرحلة إعدادي ---
  {
    id: 'c4',
    name: 'بولا هاني نصحي',
    stage: 'إعدادي',
    age: 13,
    birthDate: '2013-08-19',
    birthMonth: 8,
    area: 'الزيتون',
    phone: '01233441122',
    parentName: 'هاني نصحي بشارة',
    parentRelation: 'الأب',
    parentPhone: '01233441122',
    parentJob: 'مهندس مدني',
    parent2Name: 'سوزان كمال لبيب',
    parent2Relation: 'الأم',
    parent2Phone: '01177665533',
    parent2Job: 'معلمة لغة إنجليزية',
    notes: 'شماس بالهيكل ومشارك بكورال الشباب',
    gender: 'boy',
    createdAt: '2025-01-15'
  },
  {
    id: 'c5',
    name: 'كريستينا نشأت وهبة',
    stage: 'إعدادي',
    age: 14,
    birthDate: '2012-12-01',
    birthMonth: 12,
    area: 'العباسية',
    phone: '01144552233',
    parentName: 'نشأت وهبة فوزي',
    parentRelation: 'الأب',
    parentPhone: '01144552233',
    parentJob: 'طبيب أطفال',
    parent2Name: 'رشا صبحي تاوضروس',
    parent2Relation: 'الأم',
    parent2Phone: '01088776644',
    parent2Job: 'طبيبة عيون',
    notes: 'متميزة في المسابقات البحثية والطقسية',
    gender: 'girl',
    createdAt: '2025-01-20'
  },
  {
    id: 'c6',
    name: 'توماس جورج عريان',
    stage: 'إعدادي',
    age: 13,
    birthDate: '2013-04-10',
    birthMonth: 4,
    area: 'مصر الجديدة',
    phone: '01099887766',
    parentName: 'جورج عريان سليمان',
    parentRelation: 'الأب',
    parentPhone: '01099887766',
    parentJob: 'مدير تسويق',
    parent2Name: 'مارتينا زكي حليم',
    parent2Relation: 'الأم',
    parent2Phone: '01244332211',
    parent2Job: 'مترجمة فورية',
    notes: 'يلعب كرة قدم بنادي الكنيسة',
    gender: 'boy',
    createdAt: '2025-02-05'
  },

  // --- مرحلة ثانوي ---
  {
    id: 'c_sec_1',
    name: 'أندرو وسيم ميخائيل',
    stage: 'ثانوي',
    age: 16,
    birthDate: '2010-09-12',
    birthMonth: 9,
    area: 'شبرا - مسرة',
    phone: '01299881122',
    parentName: 'وسيم ميخائيل بطرس',
    parentRelation: 'الأب',
    parentPhone: '01299881122',
    parentJob: 'مهندس ميكانيكا',
    parent2Name: 'جيهان فؤاد يعقوب',
    parent2Relation: 'الأم',
    parent2Phone: '01155442211',
    parent2Job: 'محاسبة بالبنك التجاري',
    notes: 'يقود اجتماع درس الكتاب للشباب',
    gender: 'boy',
    createdAt: '2025-01-25'
  },
  {
    id: 'c_sec_2',
    name: 'فيلومينا إبراهيم حلمي',
    stage: 'ثانوي',
    age: 17,
    birthDate: '2009-07-04',
    birthMonth: 7,
    area: 'العباسية',
    phone: '01011229988',
    parentName: 'إبراهيم حلمي غالي',
    parentRelation: 'الأب',
    parentPhone: '01011229988',
    parentJob: 'مدير موارد بشرية',
    parent2Name: 'إنجي نجيب صليب',
    parent2Relation: 'الأم',
    parent2Phone: '01288776633',
    parent2Job: 'أستاذة تاريخ كنسي',
    notes: 'مشاركة في اللجنة الإعلامية بالخدمة',
    gender: 'girl',
    createdAt: '2025-01-28'
  },
  {
    id: 'c_sec_3',
    name: 'كيرلس عاطف لبيب',
    stage: 'ثانوي',
    age: 15,
    birthDate: '2011-01-22',
    birthMonth: 1,
    area: 'حدائق القبة',
    phone: '01122338877',
    parentName: 'عاطف لبيب فريد',
    parentRelation: 'الأب',
    parentPhone: '01122338877',
    parentJob: 'محامي استئناف',
    parent2Name: 'ماري عادل مرقص',
    parent2Relation: 'الأم',
    parent2Phone: '01066554422',
    parent2Job: 'ربة منزل',
    notes: 'عازف أورج بكورال الكنيسة',
    gender: 'boy',
    createdAt: '2025-02-10'
  }
];

export const INITIAL_SERVANTS: Servant[] = [
  // --- جيوفاني أيمن سمير (مفوض إدارياً) ---
  {
    id: 's_giovanni_ayman',
    name: 'جيوفاني أيمن سمير',
    assignedStage: 'عامة',
    job: 'خادم ومفوض إداري',
    birthDate: '1998-05-15',
    birthMonth: 5,
    area: 'المعراج',
    phone: '01203385601',
    roleType: 'general_dock',
    roleTitle: 'خادم عام (صلاحية خاصة لتسكين وتعديل أمناء الخدمة)',
    notes: 'مفوض إدارياً بالتحقق الأمني لتعديل وتسكين أمين خدمة جديد',
    createdAt: '2025-03-01'
  },
  // --- خادم حضانة ---
  {
    id: 's_had1',
    name: 'خ/ سارة عاطف يوسف',
    assignedStage: 'حضانة',
    job: 'مهندسة برمجيات',
    birthDate: '1996-05-14',
    birthMonth: 5,
    area: 'شبرا - مسرة',
    phone: '01211223344',
    email: 'sara.atef@church.org',
    roleTitle: 'خادم فصل حضانة',
    notes: 'مسؤولة عن الوسائل الإيضاحية والعرائس',
    createdAt: '2024-09-01'
  },
  {
    id: 's_had2',
    name: 'خ/ ناردين نبيل لبيب',
    assignedStage: 'حضانة',
    job: 'معلمة رياض أطفال',
    birthDate: '1998-09-22',
    birthMonth: 9,
    area: 'الزيتون',
    phone: '01133445566',
    roleTitle: 'خادم فصل حضانة',
    notes: 'متخصصة في الأناشيد والترانيم الحركية',
    createdAt: '2024-10-15'
  },

  // --- خادم ابتدائي (أولى وثانية) ---
  {
    id: 's_e12_1',
    name: 'خ/ هاني نصيف جرجس',
    assignedStage: 'ابتدائي (أولى وثانية)',
    job: 'محاسب بشركة اتصالات',
    birthDate: '1992-02-18',
    birthMonth: 2,
    area: 'شبرا - روض الفرج',
    phone: '01011223344',
    roleTitle: 'أمين فصل ابتدائي (1 و 2)',
    notes: 'متابع منتظم لافتقاد الأسر بالحرب والمنازل',
    createdAt: '2023-01-10'
  },
  {
    id: 's_e12_2',
    name: 'خ/ مونيكا مجدي صليب',
    assignedStage: 'ابتدائي (أولى وثانية)',
    job: 'صيدلانية',
    birthDate: '1997-11-12',
    birthMonth: 11,
    area: 'مصر الجديدة',
    phone: '01244556677',
    roleTitle: 'خادم فصل',
    notes: 'مسؤولة أنشطة المهرجان الملونة',
    createdAt: '2024-03-20'
  },

  // --- خادم ابتدائي (ثالثة ورابعة) ---
  {
    id: 's1',
    name: 'خ/ بيتر أشرف خليل',
    assignedStage: 'ابتدائي (ثالثة ورابعة)',
    job: 'مدرس لغة إنجليزية',
    birthDate: '1994-08-11',
    birthMonth: 8,
    area: 'شبرا - دوران شبرا',
    phone: '01144556677',
    email: 'peter.ashraf@church.org',
    roleTitle: 'أمين فصل ابتدائي (3 و 4)',
    notes: 'مسؤول عن الكورال ورحلات الابتدائي',
    createdAt: '2023-05-10'
  },
  {
    id: 's2',
    name: 'خ/ مارينا مدحت حليم',
    assignedStage: 'ابتدائي (ثالثة ورابعة)',
    job: 'طبيبة أسنان',
    birthDate: '1995-12-03',
    birthMonth: 12,
    area: 'حدائق القبة',
    phone: '01288776655',
    email: 'marina.medhat@church.org',
    roleTitle: 'خادم فصل',
    notes: 'مسؤولة عن الافتقاد الهاتفي والإنترنت',
    createdAt: '2024-01-15'
  },

  // --- خادم ابتدائي (خامسة وسادسة) ---
  {
    id: 's_e56_1',
    name: 'خ/ جرجس سمير فهمي',
    assignedStage: 'ابتدائي (خامسة وسادسة)',
    job: 'مهندس مدني',
    birthDate: '1991-04-25',
    birthMonth: 4,
    area: 'العباسية',
    phone: '01066778899',
    roleTitle: 'أمين مساعد فصل',
    notes: 'مدرب ألحان وطقس كنسي للأطفال',
    createdAt: '2023-08-12'
  },

  // --- خادم إعدادي ---
  {
    id: 's3',
    name: 'أ/ مينا عادل بشارة',
    assignedStage: 'إعدادي',
    job: 'مدير مالي بنك القاهرة',
    birthDate: '1988-03-29',
    birthMonth: 3,
    area: 'الزيتون',
    phone: '01009876543',
    email: 'mina.adel@church.org',
    roleTitle: 'أمين فصل إعدادي',
    notes: 'متابع للمرحلة ومسؤول الخلوات الروحية',
    createdAt: '2022-09-01'
  },
  {
    id: 's4',
    name: 'خ/ كيرلس يوسف أنطون',
    assignedStage: 'إعدادي',
    job: 'مصمم جرافيك',
    birthDate: '1993-07-17',
    birthMonth: 7,
    area: 'مصر الجديدة',
    phone: '01200112233',
    roleTitle: 'خادم مرحلة إعدادي',
    notes: 'مسؤول الميديا ومطبوعات المهرجان',
    createdAt: '2023-11-10'
  },

  // --- خادم ثانوي ---
  {
    id: 's5',
    name: 'خ/ بيشوي نادري بطرس',
    assignedStage: 'ثانوي',
    job: 'مهندس حاسبات',
    birthDate: '1992-10-08',
    birthMonth: 10,
    area: 'شبرا - مسرة',
    phone: '01233445566',
    email: 'bishoy.nadry@church.org',
    roleTitle: 'خادم مرحلة ثانوي',
    notes: 'يقود درس الكتاب وافتقاد الشباب',
    createdAt: '2023-03-15'
  },
  {
    id: 's6',
    name: 'خ/ ساندرا إبراهيم فكري',
    assignedStage: 'ثانوي',
    job: 'باحثة بيولوجية',
    birthDate: '1996-01-19',
    birthMonth: 1,
    area: 'العباسية',
    phone: '01199887766',
    roleTitle: 'خادمة مرحلة ثانوي',
    notes: 'متخصصة في إرشاد الفتيات ومناقشات العقيدة',
    createdAt: '2024-02-01'
  }
];

export const INITIAL_SUPERVISORS: Supervisor[] = [
  {
    id: 'sup1',
    name: 'القمص يوحنا رمزي',
    title: 'كاهن الكنيسة والمشرف العام على التربية الكنسية',
    assignedStage: 'عامة',
    supervisedStage: 'عامة',
    phone: '01221110000',
    email: 'fr.yohanna@church.org',
    area: 'شبرا - مسرة',
    job: 'كاهن كنيسة مارجرجس',
    isAssistant: false,
    roleType: 'supervisor',
    notes: 'الإشراف الروحي والطقسي العام على جميع المراحل',
    createdAt: '2020-01-01'
  },
  {
    id: 'sup_had_1',
    name: 'أ/ مريم فؤاد',
    title: 'أمين مرحلة حضانة',
    assignedStage: 'حضانة',
    supervisedStage: 'حضانة',
    phone: '01201122334',
    email: 'mariam.fouad@church.org',
    area: 'شبرا - دوران شبرا',
    job: 'معلمة رياض أطفال',
    isAssistant: false,
    roleType: 'supervisor',
    notes: 'مسؤولة عن متابعة حضانة وإعداد وسائل الإيضاح',
    createdAt: '2022-01-10'
  },
  {
    id: 'sup_had_ast',
    name: 'خ/ إيرين عادل',
    title: 'مساعد أمين مرحلة حضانة',
    assignedStage: 'حضانة',
    supervisedStage: 'حضانة',
    phone: '01299887711',
    area: 'الزيتون',
    job: 'أخصائية تخاطب',
    isAssistant: true,
    roleType: 'assistant_supervisor',
    notes: 'مساعدة أمين الخدمة في متابعة الحضور والأنشطة',
    createdAt: '2023-01-15'
  },
  {
    id: 'sup_elem12_1',
    name: 'خ/ هاني نصيف',
    title: 'أمين مرحلة ابتدائي (أولى وثانية)',
    assignedStage: 'ابتدائي (أولى وثانية)',
    supervisedStage: 'ابتدائي (أولى وثانية)',
    phone: '01011223344',
    area: 'مصر الجديدة',
    job: 'مهندس اتصالات',
    isAssistant: false,
    roleType: 'supervisor',
    notes: 'أمين المرحلة لمتابعة الخدام والمناهج',
    createdAt: '2022-02-01'
  },
  {
    id: 'sup_elem12_ast',
    name: 'خ/ مونيكا مجدي',
    title: 'مساعد أمين مرحلة ابتدائي (1 و 2)',
    assignedStage: 'ابتدائي (أولى وثانية)',
    supervisedStage: 'ابتدائي (أولى وثانية)',
    phone: '01244556677',
    area: 'مصر الجديدة',
    job: 'صيدلانية',
    isAssistant: true,
    roleType: 'assistant_supervisor',
    notes: 'مساعدة أمين الخدمة في إعداد المهرجان والافتقاد',
    createdAt: '2023-03-10'
  },
  {
    id: 'sup2',
    name: 'أ/ عماد حليم جرجس',
    title: 'أمين ومسؤول مناهج الابتدائي',
    assignedStage: 'ابتدائي (ثالثة ورابعة)',
    supervisedStage: 'ابتدائي (ثالثة ورابعة)',
    phone: '01005554433',
    email: 'emad.halim@church.org',
    area: 'حدائق القبة',
    job: 'مفتش أول جودة تعليمية',
    isAssistant: false,
    roleType: 'supervisor',
    notes: 'مراجعة المناهج والوسائل الإيضاحية لمرحلة ابتدائي',
    createdAt: '2021-06-15'
  },
  {
    id: 'sup_elem34_ast',
    name: 'خ/ مارينا مدحت',
    title: 'مساعد أمين مرحلة ابتدائي (3 و 4)',
    assignedStage: 'ابتدائي (ثالثة ورابعة)',
    supervisedStage: 'ابتدائي (ثالثة ورابعة)',
    phone: '01288776655',
    area: 'حدائق القبة',
    job: 'طبيبة أسنان',
    isAssistant: true,
    roleType: 'assistant_supervisor',
    notes: 'متابعة الحضور والافتقاد مع الخدام',
    createdAt: '2023-04-12'
  },
  {
    id: 'sup_elem56_1',
    name: 'أ/ هاني توفيق',
    title: 'أمين مرحلة ابتدائي (خامسة وسادسة)',
    assignedStage: 'ابتدائي (خامسة وسادسة)',
    supervisedStage: 'ابتدائي (خامسة وسادسة)',
    phone: '01222334455',
    area: 'العباسية',
    job: 'محاسب قانوني',
    isAssistant: false,
    roleType: 'supervisor',
    notes: 'أمين المرحلة للفتيان والفتيات',
    createdAt: '2022-03-01'
  },
  {
    id: 'sup_elem56_ast',
    name: 'خ/ جرجس سمير',
    title: 'مساعد أمين مرحلة ابتدائي (5 و 6)',
    assignedStage: 'ابتدائي (خامسة وسادسة)',
    supervisedStage: 'ابتدائي (خامسة وسادسة)',
    phone: '01066778899',
    area: 'العباسية',
    job: 'مهندس مدني',
    isAssistant: true,
    roleType: 'assistant_supervisor',
    notes: 'مساعد أمين المرحلة ومسؤول الألحان والأنشطة',
    createdAt: '2023-05-15'
  },
  {
    id: 'sup_prep_1',
    name: 'أ/ مينا عادل بشارة',
    title: 'أمين مرحلة إعدادي',
    assignedStage: 'إعدادي',
    supervisedStage: 'إعدادي',
    phone: '01009876543',
    email: 'mina.adel@church.org',
    area: 'الزيتون',
    job: 'مدير مالي بنك القاهرة',
    isAssistant: false,
    roleType: 'supervisor',
    notes: 'متابع للمرحلة ومسؤول الخلوات الروحية',
    createdAt: '2022-09-01'
  },
  {
    id: 'sup_prep_ast',
    name: 'خ/ كيرلس يوسف',
    title: 'مساعد أمين مرحلة إعدادي',
    assignedStage: 'إعدادي',
    supervisedStage: 'إعدادي',
    phone: '01200112233',
    area: 'مصر الجديدة',
    job: 'مصمم جرافيك',
    isAssistant: true,
    roleType: 'assistant_supervisor',
    notes: 'مساعد أمين المرحلة للميديا والأنشطة',
    createdAt: '2023-06-20'
  },
  {
    id: 'sup_sec_1',
    name: 'خ/ بيشوي نادري بطرس',
    title: 'أمين مرحلة ثانوي',
    assignedStage: 'ثانوي',
    supervisedStage: 'ثانوي',
    phone: '01233445566',
    email: 'bishoy.nadry@church.org',
    area: 'شبرا - مسرة',
    job: 'مهندس حاسبات',
    isAssistant: false,
    roleType: 'supervisor',
    notes: 'يقود درس الكتاب وافتقاد الشباب',
    createdAt: '2023-03-15'
  },
  {
    id: 'sup_sec_ast',
    name: 'خ/ ساندرا إبراهيم',
    title: 'مساعد أمين مرحلة ثانوي',
    assignedStage: 'ثانوي',
    supervisedStage: 'ثانوي',
    phone: '01199887766',
    area: 'العباسية',
    job: 'باحثة بيولوجية',
    isAssistant: true,
    roleType: 'assistant_supervisor',
    notes: 'مساعدة أمين الخدمة للفتيات ومؤتمرات الشباب',
    createdAt: '2023-08-10'
  }
];

export const INITIAL_BOOKS: Book[] = [
  // --- كتب عامة للخدام ---
  {
    id: 'b1',
    title: 'دليل خادم التربية الكنسية - المبادئ والأسس التربوية',
    category: 'khedma',
    targetStage: 'عامة',
    targetStages: ['عامة'],
    author: 'أسقفية الشباب',
    year: '2025',
    description: 'مرجع أساسي يغطي قواعد الافتقاد المؤثر، التحضير الروحي والتربوي للدرس، وكيفية التعامل مع المراحل العمرية المختلفة.',
    contentSummary: '1. الروحانية الشخصية للخادم\n2. كيف تعد درساً متكاملاً (هدف - وسائل - تطبيقي)\n3. أسرار الافتقاد الناجح\n4. إدارة الفصل والانضباط',
    fileUrl: '#',
    coverBg: 'from-indigo-800 to-slate-900',
    pageCount: 180
  },
  {
    id: 'b3',
    title: 'اللاهوت الدفاعي والإجابة على الشبهات للخدام',
    category: 'khedma',
    targetStage: 'عامة',
    targetStages: ['عامة', 'إعدادي', 'ثانوي'],
    author: 'الأنبا رافائيل',
    year: '2024',
    description: 'مرجع شامل للخدام لإجابة أسئلة المخدومين العميقة في اللاهوت والعقيدة الأرثوذكسية وتاريخ الطقس.',
    contentSummary: '1. عقيدة التجسد والفداء\n2. أسرار الكنيسة السبعة بالدليل الكتابي\n3. تاريخ المجامع المسكونية\n4. الرد على الشبهات والتفسيرات المنحرفة',
    fileUrl: '#',
    coverBg: 'from-emerald-700 to-teal-950',
    pageCount: 210
  },

  // --- كتب حضانة ---
  {
    id: 'b_had_1',
    title: 'منهج حضانة - بستان الأطفال والقصص المصورة',
    category: 'khedma',
    targetStage: 'حضانة',
    targetStages: ['حضانة'],
    author: 'لجنة المناهج الكنسية',
    year: '2026',
    description: 'قصص كتابية قصيرة جداً مصحوبة برسوم ملونة، ترانيم حركية مبسطة، وآيات قصيرة مناسبة لأطفال حضانة.',
    contentSummary: '1. الله يحبني وخلق كل شيء جميل\n2. صلاة الأبانا والصلبان الثلاثة\n3. بابا يسوع يهدئ العاصفة\n4. الملك داود والقيثارة',
    fileUrl: '#',
    coverBg: 'from-pink-500 to-rose-700',
    pageCount: 45
  },
  {
    id: 'b_had_2',
    title: 'كتاب مهرجان الكرازة - مرحلة حضانة (2026)',
    category: 'mahrajan',
    targetStage: 'حضانة',
    targetStages: ['حضانة'],
    author: 'أسقفية الشباب',
    year: '2026',
    description: 'أنشطة تلوين وتوصيل وأشغال يدوية لتعليم الأطفال أساسيات الإيمان الأرثوذكسي والترانيم البسيطة.',
    contentSummary: 'تلوين صور القديسين، لحن إبؤورو المبسط، متاهة الفلك ونوح، وآيات حفظ قصيرة.',
    fileUrl: '#',
    coverBg: 'from-amber-500 to-orange-700',
    pageCount: 32
  },

  // --- كتب ابتدائي (1 و 2) ---
  {
    id: 'b4',
    title: 'كتاب مهرجان الكرازة - مرحلة ابتدائي (1 و 2)',
    category: 'mahrajan',
    targetStage: 'ابتدائي (أولى وثانية)',
    targetStages: ['ابتدائي (أولى وثانية)'],
    author: 'أسقفية الشباب',
    year: '2026',
    description: 'قصص ملونة وآيات مبسطة وأنشطة تلوين وأشغال يدوية مناسبة للأطفال من سن 6 إلى 8 سنوات.',
    contentSummary: 'قصة داود وجليات، صلاة الأبانا القبطية، ألحان ثوك تي تي جوم المبسطة، وتدريبات سلوكية يومية.',
    fileUrl: '#',
    coverBg: 'from-purple-600 to-indigo-800',
    pageCount: 64
  },
  {
    id: 'b_e12_khedma',
    title: 'دليل تحضير الدروس - ابتدائي (أولى وثانية)',
    category: 'khedma',
    targetStage: 'ابتدائي (أولى وثانية)',
    targetStages: ['ابتدائي (أولى وثانية)'],
    author: 'مطبوعات الكنيسة',
    year: '2025',
    description: 'دروس تفاعلية بالعرائس والوسائل البصرية لغرس القيم الأرثوذكسية والمحبة في قلوب أطفال أولى وثانية ابتدائي.',
    contentSummary: 'دروس عن الأمانة، المحبة، طاعة الوالدين، مواظبة الكنيسة، وصنائع المعجزات.',
    fileUrl: '#',
    coverBg: 'from-blue-600 to-cyan-800',
    pageCount: 90
  },

  // --- كتب ابتدائي (3 و 4) ---
  {
    id: 'b2',
    title: 'منهج المهرجان - ابتدائي (3 و 4) - دراسات كتاب وطقس',
    category: 'mahrajan',
    targetStage: 'ابتدائي (ثالثة ورابعة)',
    targetStages: ['ابتدائي (ثالثة ورابعة)'],
    author: 'أسقفية الشباب',
    year: '2026',
    description: 'مادة دراسية مبسطة تشمل دراسة سفر يونان النبي، طقس قداس الكلمة، وألحان مناسبة لمرحلة ابتدائي.',
    contentSummary: '1. سفر يونان ودلالاته النبوية\n2. أجزاء القداس الإلهي والشمامسة\n3. لحن كيرياليسون ولحن هيتني\n4. محفوظات وآيات مقترحة',
    fileUrl: '#',
    coverBg: 'from-amber-600 to-yellow-800',
    pageCount: 85
  },

  // --- كتب ابتدائي (5 و 6) ---
  {
    id: 'b_e56_1',
    title: 'منهج ابتدائي (5 و 6) - رحلة مع سفر أعمال الرسل',
    category: 'khedma',
    targetStage: 'ابتدائي (خامسة وسادسة)',
    targetStages: ['ابتدائي (خامسة وسادسة)'],
    author: 'مطبوعات التربية الكنسية',
    year: '2025',
    description: 'شرح مبسط لبداية الكنيسة وتأسيسها ورحلات القديس بولس الرسول مع تطبيق سلوكي للفتيان والفتيات.',
    contentSummary: 'حلول الروح القدس، رحلات بولس الرسول، التناول الأسبوعي، وكيف أحفظ قلبي بيتاً لله.',
    fileUrl: '#',
    coverBg: 'from-teal-600 to-emerald-900',
    pageCount: 110
  },

  // --- كتب إعدادي ---
  {
    id: 'b_prep_1',
    title: 'منهج إعدادي - العقيدة الطقسية وروحانيات الأسرار',
    category: 'khedma',
    targetStage: 'إعدادي',
    targetStages: ['إعدادي'],
    author: 'أسقفية الشباب',
    year: '2025',
    description: 'دراسات عقيدية وطقسية أسبوعية لمساعدة فتيان إعدادي على الفهم العميق لصلوات وتسبحة الكنيسة الأرثوذكسية.',
    contentSummary: 'سر المعمودية والتثبيت، سر التوبة والاعتراف، شرح الأجبية وصلاة الساعات، وحفظ ألحان التسبحة.',
    fileUrl: '#',
    coverBg: 'from-indigo-700 to-purple-950',
    pageCount: 140
  },

  // --- كتب ثانوي ---
  {
    id: 'b5',
    title: 'فن التواصل التربوي مع مرحلة المراهقة (ثانوي)',
    category: 'khedma',
    targetStage: 'ثانوي',
    targetStages: ['ثانوي', 'عامة'],
    author: 'دليل الإرشاد الكنسي',
    year: '2025',
    description: 'كتاب خاص بخدام مرحلة ثانوي لمساعدتهم في استيعاب التغيرات النفسية والفكرية للمراهقين وكيفية الافتقاد المؤثر.',
    contentSummary: 'سيكولوجية المراهق الأرثوذكسي، التعامل مع التشكيك الفكري، شبكات التواصل الاجتماعي وأثرها، وكيف تصبح خادماً مشيراً أميناً.',
    fileUrl: '#',
    coverBg: 'from-rose-600 to-red-900',
    pageCount: 128
  },
  {
    id: 'b_sec_2',
    title: 'كتاب مهرجان الكرازة - مرحلة ثانوي والجامعة (2026)',
    category: 'mahrajan',
    targetStage: 'ثانوي',
    targetStages: ['ثانوي'],
    author: 'أسقفية الشباب',
    year: '2026',
    description: 'أحداث التاريخ الكنسي والمجامع المسكونية، أبحاث اللاهوت المقارن، ومسابقات الألحان القبطية المتقدمة.',
    contentSummary: 'تاريخ مجمع نيقية، الرد على ملحدي العصر، شرح لحن آري هوعو ولحن بيك إثرونوس.',
    fileUrl: '#',
    coverBg: 'from-violet-700 to-slate-900',
    pageCount: 160
  }
];

// Pre-filled attendance records across multiple stages and dates
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-child-mass-1',
    date: '2026-07-19',
    targetType: 'child',
    eventType: 'mass',
    records: {
      'c_had1': { status: 'present' },
      'c_had2': { status: 'present' },
      'c_e12_1': { status: 'present' },
      'c_e12_2': { status: 'late', note: 'وصل في الإنجيل' },
      'c1': { status: 'present' },
      'c2': { status: 'present' },
      'c3': { status: 'absent' },
      'c_e56_1': { status: 'present' },
      'c4': { status: 'present' },
      'c5': { status: 'excused', note: 'سفر مع الأسرة' },
      'c_sec_1': { status: 'present' }
    }
  },
  {
    id: 'att-child-sunday-1',
    date: '2026-07-19',
    targetType: 'child',
    eventType: 'sunday_school',
    records: {
      'c_had1': { status: 'present' },
      'c_had2': { status: 'present' },
      'c_had3': { status: 'present' },
      'c_e12_1': { status: 'present' },
      'c1': { status: 'present' },
      'c2': { status: 'present' },
      'c3': { status: 'late' },
      'c_e56_1': { status: 'present' },
      'c_e56_2': { status: 'present' },
      'c4': { status: 'present' },
      'c5': { status: 'absent' },
      'c6': { status: 'present' },
      'c_sec_1': { status: 'present' },
      'c_sec_2': { status: 'present' }
    }
  },
  {
    id: 'att-servant-meeting-1',
    date: '2026-07-17',
    targetType: 'servant',
    eventType: 'general_meeting',
    records: {
      's_had1': { status: 'present' },
      's_e12_1': { status: 'present' },
      's1': { status: 'present' },
      's2': { status: 'late', note: 'ظروف عمل بالبنك' },
      's3': { status: 'present' },
      's4': { status: 'present' },
      's5': { status: 'present' },
      's6': { status: 'present' }
    }
  }
];

export const DEFAULT_STAGES: StageItem[] = [
  { 
    id: 'stg_hadana', 
    name: 'حضانة', 
    description: 'من سن 3 سنوات إلى 5 سنوات', 
    supervisorName: 'أ/ مريم فؤاد', 
    supervisorPhone: '01201122334',
    assistantSupervisors: [
      { name: 'خ/ إيرين عادل', phone: '01299887711' }
    ]
  },
  { 
    id: 'stg_elem12', 
    name: 'ابتدائي (أولى وثانية)', 
    description: 'الصفوف الأول والثاني الابتدائي', 
    supervisorName: 'خ/ هاني نصيف', 
    supervisorPhone: '01011223344',
    assistantSupervisors: [
      { name: 'خ/ مونيكا مجدي', phone: '01244556677' }
    ]
  },
  { 
    id: 'stg_elem34', 
    name: 'ابتدائي (ثالثة ورابعة)', 
    description: 'الصفوف الثالث والرابع الابتدائي', 
    supervisorName: 'خ/ بيتر أشرف', 
    supervisorPhone: '01144556677',
    assistantSupervisors: [
      { name: 'خ/ مارينا مدحت', phone: '01288776655' }
    ]
  },
  { 
    id: 'stg_elem56', 
    name: 'ابتدائي (خامسة وسادسة)', 
    description: 'الصفوف الخامس والسادس الابتدائي', 
    supervisorName: 'أ/ هاني توفيق', 
    supervisorPhone: '01222334455',
    assistantSupervisors: [
      { name: 'خ/ جرجس سمير', phone: '01066778899' }
    ]
  },
  { 
    id: 'stg_prep', 
    name: 'إعدادي', 
    description: 'المرحلة الإعدادية (أولى، ثانية، ثالثة)', 
    supervisorName: 'أ/ مينا عادل', 
    supervisorPhone: '01009876543',
    assistantSupervisors: [
      { name: 'خ/ كيرلس يوسف', phone: '01200112233' },
      { name: 'خ/ مرقس حبيب', phone: '01122334466' }
    ]
  },
  { 
    id: 'stg_sec', 
    name: 'ثانوي', 
    description: 'المرحلة الثانوية العامة', 
    supervisorName: 'خ/ بيشوي نادري', 
    supervisorPhone: '01233445566',
    assistantSupervisors: [
      { name: 'خ/ ساندرا إبراهيم', phone: '01199887766' }
    ]
  },
  { 
    id: 'stg_general', 
    name: 'عامة', 
    description: 'كافة مراحل وقطاعات الخدمة', 
    supervisorName: 'أ/ بيشوي جرجس', 
    supervisorPhone: '01223456789',
    assistantSupervisors: []
  }
];

export const STAGES: Stage[] = [
  'حضانة',
  'ابتدائي (أولى وثانية)',
  'ابتدائي (ثالثة ورابعة)',
  'ابتدائي (خامسة وسادسة)',
  'إعدادي',
  'ثانوي',
  'عامة'
];

export const AREAS = [
  'شبرا - مسرة',
  'شبرا - روض الفرج',
  'شبرا - دوران شبرا',
  'حدائق القبة',
  'الزيتون',
  'مصر الجديدة',
  'العباسية'
];

export const MONTHS = [
  { value: 1, name: 'يناير (1)', label: 'يناير (1)' },
  { value: 2, name: 'فبراير (2)', label: 'فبراير (2)' },
  { value: 3, name: 'مارس (3)', label: 'مارس (3)' },
  { value: 4, name: 'أبريل (4)', label: 'أبريل (4)' },
  { value: 5, name: 'مايو (5)', label: 'مايو (5)' },
  { value: 6, name: 'يونيو (6)', label: 'يونيو (6)' },
  { value: 7, name: 'يوليو (7)', label: 'يوليو (7)' },
  { value: 8, name: 'أغسطس (8)', label: 'أغسطس (8)' },
  { value: 9, name: 'سبتمبر (9)', label: 'سبتمبر (9)' },
  { value: 10, name: 'أكتوبر (10)', label: 'أكتوبر (10)' },
  { value: 11, name: 'نوفمبر (11)', label: 'نوفمبر (11)' },
  { value: 12, name: 'ديسمبر (12)', label: 'ديسمبر (12)' }
];

export const EVENT_LABELS: Record<string, string> = {
  mass: 'القداس الإلهي',
  sunday_school: 'مدارس الأحد',
  festival: 'المهرجان (مهرجان الكرازة)',
  mahragan: 'المهرجان (مهرجان الكرازة)',
  general_meeting: 'اجتماع الخدام العام',
  supervisors_meeting: 'اجتماع أمناء الفصول'
};

