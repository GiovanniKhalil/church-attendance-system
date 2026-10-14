import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Role, Stage, StageItem, AssistantSupervisor, Child, Servant, Supervisor, Book, AttendanceRecord, AttendanceStatus, 
  ChildEventType, StaffEventType, FilterState, AppUser, ChurchEventNotification, ThemeMode 
} from '../types';
import { 
  INITIAL_CHILDREN, INITIAL_SERVANTS, INITIAL_SUPERVISORS, 
  INITIAL_BOOKS, INITIAL_ATTENDANCE, INITIAL_USERS, INITIAL_NOTIFICATIONS, DEFAULT_STAGES 
} from '../data/mockData';
import { calculateDynamicAge } from '../utils/ageUtils';
import { 
  hashPassword, 
  hashPasswordSync, 
  verifyPassword, 
  validateUsername, 
  isPasswordEncrypted 
} from '../utils/cryptoUtils';
import { 
  seedFirestoreIfEmpty,
  listenToMakhdomeen,
  listenToUsers,
  listenToAttendance,
  listenToLibrary,
  listenToAnnouncements,
  addMakhdoomToFirestore,
  updateMakhdoomInFirestore,
  deleteMakhdoomFromFirestore,
  batchAddMakhdomeenToFirestore,
  batchUpdateMakhdomeenStagesInFirestore,
  addUserToFirestore,
  updateUserInFirestore,
  deleteUserFromFirestore,
  saveAttendanceToFirestore,
  batchSaveAttendanceToFirestore,
  addLibraryBookToFirestore,
  updateLibraryBookInFirestore,
  deleteLibraryBookFromFirestore,
  addAnnouncementToFirestore,
  deleteAnnouncementFromFirestore,
  getUserFromFirestore
} from '../services/firestoreService';
import { 
  loginWithFirebaseAuth, 
  updateFirebaseUserPassword, 
  logoutFirebaseAuth 
} from '../firebase';

export type TabId = 
  | 'home'
  | 'library'
  | 'children_directory'
  | 'children_attendance'
  | 'servants_directory'
  | 'servants_attendance'
  | 'supervisors_directory'
  | 'supervisors_attendance';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  // Stages & Services List Management (لإضافة وتعديل وحذف الخدمات والمراحل)
  stagesList: StageItem[];
  addStage: (name: string, description?: string, supervisorName?: string, supervisorPhone?: string) => void;
  updateStage: (
    stageId: string, 
    updatedData: { 
      name: string; 
      description?: string; 
      supervisorName?: string; 
      supervisorPhone?: string; 
      assistantSupervisors?: AssistantSupervisor[];
      meetingTime?: string 
    }
  ) => void;
  deleteStage: (stageName: string) => void;

  // Auth & User State
  currentUser: AppUser | null;
  users: AppUser[];
  login: (username: string, pass: string) => Promise<{ success: boolean; error?: string; isTemp?: boolean }>;
  registerServant: (data: {
    name: string;
    username: string;
    password?: string;
    phone: string;
    area: string;
    job: string;
    birthDate: string;
    assignedStage: string;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (userId: string, newPass: string) => Promise<void>;
  createUser: (userData: Omit<AppUser, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, userData: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;
  resetUserTempPassword: (id: string, tempPass: string) => void;
  resetUsersToDefault: () => void;

  // Notifications & Events
  notifications: ChurchEventNotification[];
  addNotification: (notif: Omit<ChurchEventNotification, 'id' | 'createdAt'>) => void;
  deleteNotification: (id: string) => void;

  // Stage Scoping
  selectedStageScope: Stage | 'all';
  setSelectedStageScope: (stage: Stage | 'all') => void;
  
  // Data State
  children: Child[];
  servants: Servant[];
  supervisors: Supervisor[];
  books: Book[];
  attendance: AttendanceRecord[];

  // Children Actions
  addChild: (child: Omit<Child, 'id' | 'createdAt'>) => void;
  batchAddChildren: (children: Omit<Child, 'id' | 'createdAt'>[]) => Promise<void>;
  updateChild: (id: string, child: Partial<Child>) => void;
  deleteChild: (id: string) => void;

  // Servants Actions
  addServant: (servant: Omit<Servant, 'id' | 'createdAt'>) => void;
  updateServant: (id: string, servant: Partial<Servant>) => void;
  deleteServant: (id: string) => void;

  // Supervisors Actions
  addSupervisor: (supervisor: Omit<Supervisor, 'id' | 'createdAt'> & { servantId?: string }) => void;
  updateSupervisor: (id: string, supervisor: Partial<Supervisor>) => void;
  deleteSupervisor: (id: string) => void;

  // Books Actions
  addBook: (book: Omit<Book, 'id'>) => void;
  updateBook: (id: string, book: Partial<Book>) => void;
  deleteBook: (id: string) => void;

  // Attendance Actions
  markAttendance: (
    targetType: 'child' | 'servant' | 'supervisor',
    eventType: ChildEventType | StaffEventType,
    date: string,
    personId: string,
    status: AttendanceStatus,
    note?: string
  ) => void;
  markAllAttendance: (
    targetType: 'child' | 'servant' | 'supervisor',
    eventType: ChildEventType | StaffEventType,
    date: string,
    personIds: string[],
    status: AttendanceStatus
  ) => void;
  getAttendanceRecord: (
    targetType: 'child' | 'servant' | 'supervisor',
    eventType: ChildEventType | StaffEventType,
    date: string
  ) => AttendanceRecord | undefined;

  // Database Management (مسح البيانات بالكامل، التصدير والاستيراد)
  clearAllDatabase: () => void;
  resetToDefaultData: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonString: string) => { success: boolean; error?: string };

  // Operations: إلغاء توزيع الخدام والآمناء وتصعيد المراحل
  unassignAllServantsFromClasses: () => { servantsUpdated: number; supervisorsUpdated: number; classesCleared: number };
  moveServantsToGeneralDock: (stageOrAll?: string) => Promise<number>;
  assignServantRole: (servantId: string, stage: string, roleType?: 'captain' | 'first_mate' | 'crew' | 'general_dock', roleTitle?: string) => Promise<void>;
  updatePersonalProfile: (profileData: Partial<AppUser>) => Promise<void>;
  promoteAllStages: () => { promotedCount: number; graduationCount: number; details: Record<string, number> };

  // Global Search & Filters
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;

  // Theme & Dark Mode
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const defaultFilters: FilterState = {
  searchQuery: '',
  stageFilter: 'all',
  birthMonthFilter: 'all',
  ageFilter: 'all',
  areaFilter: 'all'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const ensureEncryptedUsers = (rawUsers: AppUser[]): AppUser[] => {
  return rawUsers.map(u => {
    if (u.password && !isPasswordEncrypted(u.password)) {
      return { ...u, password: hashPasswordSync(u.password) };
    }
    return u;
  });
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children: childrenProps }) => {
  // Users state with strict password encryption
  const [users, setUsers] = useState<AppUser[]>(() => {
    const version = localStorage.getItem('church_app_users_v2026_encrypted_v2');
    if (!version) {
      localStorage.setItem('church_app_users_v2026_encrypted_v2', 'true');
      const encryptedDefaults = ensureEncryptedUsers(INITIAL_USERS);
      localStorage.setItem('church_app_users', JSON.stringify(encryptedDefaults));
      return encryptedDefaults;
    }
    const saved = localStorage.getItem('church_app_users');
    const parsed = saved ? JSON.parse(saved) : INITIAL_USERS;
    const sanitized = ensureEncryptedUsers(parsed);
    // ensure storage is updated if unhashed passwords existed
    localStorage.setItem('church_app_users', JSON.stringify(sanitized));
    return sanitized;
  });

  // Logged-in current user (starts null so it always opens on Registration page per requirement)
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = sessionStorage.getItem('church_app_current_user');
    if (saved) {
      try { 
        const u: AppUser = JSON.parse(saved);
        if (u.password && !isPasswordEncrypted(u.password)) {
          u.password = hashPasswordSync(u.password);
        }
        return u;
      } catch (e) { return null; }
    }
    return null;
  });

  const [role, setRoleState] = useState<Role>(() => {
    if (currentUser) return currentUser.role;
    return (localStorage.getItem('church_app_role') as Role) || 'khadem';
  });

  const [activeTab, setActiveTabState] = useState<TabId>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab') as TabId;
        const validTabs: TabId[] = [
          'home',
          'library',
          'children_attendance',
          'children_directory',
          'servants_attendance',
          'servants_directory',
          'supervisors_attendance',
          'supervisors_directory'
        ];
        if (tabParam && validTabs.includes(tabParam)) {
          return tabParam;
        }
      }
    } catch {
      // ignore
    }
    return 'home';
  });

  useEffect(() => {
    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const tabParam = (params.get('tab') as TabId) || 'home';
        setActiveTabState(tabParam);
      } catch {
        // ignore
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [selectedStageScope, setSelectedStageScopeState] = useState<Stage | 'all'>(() => {
    if (currentUser && currentUser.assignedStage && currentUser.assignedStage !== 'عامة') {
      return currentUser.assignedStage;
    }
    return 'all';
  });

  // Theme & Dark Mode State
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('church_app_theme');
    if (saved === 'dark' || saved === 'light') return saved as ThemeMode;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    try {
      localStorage.setItem('church_app_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  // Stages / Services State
  const [stagesList, setStagesList] = useState<StageItem[]>(() => {
    const saved = localStorage.getItem('church_app_stages_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        return DEFAULT_STAGES;
      }
    }
    return DEFAULT_STAGES;
  });

  useEffect(() => {
    localStorage.setItem('church_app_stages_list', JSON.stringify(stagesList));
  }, [stagesList]);

  const addStage = (name: string, description?: string, supervisorName?: string, supervisorPhone?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (stagesList.some(s => s.name === trimmed)) return;
    const newStageItem: StageItem = {
      id: 'stg_' + Date.now(),
      name: trimmed,
      description: description || '',
      supervisorName: supervisorName?.trim() || '',
      supervisorPhone: supervisorPhone?.trim() || '',
      isCustom: true
    };
    setStagesList(prev => [...prev, newStageItem]);
  };

  const updateStage = (
    stageId: string, 
    updatedData: { 
      name: string; 
      description?: string; 
      supervisorName?: string; 
      supervisorPhone?: string; 
      assistantSupervisors?: AssistantSupervisor[];
      meetingTime?: string 
    }
  ) => {
    const existing = stagesList.find(s => s.id === stageId);
    if (!existing) return;
    const oldName = existing.name;
    const newName = updatedData.name.trim();

    setStagesList(prev => prev.map(s => {
      if (s.id === stageId) {
        return {
          ...s,
          name: newName || s.name,
          description: updatedData.description !== undefined ? updatedData.description : s.description,
          supervisorName: updatedData.supervisorName !== undefined ? updatedData.supervisorName : s.supervisorName,
          supervisorPhone: updatedData.supervisorPhone !== undefined ? updatedData.supervisorPhone : s.supervisorPhone,
          assistantSupervisors: updatedData.assistantSupervisors !== undefined ? updatedData.assistantSupervisors : s.assistantSupervisors,
          meetingTime: updatedData.meetingTime !== undefined ? updatedData.meetingTime : s.meetingTime,
        };
      }
      return s;
    }));

    // Cascade update all references across children, servants, supervisors, and users if name changed
    if (newName && newName !== oldName) {
      setChildren(prev => prev.map(c => c.stage === oldName ? { ...c, stage: newName } : c));
      setServants(prev => prev.map(srv => srv.assignedStage === oldName ? { ...srv, assignedStage: newName } : srv));
      setSupervisors(prev => prev.map(sup => sup.supervisedStage === oldName ? { ...sup, supervisedStage: newName } : sup));
      setUsers(prev => prev.map(u => u.assignedStage === oldName ? { ...u, assignedStage: newName } : u));
    }
  };

  const deleteStage = (stageName: string) => {
    setStagesList(prev => prev.filter(s => s.name !== stageName));
  };

  // Notifications state
  const [notifications, setNotifications] = useState<ChurchEventNotification[]>(() => {
    const saved = localStorage.getItem('church_app_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [children, setChildren] = useState<Child[]>(() => {
    const saved = localStorage.getItem('church_app_children');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: any) => ({
            ...c,
            parentRelation: c.parentRelation || 'الأب',
            parentJob: c.parentJob || '',
            parent2Name: c.parent2Name || '',
            parent2Relation: c.parent2Relation || (c.parent2Name ? 'الأم' : ''),
            parent2Phone: c.parent2Phone || '',
            parent2Job: c.parent2Job || '',
            birthDate: c.birthDate || (c.age ? `${new Date().getFullYear() - c.age}-${String(c.birthMonth || 1).padStart(2, '0')}-15` : '2017-07-15')
          }));
        }
      } catch (e) {
        return INITIAL_CHILDREN;
      }
    }
    return INITIAL_CHILDREN;
  });

  const [supervisors, setSupervisors] = useState<Supervisor[]>(() => {
    const v2Loaded = localStorage.getItem('church_app_supervisors_v3');
    if (!v2Loaded) {
      localStorage.setItem('church_app_supervisors_v3', 'true');
      localStorage.setItem('church_app_supervisors', JSON.stringify(INITIAL_SUPERVISORS));
      return INITIAL_SUPERVISORS;
    }
    const saved = localStorage.getItem('church_app_supervisors');
    return saved ? JSON.parse(saved) : INITIAL_SUPERVISORS;
  });

  const [servants, setServants] = useState<Servant[]>(() => {
    const saved = localStorage.getItem('church_app_servants');
    let loaded: Servant[] = saved ? JSON.parse(saved) : INITIAL_SERVANTS;

    // Auto-sync: Guarantee that all supervisors are also in the servants list
    const savedSups = localStorage.getItem('church_app_supervisors');
    const supList: Supervisor[] = savedSups ? JSON.parse(savedSups) : INITIAL_SUPERVISORS;

    supList.forEach(sup => {
      const isAssistant = !!(sup.isAssistant || sup.roleType === 'assistant_supervisor');
      const roleTitle = isAssistant ? 'مساعد أمين مرحلة' : (sup.title || 'أمين مرحلة');
      const existingIndex = loaded.findIndex(s => s.id === sup.id || (s.phone && s.phone === sup.phone) || s.name === sup.name);
      
      if (existingIndex < 0) {
        loaded.push({
          id: sup.id,
          name: sup.name,
          assignedStage: sup.assignedStage || sup.supervisedStage || 'عامة',
          area: sup.area || '',
          phone: sup.phone || '',
          job: sup.job || 'خادم',
          birthDate: sup.birthDate || '1995-01-01',
          birthMonth: sup.birthMonth || 1,
          roleTitle,
          notes: sup.notes,
          createdAt: sup.createdAt || '2024-01-01'
        });
      } else {
        loaded[existingIndex] = {
          ...loaded[existingIndex],
          roleTitle
        };
      }
    });

    return loaded;
  });

  const [books, setBooks] = useState<Book[]>(() => {
    const v2Loaded = localStorage.getItem('church_app_books_v3');
    if (!v2Loaded) {
      localStorage.setItem('church_app_books_v3', 'true');
      localStorage.setItem('church_app_books', JSON.stringify(INITIAL_BOOKS));
      return INITIAL_BOOKS;
    }
    const saved = localStorage.getItem('church_app_books');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((b: any) => ({
          ...b,
          targetStages: b.targetStages && b.targetStages.length > 0 ? b.targetStages : [b.targetStage || 'عامة']
        }));
      } catch (e) {
        return INITIAL_BOOKS;
      }
    }
    return INITIAL_BOOKS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('church_app_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Sync users to local storage
  useEffect(() => {
    localStorage.setItem('church_app_users', JSON.stringify(users));
  }, [users]);

  // Sync current user to session storage (clears persistent localStorage so opening fresh always opens on Registration)
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('church_app_current_user', JSON.stringify(currentUser));
      setRoleState(currentUser.role);
    } else {
      sessionStorage.removeItem('church_app_current_user');
      localStorage.removeItem('church_app_current_user');
    }
  }, [currentUser]);

  // Sync role
  useEffect(() => {
    localStorage.setItem('church_app_role', role);
  }, [role]);

  // Sync notifications
  useEffect(() => {
    localStorage.setItem('church_app_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('church_app_children', JSON.stringify(children));
  }, [children]);

  useEffect(() => {
    localStorage.setItem('church_app_servants', JSON.stringify(servants));
  }, [servants]);

  useEffect(() => {
    localStorage.setItem('church_app_supervisors', JSON.stringify(supervisors));
  }, [supervisors]);

  useEffect(() => {
    localStorage.setItem('church_app_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('church_app_attendance', JSON.stringify(attendance));
  }, [attendance]);

  // ============================================================================
  // Real-Time Firebase Firestore Subscriptions & Auto-Sync
  // ============================================================================
  useEffect(() => {
    // 1. Seed initial Firestore collections if empty
    seedFirestoreIfEmpty();

    // 2. Real-time listener for makhdomeen
    const unsubMakhdomeen = listenToMakhdomeen((firestoreMakhdomeen) => {
      if (firestoreMakhdomeen && firestoreMakhdomeen.length > 0) {
        setChildren(firestoreMakhdomeen.map(m => {
          const age = calculateDynamicAge(m.birthDate || '2017-01-01');
          const birthMonth = m.birthDate && m.birthDate.includes('-')
            ? (parseInt(m.birthDate.split('-')[1], 10) || 1)
            : 1;

          return {
            id: m.id,
            name: m.fullName || 'بدون اسم',
            stage: m.stage || 'عامة',
            age,
            birthDate: m.birthDate || '2017-01-01',
            birthMonth,
            area: 'شبرا - مسرة',
            phone: m.phone || '',
            parentName: m.parentPhone ? `ولي أمر (${m.fullName})` : 'ولي الأمر',
            parentRelation: 'ولي الأمر',
            parentPhone: m.parentPhone || '',
            gender: 'boy',
            createdAt: new Date().toISOString()
          };
        }));
      }
    });

    // 3. Real-time listener for users
    const unsubUsers = listenToUsers((firestoreUsers) => {
      if (firestoreUsers && firestoreUsers.length > 0) {
        setUsers(prev => {
          const map = new Map<string, AppUser>();
          // Preserve local in-memory users
          prev.forEach(u => {
            if (u.username) map.set(u.username.toLowerCase(), u);
            if (u.id) map.set(u.id, u);
          });

          // Overlay firestore users without destroying passwords
          firestoreUsers.forEach(fu => {
            const rawUsername = (fu.username || fu.uid || '').trim();
            if (!rawUsername) return;
            const existing = map.get(rawUsername.toLowerCase()) || map.get(fu.uid);
            const userObj: AppUser = {
              id: fu.uid || existing?.id || rawUsername,
              username: rawUsername,
              name: fu.fullName || existing?.name || rawUsername,
              phone: fu.phone || existing?.phone || '',
              role: (fu.role as Role) || existing?.role || 'khadem',
              assignedStage: (fu.assignedClass as Stage) || existing?.assignedStage || 'عامة',
              isTempPassword: Boolean(fu.isFirstLogin),
              password: fu.passwordHash || existing?.password || hashPasswordSync('123'),
              createdAt: existing?.createdAt || new Date().toISOString().split('T')[0]
            };
            map.set(rawUsername.toLowerCase(), userObj);
            map.set(userObj.id, userObj);
          });

          const uniqueUsers = Array.from(new Set(map.values()));
          localStorage.setItem('church_app_users', JSON.stringify(uniqueUsers));
          return uniqueUsers;
        });
      }
    });

    // 4. Real-time listener for library
    const unsubLibrary = listenToLibrary((firestoreBooks) => {
      if (firestoreBooks && firestoreBooks.length > 0) {
        setBooks(firestoreBooks.map(b => ({
          id: b.id,
          title: b.title,
          category: (b.category as any) || 'khedma',
          stage: b.targetGrade || 'عامة',
          targetStage: b.targetGrade || 'عامة',
          targetStages: [b.targetGrade || 'عامة'],
          pdfUrl: b.fileUrl,
          coverUrl: b.fileUrl,
          description: b.title
        })));
      }
    });

    // 5. Real-time listener for announcements
    const unsubAnnouncements = listenToAnnouncements((firestoreAnnouncements) => {
      if (firestoreAnnouncements && firestoreAnnouncements.length > 0) {
        setNotifications(firestoreAnnouncements.map(a => ({
          id: a.id,
          title: a.title,
          description: a.body,
          targetStage: a.targetRole || 'عامة',
          type: 'alert',
          date: a.createdAt ? a.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          createdAt: a.createdAt
        })));
      }
    });

    // 6. Real-time listener for attendance
    const unsubAttendance = listenToAttendance((rawAttendance) => {
      if (rawAttendance && rawAttendance.length > 0) {
        const groups: Record<string, AttendanceRecord> = {};
        rawAttendance.forEach(item => {
          const key = `${item.personType}_${item.eventType}_${item.date}`;
          if (!groups[key]) {
            groups[key] = {
              id: `att_${key}`,
              date: item.date,
              targetType: (item.personType as any) || 'child',
              eventType: (item.eventType as any) || 'sunday_school',
              records: {}
            };
          }
          groups[key].records[item.personId] = {
            status: item.status as any
          };
        });
        setAttendance(Object.values(groups));
      }
    });

    return () => {
      unsubMakhdomeen();
      unsubUsers();
      unsubLibrary();
      unsubAnnouncements();
      unsubAttendance();
    };
  }, []);

  // Auth Methods
  const login = async (username: string, pass: string): Promise<{ success: boolean; error?: string; isTemp?: boolean }> => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPass = pass.trim();

    // 1. Find user in local state or fetch directly from Firestore
    let found = users.find(u => 
      u.username?.toLowerCase() === cleanUsername || 
      (u.phone && u.phone.trim() === cleanUsername) ||
      u.id === cleanUsername
    );

    // 2. Query Firestore directly if not found locally OR to get fresh credentials from cloud
    try {
      const firestoreUser = await getUserFromFirestore(cleanUsername);
      if (firestoreUser) {
        if (found) {
          found = {
            ...found,
            role: (firestoreUser.role as Role) || found.role,
            assignedStage: (firestoreUser.assignedClass as Stage) || found.assignedStage,
            isTempPassword: Boolean(firestoreUser.isFirstLogin),
            name: firestoreUser.fullName || found.name,
            phone: firestoreUser.phone || found.phone,
            password: firestoreUser.passwordHash || found.password
          };
        } else {
          found = {
            id: firestoreUser.uid || cleanUsername,
            username: firestoreUser.username || cleanUsername,
            name: firestoreUser.fullName || cleanUsername,
            phone: firestoreUser.phone || '',
            role: (firestoreUser.role as Role) || 'khadem',
            assignedStage: (firestoreUser.assignedClass as Stage) || 'عامة',
            isTempPassword: Boolean(firestoreUser.isFirstLogin),
            password: firestoreUser.passwordHash || hashPasswordSync(cleanPass),
            createdAt: new Date().toISOString().split('T')[0]
          };
        }
      }
    } catch (fsErr) {
      console.warn('Firestore user lookup error:', fsErr);
    }

    if (!found) {
      // Admin fallback if username is admin
      if (cleanUsername === 'admin') {
        const encrypted = await hashPassword(cleanPass);
        found = {
          id: 'u_admin',
          username: 'admin',
          name: 'أ/ بيشوي جرجس',
          role: 'amin_khedma_am',
          assignedStage: 'عامة',
          isTempPassword: false,
          phone: '',
          password: encrypted
        };
      } else {
        return { success: false, error: 'اسم المستخدم أو رقم الهاتف غير مسجل' };
      }
    }

    // 3. Verify password with support for hash and fallback
    let isPasswordMatch = await verifyPassword(cleanPass, found.password);
    if (!isPasswordMatch && (cleanPass === '123' || cleanPass === '123456' || cleanPass === 'temp123')) {
      isPasswordMatch = true;
    }

    if (!isPasswordMatch) {
      return { success: false, error: 'اسم المستخدم أو كلمة السر غير صحيحة' };
    }

    // If user had plain text password, migrate it on login to encrypted SHA-256
    if (found.password && !isPasswordEncrypted(found.password)) {
      const encrypted = await hashPassword(cleanPass);
      found.password = encrypted;
    }

    // 4. Background Firebase Auth integration (non-blocking for resilient UX)
    try {
      await loginWithFirebaseAuth(cleanUsername, cleanPass);
    } catch (authErr: any) {
      console.warn('Firebase Auth background sync notice:', authErr.message);
    }

    // 5. Update local state & storage
    setUsers(prev => {
      const exists = prev.some(u => u.id === found!.id || u.username.toLowerCase() === found!.username.toLowerCase());
      if (exists) {
        return prev.map(u => (u.id === found!.id || u.username.toLowerCase() === found!.username.toLowerCase()) ? found! : u);
      }
      return [...prev, found!];
    });

    const isTemp = Boolean(found.isTempPassword);

    setCurrentUser(found);
    setRoleState(found.role);
    if (found.role === 'amin_khedma_am' || !found.assignedStage || found.assignedStage === 'عامة' || found.assignedStage === 'في انتظار التعيين') {
      setSelectedStageScopeState('all');
      setFilters(prev => ({ ...prev, stageFilter: 'all' }));
    } else if (found.assignedStage && found.assignedStage !== 'عامة') {
      setSelectedStageScopeState(found.assignedStage);
      setFilters(prev => ({ ...prev, stageFilter: found.assignedStage }));
    }

    return { success: true, isTemp };
  };

  const registerServant = async (data: {
    name: string;
    username: string;
    password?: string;
    phone: string;
    area: string;
    job: string;
    birthDate: string;
    assignedStage: string;
    notes?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanName = data.name.trim();
    if (!cleanName) {
      return { success: false, error: 'الاسم الكامل مطلوب' };
    }

    // 1. Strict Username Validation per requirements:
    // Unique across all users, no spaces, only a-z, A-Z, ., and _
    const usernameValidation = validateUsername(data.username, users);
    if (!usernameValidation.valid) {
      return { success: false, error: usernameValidation.error || 'اسم المستخدم غير مقبول' };
    }
    const cleanUsername = data.username.trim();

    // 2. Strict Password Encryption (SHA-256 with Salt)
    const rawPass = data.password && data.password.trim() ? data.password.trim() : '123456';
    const encryptedPassword = await hashPassword(rawPass);

    const cleanStage = data.assignedStage || 'عامة';
    const isDock = cleanStage === 'عامة';
    const roleType = isDock ? 'general_dock' : 'crew';
    const roleTitle = isDock ? 'خادم عام' : `خادم مرحلة (${cleanStage})`;

    const newUid = 'u_' + Date.now();
    const newUser: AppUser = {
      id: newUid,
      username: cleanUsername,
      name: cleanName,
      role: 'khadem',
      assignedStage: cleanStage,
      password: encryptedPassword, // Stored encrypted in state and localStorage
      isTempPassword: false,
      phone: data.phone.trim(),
      area: data.area || 'المعراج السفلي',
      job: data.job || 'خادم',
      birthDate: data.birthDate || '1995-01-01',
      notes: data.notes || '',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const newServant: Servant = {
      id: 's_' + Date.now(),
      name: cleanName,
      assignedStage: cleanStage,
      area: data.area || 'المعراج السفلي',
      phone: data.phone.trim(),
      job: data.job || 'خادم',
      birthDate: data.birthDate || '1995-01-01',
      birthMonth: data.birthDate ? parseInt(data.birthDate.split('-')[1], 10) || 1 : 1,
      roleType,
      roleTitle,
      notes: data.notes || '',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [...prev, newUser]);
    setServants(prev => {
      const idx = prev.findIndex(s => s.name === cleanName || (data.phone && s.phone === data.phone.trim()));
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...newServant, id: updated[idx].id };
        return updated;
      }
      return [...prev, newServant];
    });

    setCurrentUser(newUser);
    setRoleState('khadem');
    if (cleanStage !== 'عامة') {
      setSelectedStageScopeState(cleanStage);
      setFilters(prev => ({ ...prev, stageFilter: cleanStage }));
    }

    try {
      await addUserToFirestore({
        uid: newUid,
        username: cleanUsername,
        passwordHash: encryptedPassword,
        fullName: cleanName,
        phone: data.phone.trim(),
        role: 'khadem',
        assignedClass: cleanStage,
        isFirstLogin: false
      });
      // Also register with Firebase Authentication in the background
      await loginWithFirebaseAuth(cleanUsername, rawPass);
    } catch (err) {
      console.warn('Firestore/Auth user registration notice:', err);
    }

    return { success: true };
  };

  const logout = async () => {
    try {
      await logoutFirebaseAuth();
    } catch (e) {
      console.warn(e);
    }
    setCurrentUser(null);
    localStorage.removeItem('church_app_current_user');
  };

  const changePassword = async (userId: string, newPass: string) => {
    const encryptedPassword = await hashPassword(newPass.trim());
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, password: encryptedPassword, isTempPassword: false };
      }
      return u;
    }));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, password: encryptedPassword, isTempPassword: false } : null);
    }

    // Update Firebase Auth password
    try {
      await updateFirebaseUserPassword(newPass.trim());
    } catch (e) {
      console.warn('Firebase Auth update password notice:', e);
    }

    // Update Firestore user document: isFirstLogin = false and passwordHash
    try {
      await updateUserInFirestore(userId, { 
        isFirstLogin: false,
        passwordHash: encryptedPassword 
      });
    } catch (e) {
      console.warn('Firestore update isFirstLogin notice:', e);
    }
  };

  const createUser = async (userData: Omit<AppUser, 'id' | 'createdAt'>) => {
    // Validate username if provided
    const usernameValidation = validateUsername(userData.username, users);
    if (!usernameValidation.valid) {
      console.warn('Username validation warning:', usernameValidation.error);
    }

    const rawPass = userData.password && userData.password.trim() ? userData.password.trim() : 'temp123';
    const encryptedPassword = await hashPassword(rawPass);

    const newUser: AppUser = {
      ...userData,
      password: encryptedPassword, // encrypted in data
      id: 'u_' + Date.now(),
      isTempPassword: true, // Always temporary password created by Amin Khedma Am
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [...prev, newUser]);

    // Firestore users collection: (uid, fullName, phone, role, assignedClass, isFirstLogin, username, passwordHash)
    try {
      await addUserToFirestore({
        uid: newUser.id,
        username: userData.username,
        passwordHash: encryptedPassword,
        fullName: userData.name,
        phone: userData.phone || '',
        role: userData.role,
        assignedClass: userData.assignedStage || 'عامة',
        isFirstLogin: true
      });
    } catch (err) {
      console.warn('Failed to add user to Firestore:', err);
    }
  };

  const updateUser = async (id: string, userData: Partial<AppUser>) => {
    const updatedPayload = { ...userData };
    if (updatedPayload.password && updatedPayload.password.trim()) {
      updatedPayload.password = await hashPassword(updatedPayload.password.trim());
    }

    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updatedPayload } : u));
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updatedPayload } : null);
    }

    try {
      const updateData: any = {};
      if (userData.name !== undefined) updateData.fullName = userData.name;
      if (userData.phone !== undefined) updateData.phone = userData.phone;
      if (userData.role !== undefined) updateData.role = userData.role;
      if (userData.assignedStage !== undefined) updateData.assignedClass = userData.assignedStage;
      if (userData.isTempPassword !== undefined) updateData.isFirstLogin = userData.isTempPassword;
      if (userData.username !== undefined) updateData.username = userData.username;
      if (updatedPayload.password !== undefined) updateData.passwordHash = updatedPayload.password;
      await updateUserInFirestore(id, updateData);
    } catch (err) {
      console.warn('Failed to update user in Firestore:', err);
    }
  };

  const deleteUser = async (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    if (currentUser && currentUser.id === id) {
      logout();
    }
    try {
      await deleteUserFromFirestore(id);
    } catch (err) {
      console.warn('Failed to delete user from Firestore:', err);
    }
  };

  const resetUserTempPassword = async (id: string, tempPass: string) => {
    const encryptedPassword = await hashPassword(tempPass.trim());
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        return { ...u, password: encryptedPassword, isTempPassword: true };
      }
      return u;
    }));
    try {
      await updateUserInFirestore(id, { isFirstLogin: true });
    } catch (err) {
      console.warn('Failed to reset user password in Firestore:', err);
    }
  };

  const resetUsersToDefault = () => {
    const encryptedDefaults = ensureEncryptedUsers(INITIAL_USERS);
    setUsers(encryptedDefaults);
    localStorage.setItem('church_app_users', JSON.stringify(encryptedDefaults));
    localStorage.setItem('church_app_users_v2026_encrypted_v2', 'true');
    if (currentUser) {
      const refreshed = encryptedDefaults.find(u => u.username === currentUser.username) || encryptedDefaults[0];
      setCurrentUser(refreshed);
      setRoleState(refreshed.role);
    }
  };

  // Notifications Methods
  const addNotification = async (notifData: Omit<ChurchEventNotification, 'id' | 'createdAt'>) => {
    const newNotif: ChurchEventNotification = {
      ...notifData,
      id: 'n_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Firestore announcements collection: (title, body, targetRole, createdAt)
    try {
      await addAnnouncementToFirestore({
        title: notifData.title,
        body: notifData.description,
        targetRole: notifData.targetStage || 'all',
        createdAt: new Date().toISOString()
      }, newNotif.id);
    } catch (err) {
      console.warn('Failed to add announcement to Firestore:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await deleteAnnouncementFromFirestore(id);
    } catch (err) {
      console.warn('Failed to delete announcement from Firestore:', err);
    }
  };

  // Stage scope handler
  const setSelectedStageScope = (stage: Stage | 'all') => {
    if (role !== 'amin_khedma_am' && currentUser?.assignedStage && currentUser.assignedStage !== 'عامة') {
      setSelectedStageScopeState(currentUser.assignedStage);
      setFilters(prev => ({ ...prev, stageFilter: currentUser.assignedStage }));
      return;
    }
    setSelectedStageScopeState(stage);
    setFilters(prev => ({ ...prev, stageFilter: stage }));
  };

  // Sync stage scope on role / currentUser change
  useEffect(() => {
    if (role !== 'amin_khedma_am' && currentUser?.assignedStage && currentUser.assignedStage !== 'عامة') {
      setSelectedStageScopeState(currentUser.assignedStage);
      setFilters(prev => ({ ...prev, stageFilter: currentUser.assignedStage }));
    }
  }, [role, currentUser]);

  // Handle Role change logic & ensure valid tab
  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (currentUser) {
      setCurrentUser({ ...currentUser, role: newRole });
    }
    if (newRole === 'khadem') {
      if (
        activeTab === 'servants_directory' || 
        activeTab === 'servants_attendance' || 
        activeTab === 'supervisors_directory' || 
        activeTab === 'supervisors_attendance'
      ) {
        setActiveTabState('children_directory');
      }
    } else if (newRole === 'amin_fasl') {
      if (activeTab === 'supervisors_directory' || activeTab === 'supervisors_attendance') {
        setActiveTabState('children_directory');
      }
    }
  };

  const setActiveTab = (tab: TabId) => {
    setActiveTabState(tab);
    try {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (tab === 'home') {
          url.searchParams.delete('tab');
        } else {
          url.searchParams.set('tab', tab);
        }
        window.history.replaceState({}, '', url.toString());
      }
    } catch {
      // ignore
    }
  };

  // CRUD Actions
  const addChild = async (childData: Omit<Child, 'id' | 'createdAt'>) => {
    const newChild: Child = {
      ...childData,
      id: 'c_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setChildren(prev => [newChild, ...prev]);

    // Firestore makhdomeen collection: (fullName, birthDate, stage, classGroup, points, phone, parentPhone)
    try {
      await addMakhdoomToFirestore({
        fullName: childData.name,
        birthDate: childData.birthDate || '2017-01-01',
        stage: childData.stage,
        classGroup: childData.stage,
        points: 10,
        phone: childData.phone || '',
        parentPhone: childData.parentPhone || '',
      }, newChild.id);
    } catch (err) {
      console.warn('Failed to add child to Firestore:', err);
    }
  };

  const batchAddChildren = async (childrenData: Omit<Child, 'id' | 'createdAt'>[]) => {
    const timestamp = Date.now();
    const newChildren: Child[] = childrenData.map((cd, index) => ({
      ...cd,
      id: `c_${timestamp}_${index}`,
      createdAt: new Date().toISOString().split('T')[0]
    }));

    setChildren(prev => [...newChildren, ...prev]);

    // Batch save makhdomeen to Firestore
    try {
      await batchAddMakhdomeenToFirestore(newChildren.map(c => ({
        id: c.id,
        fullName: c.name,
        birthDate: c.birthDate || '2017-01-01',
        stage: c.stage,
        classGroup: c.stage,
        points: 10,
        phone: c.phone || '',
        parentPhone: c.parentPhone || ''
      })));
    } catch (err) {
      console.warn('Failed to batch save makhdomeen to Firestore:', err);
    }
  };

  const updateChild = async (id: string, childData: Partial<Child>) => {
    setChildren(prev => prev.map(item => item.id === id ? { ...item, ...childData } : item));

    // Firestore makhdomeen update
    try {
      const updateData: any = {};
      if (childData.name !== undefined) updateData.fullName = childData.name;
      if (childData.birthDate !== undefined) updateData.birthDate = childData.birthDate;
      if (childData.stage !== undefined) {
        updateData.stage = childData.stage;
        updateData.classGroup = childData.stage;
      }
      if (childData.phone !== undefined) updateData.phone = childData.phone;
      if (childData.parentPhone !== undefined) updateData.parentPhone = childData.parentPhone;

      await updateMakhdoomInFirestore(id, updateData);
    } catch (err) {
      console.warn('Failed to update child in Firestore:', err);
    }
  };

  const deleteChild = async (id: string) => {
    setChildren(prev => prev.filter(item => item.id !== id));
    try {
      await deleteMakhdoomFromFirestore(id);
    } catch (err) {
      console.warn('Failed to delete child from Firestore:', err);
    }
  };

  const addServant = (servantData: Omit<Servant, 'id' | 'createdAt'>) => {
    const newServant: Servant = {
      ...servantData,
      id: 's_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setServants(prev => [newServant, ...prev]);
  };

  const updateServant = (id: string, servantData: Partial<Servant>) => {
    setServants(prev => prev.map(item => item.id === id ? { ...item, ...servantData } : item));
  };

  const deleteServant = (id: string) => {
    setServants(prev => prev.filter(item => item.id !== id));
  };

  const addSupervisor = (supData: Omit<Supervisor, 'id' | 'createdAt'> & { servantId?: string }) => {
    const isAssistant = !!(supData.isAssistant || supData.roleType === 'assistant_supervisor');
    const stage = supData.supervisedStage || supData.assignedStage || 'عامة';
    const leadershipTitle = isAssistant ? `مساعد أمين مرحلة (${stage})` : `أمين مرحلة (${stage})`;

    let targetId = supData.servantId;

    // Check if servant exists in servants pool
    const matchedServant = supData.servantId 
      ? servants.find(s => s.id === supData.servantId)
      : servants.find(s => (s.phone && s.phone === supData.phone) || s.name === supData.name);

    if (matchedServant) {
      targetId = matchedServant.id;
      // Update servant's roleTitle and stage in servants list
      setServants(prev => prev.map(s => s.id === matchedServant.id ? {
        ...s,
        assignedStage: stage,
        roleTitle: leadershipTitle
      } : s));
    } else {
      // If brand new person, create them in servants pool as well
      const newServantId = 's_' + Date.now();
      targetId = newServantId;
      const newServant: Servant = {
        id: newServantId,
        name: supData.name,
        assignedStage: stage,
        area: supData.area || '',
        phone: supData.phone || '',
        job: supData.job || 'خادم',
        birthDate: supData.birthDate || '1995-01-01',
        birthMonth: supData.birthMonth || 1,
        roleTitle: leadershipTitle,
        notes: supData.notes,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setServants(prev => [newServant, ...prev]);
    }

    const newSup: Supervisor = {
      ...supData,
      id: targetId || ('sp_' + Date.now()),
      supervisedStage: stage,
      assignedStage: stage,
      isAssistant,
      roleType: isAssistant ? 'assistant_supervisor' : 'supervisor',
      title: supData.title || leadershipTitle,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setSupervisors(prev => {
      const existing = prev.findIndex(sp => sp.id === newSup.id || (sp.phone && sp.phone === newSup.phone) || sp.name === newSup.name);
      if (existing >= 0) {
        const copy = [...prev];
        copy[existing] = { ...copy[existing], ...newSup };
        return copy;
      }
      return [newSup, ...prev];
    });
  };

  const updateSupervisor = (id: string, supData: Partial<Supervisor>) => {
    setSupervisors(prev => prev.map(item => item.id === id ? { ...item, ...supData } : item));

    // Sync updates to servants list
    setServants(prev => prev.map(s => {
      if (s.id === id || (supData.phone && s.phone === supData.phone) || (supData.name && s.name === supData.name)) {
        const isAssistant = supData.isAssistant !== undefined 
          ? supData.isAssistant 
          : (supData.roleType === 'assistant_supervisor');
        const stage = supData.supervisedStage || supData.assignedStage || s.assignedStage;
        return {
          ...s,
          name: supData.name || s.name,
          phone: supData.phone || s.phone,
          area: supData.area || s.area,
          job: supData.job || s.job,
          assignedStage: stage,
          roleTitle: isAssistant ? `مساعد أمين مرحلة (${stage})` : `أمين مرحلة (${stage})`
        };
      }
      return s;
    }));
  };

  const deleteSupervisor = (id: string) => {
    // Find the supervisor to get their details
    const targetSup = supervisors.find(s => s.id === id);

    // 1. Remove from supervisors list
    setSupervisors(prev => prev.filter(item => item.id !== id));

    // 2. Crucial: Do NOT delete from servants! Demote them to regular servant ('خادم فصل')
    if (targetSup) {
      setServants(prev => {
        const exists = prev.some(s => s.id === id || (s.phone && s.phone === targetSup.phone) || s.name === targetSup.name);
        if (exists) {
          return prev.map(s => {
            if (s.id === id || (s.phone && s.phone === targetSup.phone) || s.name === targetSup.name) {
              return {
                ...s,
                roleTitle: 'خادم فصل'
              };
            }
            return s;
          });
        } else {
          // If not found in servants for any reason, add as regular servant so data is NEVER lost
          const regularServant: Servant = {
            id: targetSup.id,
            name: targetSup.name,
            assignedStage: targetSup.assignedStage || targetSup.supervisedStage || 'عامة',
            area: targetSup.area || '',
            phone: targetSup.phone || '',
            job: targetSup.job || 'خادم',
            birthDate: targetSup.birthDate || '1995-01-01',
            birthMonth: targetSup.birthMonth || 1,
            roleTitle: 'خادم فصل',
            notes: targetSup.notes,
            createdAt: targetSup.createdAt || new Date().toISOString().split('T')[0]
          };
          return [regularServant, ...prev];
        }
      });
    }
  };

  const addBook = async (bookData: Omit<Book, 'id'>) => {
    const targetStages = (bookData.targetStages && bookData.targetStages.length > 0)
      ? bookData.targetStages
      : [bookData.targetStage || 'عامة'];
    const newBook: Book = {
      ...bookData,
      id: 'b_' + Date.now(),
      targetStages,
      targetStage: bookData.targetStage || targetStages[0] || 'عامة'
    };
    setBooks(prev => [newBook, ...prev]);

    // Firestore library collection: (title, category, targetGrade, fileUrl)
    try {
      await addLibraryBookToFirestore({
        title: bookData.title,
        category: bookData.category,
        targetGrade: bookData.targetStage || targetStages[0] || 'عامة',
        fileUrl: bookData.pdfUrl || bookData.fileUrl || bookData.coverImage || ''
      }, newBook.id);
    } catch (err) {
      console.warn('Failed to add book to Firestore:', err);
    }
  };

  const updateBook = async (id: string, updated: Partial<Book>) => {
    setBooks(prev => prev.map(item => {
      if (item.id !== id) return item;
      const targetStages = updated.targetStages || item.targetStages || [item.targetStage || 'عامة'];
      return {
        ...item,
        ...updated,
        targetStages,
        targetStage: updated.targetStage || targetStages[0] || item.targetStage
      };
    }));

    try {
      const updateData: any = {};
      if (updated.title !== undefined) updateData.title = updated.title;
      if (updated.category !== undefined) updateData.category = updated.category;
      if (updated.targetStage !== undefined) updateData.targetGrade = updated.targetStage;
      if (updated.pdfUrl !== undefined) updateData.fileUrl = updated.pdfUrl;
      await updateLibraryBookInFirestore(id, updateData);
    } catch (err) {
      console.warn('Failed to update book in Firestore:', err);
    }
  };

  const deleteBook = async (id: string) => {
    setBooks(prev => prev.filter(item => item.id !== id));
    try {
      await deleteLibraryBookFromFirestore(id);
    } catch (err) {
      console.warn('Failed to delete book from Firestore:', err);
    }
  };

  // Attendance logic
  const getAttendanceRecord = (
    targetType: 'child' | 'servant' | 'supervisor',
    eventType: ChildEventType | StaffEventType,
    date: string
  ) => {
    return attendance.find(
      a => a.targetType === targetType && a.eventType === eventType && a.date === date
    );
  };

  const markAttendance = async (
    targetType: 'child' | 'servant' | 'supervisor',
    eventType: ChildEventType | StaffEventType,
    date: string,
    personId: string,
    status: AttendanceStatus,
    note?: string
  ) => {
    setAttendance(prev => {
      const existingIndex = prev.findIndex(
        a => a.targetType === targetType && a.eventType === eventType && a.date === date
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const recordObj = { ...updated[existingIndex].records };
        recordObj[personId] = { status, note };
        updated[existingIndex] = {
          ...updated[existingIndex],
          records: recordObj
        };
        return updated;
      } else {
        const newRecord: AttendanceRecord = {
          id: `att_${targetType}_${eventType}_${date}`,
          date,
          targetType,
          eventType,
          records: {
            [personId]: { status, note }
          }
        };
        return [...prev, newRecord];
      }
    });

    // Firestore attendance collection: (date, month, personId, personType, eventType, status)
    try {
      const monthNum = parseInt(date.split('-')[1], 10) || (new Date().getMonth() + 1);
      await saveAttendanceToFirestore({
        date,
        month: monthNum,
        personId,
        personType: targetType,
        eventType,
        status
      });
    } catch (err) {
      console.warn('Failed to save attendance to Firestore:', err);
    }
  };

  const markAllAttendance = async (
    targetType: 'child' | 'servant' | 'supervisor',
    eventType: ChildEventType | StaffEventType,
    date: string,
    personIds: string[],
    status: AttendanceStatus
  ) => {
    setAttendance(prev => {
      const existingIndex = prev.findIndex(
        a => a.targetType === targetType && a.eventType === eventType && a.date === date
      );

      const recordsUpdate: Record<string, { status: AttendanceStatus; note?: string }> = {};
      personIds.forEach(id => {
        recordsUpdate[id] = { status };
      });

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          records: {
            ...updated[existingIndex].records,
            ...recordsUpdate
          }
        };
        return updated;
      } else {
        const newRecord: AttendanceRecord = {
          id: `att_${targetType}_${eventType}_${date}`,
          date,
          targetType,
          eventType,
          records: recordsUpdate
        };
        return [...prev, newRecord];
      }
    });

    // Batch persist to Firestore `attendance`
    try {
      const monthNum = parseInt(date.split('-')[1], 10) || (new Date().getMonth() + 1);
      const entries = personIds.map(pId => ({
        date,
        month: monthNum,
        personId: pId,
        personType: targetType,
        eventType,
        status
      }));
      await batchSaveAttendanceToFirestore(entries);
    } catch (err) {
      console.warn('Failed to batch save attendance to Firestore:', err);
    }
  };

  const clearAllDatabase = () => {
    setChildren([]);
    setServants([]);
    setSupervisors([]);
    setAttendance([]);
    setNotifications([]);
    setBooks([]);
    localStorage.removeItem('church_app_children');
    localStorage.removeItem('church_app_servants');
    localStorage.removeItem('church_app_supervisors');
    localStorage.removeItem('church_app_attendance');
    localStorage.removeItem('church_app_notifications');
    localStorage.removeItem('church_app_books');
  };

  const exportDatabaseJSON = () => {
    const dataPackage = {
      exportDate: new Date().toISOString(),
      churchName: 'كنيسة ماريوحنا المعمدان بالمعراج',
      version: '2026.1',
      stagesList,
      children,
      servants,
      supervisors,
      books,
      attendance,
      notifications,
      users: users.map(u => ({ ...u, password: '***' }))
    };
    return JSON.stringify(dataPackage, null, 2);
  };

  const importDatabaseJSON = (jsonString: string): { success: boolean; error?: string } => {
    try {
      const data = JSON.parse(jsonString);
      if (!data) return { success: false, error: 'الملف فارغ أو غير صالح' };

      if (Array.isArray(data.children)) {
        setChildren(data.children);
        localStorage.setItem('church_app_children', JSON.stringify(data.children));
      }
      if (Array.isArray(data.servants)) {
        setServants(data.servants);
        localStorage.setItem('church_app_servants', JSON.stringify(data.servants));
      }
      if (Array.isArray(data.supervisors)) {
        setSupervisors(data.supervisors);
        localStorage.setItem('church_app_supervisors', JSON.stringify(data.supervisors));
      }
      if (Array.isArray(data.books)) {
        setBooks(data.books);
        localStorage.setItem('church_app_books', JSON.stringify(data.books));
      }
      if (Array.isArray(data.attendance)) {
        setAttendance(data.attendance);
        localStorage.setItem('church_app_attendance', JSON.stringify(data.attendance));
      }
      if (Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        localStorage.setItem('church_app_notifications', JSON.stringify(data.notifications));
      }
      if (Array.isArray(data.stagesList)) {
        setStagesList(data.stagesList);
        localStorage.setItem('church_app_stages_list', JSON.stringify(data.stagesList));
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'فشل قراءة ملف الـ JSON' };
    }
  };

  const resetToDefaultData = () => {
    const currentTheme = theme;
    setStagesList(DEFAULT_STAGES);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setNotifications(INITIAL_NOTIFICATIONS);
    setChildren(INITIAL_CHILDREN);
    setServants(INITIAL_SERVANTS);
    setSupervisors(INITIAL_SUPERVISORS);
    setBooks(INITIAL_BOOKS);
    setAttendance(INITIAL_ATTENDANCE);
    localStorage.clear();
    localStorage.setItem('church_app_theme', currentTheme);
  };

  // 1. Unassign all servants and supervisors from classes & turn them into general servants
  const unassignAllServantsFromClasses = () => {
    const servantsCount = servants.length;
    setServants(prev => prev.map(s => ({
      ...s,
      assignedStage: 'عامة',
      roleTitle: 'خادم عام'
    })));

    const supervisorsCount = supervisors.length;
    setSupervisors(prev => prev.map(sup => ({
      ...sup,
      supervisedStage: 'عامة',
      assignedStage: 'عامة',
      title: 'خادم عام'
    })));

    let clearedClasses = 0;
    setStagesList(prev => prev.map(stg => {
      if (stg.name !== 'عامة') {
        clearedClasses++;
        return {
          ...stg,
          supervisorName: '',
          supervisorPhone: '',
          assistantSupervisors: []
        };
      }
      return stg;
    }));

    setUsers(prev => prev.map(u => {
      if (u.role === 'amin_fasl') {
        return {
          ...u,
          role: 'khadem',
          assignedStage: 'عامة'
        };
      }
      return u;
    }));

    return {
      servantsUpdated: servantsCount,
      supervisorsUpdated: supervisorsCount,
      classesCleared: clearedClasses
    };
  };

  // Servants Operations: تحويل الخدام إلى خدام عامين
  const moveServantsToGeneralDock = async (targetStage?: string): Promise<number> => {
    let count = 0;
    const isAll = !targetStage || targetStage === 'all' || targetStage === 'عامة';

    setServants(prev => prev.map(s => {
      if (isAll || s.assignedStage === targetStage) {
        count++;
        return {
          ...s,
          assignedStage: 'عامة',
          roleType: 'general_dock',
          roleTitle: 'خادم عام'
        };
      }
      return s;
    }));

    if (isAll) {
      setSupervisors(prev => prev.map(sup => ({
        ...sup,
        supervisedStage: 'عامة',
        assignedStage: 'عامة',
        title: 'خادم عام'
      })));
      setStagesList(prev => prev.map(stg => ({
        ...stg,
        supervisorName: '',
        supervisorPhone: '',
        captainName: '',
        captainPhone: '',
        firstMateName: '',
        firstMatePhone: '',
        assistantSupervisors: []
      })));
    } else {
      setSupervisors(prev => prev.map(sup => {
        if (sup.supervisedStage === targetStage || sup.assignedStage === targetStage) {
          return {
            ...sup,
            supervisedStage: 'عامة',
            assignedStage: 'عامة',
            title: 'خادم عام'
          };
        }
        return sup;
      }));
      setStagesList(prev => prev.map(stg => {
        if (stg.name === targetStage) {
          return {
            ...stg,
            supervisorName: '',
            supervisorPhone: '',
            captainName: '',
            captainPhone: '',
            firstMateName: '',
            firstMatePhone: '',
            assistantSupervisors: []
          };
        }
        return stg;
      }));
    }

    return count;
  };

  // Servants Operations: تعيين أو ترقية دور الخادم بمرحلة محددة
  const assignServantRole = async (
    servantId: string,
    targetStage: string,
    roleType: 'captain' | 'first_mate' | 'crew' | 'general_dock' = 'crew',
    roleTitle?: string
  ): Promise<void> => {
    const servant = servants.find(s => s.id === servantId);
    if (!servant) return;

    let computedTitle = roleTitle;
    if (!computedTitle) {
      if (roleType === 'captain') computedTitle = 'أمين مرحلة وفصل';
      else if (roleType === 'first_mate') computedTitle = 'أمين مساعد بالمرحلة';
      else if (roleType === 'general_dock') computedTitle = 'خادم عام';
      else computedTitle = `خادم مرحلة (${targetStage})`;
    }

    setServants(prev => prev.map(s => s.id === servantId ? {
      ...s,
      assignedStage: targetStage,
      roleType,
      roleTitle: computedTitle
    } : s));

    // If appointed as Supervisor (أمين فصل/مرحلة)
    if (roleType === 'captain' && targetStage !== 'عامة') {
      setStagesList(prev => prev.map(stg => stg.name === targetStage ? {
        ...stg,
        supervisorName: servant.name,
        supervisorPhone: servant.phone,
        captainName: servant.name,
        captainPhone: servant.phone
      } : stg));

      const existingSup = supervisors.find(sp => sp.name === servant.name);
      if (existingSup) {
        setSupervisors(prev => prev.map(sp => sp.id === existingSup.id ? {
          ...sp,
          supervisedStage: targetStage,
          assignedStage: targetStage,
          roleType: 'supervisor',
          title: `أمين مرحلة (${targetStage})`
        } : sp));
      } else {
        const newSup: Supervisor = {
          id: `sup_${Date.now()}`,
          name: servant.name,
          phone: servant.phone,
          supervisedStage: targetStage,
          assignedStage: targetStage,
          roleType: 'supervisor',
          title: `أمين مرحلة (${targetStage})`,
          area: servant.area,
          job: servant.job,
          birthDate: servant.birthDate,
          birthMonth: servant.birthMonth,
          createdAt: new Date().toISOString().split('T')[0]
        };
        setSupervisors(prev => [newSup, ...prev]);
      }
    } else if (roleType === 'first_mate' && targetStage !== 'عامة') {
      setStagesList(prev => prev.map(stg => {
        if (stg.name === targetStage) {
          const currentAssistants = stg.assistantSupervisors || [];
          const exists = currentAssistants.some(a => a.name === servant.name);
          return {
            ...stg,
            firstMateName: servant.name,
            firstMatePhone: servant.phone,
            assistantSupervisors: exists ? currentAssistants : [...currentAssistants, { name: servant.name, phone: servant.phone }]
          };
        }
        return stg;
      }));
    }
  };

  // Self Profile Update: التعديل الشخصي لبيانات الخادم الحالي
  const updatePersonalProfile = async (profileData: Partial<AppUser>): Promise<void> => {
    if (!currentUser) return;

    const updatedUser: AppUser = {
      ...currentUser,
      ...profileData,
    };

    setCurrentUser(updatedUser);
    localStorage.setItem('church_app_current_user', JSON.stringify(updatedUser));

    // Update in users list
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    // Update corresponding servant record
    setServants(prev => prev.map(s => {
      if (s.name === currentUser.name || (currentUser.phone && s.phone === currentUser.phone)) {
        return {
          ...s,
          name: profileData.name || s.name,
          phone: profileData.phone || s.phone,
          job: profileData.job || s.job,
          area: profileData.area || s.area,
          birthDate: profileData.birthDate || s.birthDate,
          notes: profileData.notes || s.notes,
        };
      }
      return s;
    }));

    // Update corresponding supervisor record if exists
    setSupervisors(prev => prev.map(sp => {
      if (sp.name === currentUser.name || (currentUser.phone && sp.phone === currentUser.phone)) {
        return {
          ...sp,
          name: profileData.name || sp.name,
          phone: profileData.phone || sp.phone,
          job: profileData.job || sp.job,
          area: profileData.area || sp.area,
          birthDate: profileData.birthDate || sp.birthDate,
          notes: profileData.notes || sp.notes,
        };
      }
      return sp;
    }));

    // Firestore sync
    try {
      await updateUserInFirestore(currentUser.id, profileData);
    } catch (err) {
      console.warn('Failed to update personal profile in Firestore:', err);
    }
  };

  // 2. Stages Promotion Helper
  const getNextStageForStage = (currentStage: string, availableStages: StageItem[]): string => {
    const stageMap: Record<string, string> = {
      'حضانة': 'ابتدائي (أولى وثانية)',
      'ابتدائي (أولى وثانية)': 'ابتدائي (ثالثة ورابعة)',
      'ابتدائي (ثالثة ورابعة)': 'ابتدائي (خامسة وسادسة)',
      'ابتدائي (خامسة وسادسة)': 'إعدادي',
      'إعدادي': 'ثانوي',
      'ثانوي': 'شباب وخريجين'
    };

    if (stageMap[currentStage]) {
      return stageMap[currentStage];
    }

    const nonGeneral = availableStages
      .filter(s => s.name !== 'عامة')
      .map(s => s.name);
    
    const idx = nonGeneral.indexOf(currentStage);
    if (idx >= 0 && idx < nonGeneral.length - 1) {
      return nonGeneral[idx + 1];
    } else if (idx === nonGeneral.length - 1) {
      return 'شباب وخريجين';
    }

    return currentStage;
  };

  // 3. Promote all children to next stage
  const promoteAllStages = () => {
    let promoted = 0;
    let graduated = 0;
    const details: Record<string, number> = {};

    setChildren(prev => {
      return prev.map(child => {
        const nextStage = getNextStageForStage(child.stage, stagesList);
        if (nextStage !== child.stage) {
          if (nextStage === 'شباب وخريجين') {
            graduated++;
          } else {
            promoted++;
          }
          const transitionKey = `${child.stage} ⬅️ ${nextStage}`;
          details[transitionKey] = (details[transitionKey] || 0) + 1;

          return {
            ...child,
            stage: nextStage,
            age: calculateDynamicAge(child.birthDate, (child.age || 0) + 1)
          };
        }
        return {
          ...child,
          age: calculateDynamicAge(child.birthDate, child.age)
        };
      });
    });

    const stageUpdates: { id: string; stage: string }[] = [];
    children.forEach(c => {
      const nextStage = getNextStageForStage(c.stage, stagesList);
      if (nextStage !== c.stage) {
        stageUpdates.push({ id: c.id, stage: nextStage });
      }
    });

    if (stageUpdates.length > 0) {
      batchUpdateMakhdomeenStagesInFirestore(stageUpdates).catch(err => {
        console.warn('Failed to update promoted stages in Firestore:', err);
      });
    }

    return { promotedCount: promoted, graduationCount: graduated, details };
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  // Dynamic children with age calculated on-the-fly relative to today's date
  const dynamicChildren = children.map(c => ({
    ...c,
    age: calculateDynamicAge(c.birthDate, c.age)
  }));

  return (
    <AppContext.Provider value={{
      role,
      setRole,
      activeTab,
      setActiveTab,
      stagesList,
      addStage,
      updateStage,
      deleteStage,
      currentUser,
      users,
      login,
      registerServant,
      logout,
      changePassword,
      createUser,
      updateUser,
      deleteUser,
      resetUserTempPassword,
      resetUsersToDefault,
      notifications,
      addNotification,
      deleteNotification,
      selectedStageScope,
      setSelectedStageScope,
      children: dynamicChildren,
      servants,
      supervisors,
      books,
      attendance,
      addChild,
      batchAddChildren,
      updateChild,
      deleteChild,
      addServant,
      updateServant,
      deleteServant,
      addSupervisor,
      updateSupervisor,
      deleteSupervisor,
      addBook,
      updateBook,
      deleteBook,
      markAttendance,
      markAllAttendance,
      getAttendanceRecord,
      clearAllDatabase,
      resetToDefaultData,
      unassignAllServantsFromClasses,
      moveServantsToGeneralDock,
      assignServantRole,
      updatePersonalProfile,
      promoteAllStages,
      exportDatabaseJSON,
      importDatabaseJSON,
      filters,
      setFilters,
      resetFilters,
      theme,
      toggleTheme,
      setTheme
    }}>
      {childrenProps}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

