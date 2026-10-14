import React, { useState, useEffect } from 'react';
import { AppProvider, useApp, TabId } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { AppHeader } from './components/AppHeader';
import { HomeTab } from './components/HomeTab';
import { LibraryTab } from './components/LibraryTab';
import { ChildrenDirectoryTab } from './components/ChildrenDirectoryTab';
import { ChildrenAttendanceTab } from './components/ChildrenAttendanceTab';
import { ServantsDirectoryTab } from './components/ServantsDirectoryTab';
import { ServantsAttendanceTab } from './components/ServantsAttendanceTab';
import { SupervisorsDirectoryTab } from './components/SupervisorsDirectoryTab';
import { SupervisorsAttendanceTab } from './components/SupervisorsAttendanceTab';
import { PersonModal } from './components/PersonModal';
import { BookModal } from './components/BookModal';
import { BirthdayWidget } from './components/BirthdayWidget';
import { LoginModal } from './components/LoginModal';
import { LoginPage } from './components/LoginPage';
import { ForcePasswordChangeModal } from './components/ForcePasswordChangeModal';
import { UserManagementModal } from './components/UserManagementModal';
import { ServicesManagerModal } from './components/ServicesManagerModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { PersonalProfileModal } from './components/PersonalProfileModal';
import { Child, Servant, Supervisor, Book } from './types';
import { RotateCcw, Cross } from 'lucide-react';

function AppContent() {
  const { 
    currentUser, role, activeTab, setActiveTab, addChild, updateChild, addServant, updateServant, 
    addSupervisor, updateSupervisor, addBook, updateBook, resetToDefaultData 
  } = useApp();

  // Mobile sidebar drawer state
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  // Person Modal State
  const [personModalOpen, setPersonModalOpen] = useState(false);
  const [personModalType, setPersonModalType] = useState<'child' | 'servant' | 'supervisor'>('child');
  const [editingPerson, setEditingPerson] = useState<any>(null);

  // Book Modal State
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookToView, setBookToView] = useState<Book | null>(null);

  // Birthday Widget State
  const [birthdayOpen, setBirthdayOpen] = useState(false);

  // Auth, Profile & Harbor Management State
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [servicesManagerOpen, setServicesManagerOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // RBAC Guard: Protect routes and tabs based on role
  useEffect(() => {
    if (!currentUser) return;

    if (role === 'khadem') {
      const allowedKhademTabs: TabId[] = [
        'home', 'library', 'children_attendance', 'children_directory', 'servants_attendance', 'servants_directory'
      ];
      if (!allowedKhademTabs.includes(activeTab)) {
        setActiveTab('children_attendance');
      }
    } else if (role === 'amin_fasl') {
      const allowedAminFaslTabs: TabId[] = [
        'home', 'library', 'children_attendance', 'children_directory',
        'servants_directory', 'servants_attendance'
      ];
      if (!allowedAminFaslTabs.includes(activeTab)) {
        setActiveTab('children_attendance');
      }
    } else if (role === 'amin_khedma_am') {
      const allowedAminAmTabs: TabId[] = [
        'home', 'library', 'children_attendance', 'children_directory',
        'servants_directory', 'servants_attendance', 'supervisors_directory', 'supervisors_attendance'
      ];
      if (!allowedAminAmTabs.includes(activeTab)) {
        setActiveTab('supervisors_directory');
      }
    }
  }, [role, activeTab, currentUser, setActiveTab]);

  // If user is not logged in, render the dedicated Login Page
  if (!currentUser) {
    return <LoginPage />;
  }

  // If user has temporary password / isFirstLogin: true, block access until updated
  if (currentUser.isTempPassword) {
    return <ForcePasswordChangeModal />;
  }

  // Modal Triggers for Children
  const handleOpenAddChild = () => {
    setEditingPerson(null);
    setPersonModalType('child');
    setPersonModalOpen(true);
  };

  const handleOpenEditChild = (child: Child) => {
    setEditingPerson(child);
    setPersonModalType('child');
    setPersonModalOpen(true);
  };

  const handleOpenViewChild = (child: Child) => {
    setEditingPerson(child);
    setPersonModalType('child');
    setPersonModalOpen(true);
  };

  // Modal Triggers for Servants
  const handleOpenAddServant = () => {
    setEditingPerson(null);
    setPersonModalType('servant');
    setPersonModalOpen(true);
  };

  const handleOpenEditServant = (servant: Servant) => {
    setEditingPerson(servant);
    setPersonModalType('servant');
    setPersonModalOpen(true);
  };

  // Modal Triggers for Supervisors
  const handleOpenAddSupervisor = () => {
    setEditingPerson(null);
    setPersonModalType('supervisor');
    setPersonModalOpen(true);
  };

  const handleOpenEditSupervisor = (sup: Supervisor) => {
    setEditingPerson(sup);
    setPersonModalType('supervisor');
    setPersonModalOpen(true);
  };

  // Modal Triggers for Books
  const handleOpenAddBook = () => {
    setBookToView(null);
    setBookModalOpen(true);
  };

  const handleOpenViewBook = (book: Book) => {
    setBookToView(book);
    setBookModalOpen(true);
  };

  // Person Save Handler
  const handleSavePerson = (data: any) => {
    if (personModalType === 'child') {
      if (editingPerson) updateChild(editingPerson.id, data);
      else addChild(data);
    } else if (personModalType === 'servant') {
      if (editingPerson) updateServant(editingPerson.id, data);
      else addServant(data);
    } else {
      if (editingPerson) updateSupervisor(editingPerson.id, data);
      else addSupervisor(data);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] dark:bg-[#12050b] text-slate-900 dark:text-stone-100 flex flex-row font-['Cairo',sans-serif] selection:bg-burgundy-700 selection:text-churchgold-200 transition-colors duration-200" dir="rtl">
      
      {/* Sidebar Navigation on the Side */}
      {/* Sidebar Navigation on the Side */}
      <Sidebar 
        isOpenMobile={sidebarMobileOpen}
        onCloseMobile={() => setSidebarMobileOpen(false)}
        onOpenBirthdays={() => setBirthdayOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenUserManagement={() => setUserManagementOpen(true)}
        onOpenServicesManager={() => setServicesManagerOpen(true)}
        onResetData={() => resetToDefaultData()}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* PWA App Install Banner */}
        <PWAInstallBanner />

        {/* Top Header */}
        <AppHeader 
          onToggleSidebar={() => setSidebarMobileOpen(prev => !prev)}
          onOpenBirthdays={() => setBirthdayOpen(true)}
          onOpenLogin={() => setLoginModalOpen(true)}
          onOpenProfile={() => setProfileModalOpen(true)}
          onOpenUserManagement={() => setUserManagementOpen(true)}
          onOpenServicesManager={() => setServicesManagerOpen(true)}
        />

        {/* Main View Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 main-content-area">
          {activeTab === 'home' && (
            <HomeTab
              onOpenAddChild={handleOpenAddChild}
              onOpenBirthdays={() => setBirthdayOpen(true)}
              onOpenUserManagement={() => setUserManagementOpen(true)}
              onOpenProfile={() => setProfileModalOpen(true)}
            />
          )}

          {activeTab === 'library' && (
            <LibraryTab
              onOpenAddBook={handleOpenAddBook}
              onViewBook={handleOpenViewBook}
            />
          )}

          {activeTab === 'children_directory' && (
            <ChildrenDirectoryTab
              onAddChild={handleOpenAddChild}
              onEditChild={handleOpenEditChild}
              onViewChild={handleOpenViewChild}
            />
          )}

          {activeTab === 'children_attendance' && (
            <ChildrenAttendanceTab />
          )}

          {activeTab === 'servants_directory' && (
            <ServantsDirectoryTab
              onAddServant={handleOpenAddServant}
              onEditServant={handleOpenEditServant}
            />
          )}

          {activeTab === 'servants_attendance' && (
            <ServantsAttendanceTab />
          )}

          {activeTab === 'supervisors_directory' && (
            <SupervisorsDirectoryTab
              onAddSupervisor={handleOpenAddSupervisor}
              onEditSupervisor={handleOpenEditSupervisor}
            />
          )}

          {activeTab === 'supervisors_attendance' && (
            <SupervisorsAttendanceTab />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-[#190912] border-t border-amber-200/60 dark:border-[#381321] mt-12 py-5 text-xs text-slate-500 dark:text-stone-400 no-print transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 font-semibold text-slate-700 dark:text-stone-200">
              <img 
                src="/church_logo.jpg" 
                alt="شعار كنيسة ماريوحنا المعمدان" 
                className="w-5 h-5 rounded-full object-cover ring-1 ring-churchgold-400"
                referrerPolicy="no-referrer" 
              />
              <span>كنيسة ماريوحنا المعمدان بالمعراج - مطرانية المعادي للأقباط الأرثوذكس</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (confirm('هل ترغب في إعادة ضبط البيانات الافتراضية للكنيسة؟')) {
                    resetToDefaultData();
                  }
                }}
                className="inline-flex items-center gap-1 text-stone-400 hover:text-burgundy-700 dark:hover:text-churchgold-300 font-bold transition-colors cursor-pointer"
                title="إعادة ضبط البيانات للأصل"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>استعادة البيانات الافتراضية</span>
              </button>
            </div>
          </div>
        </footer>

      </div>

      {/* Modals */}
      <PersonModal
        isOpen={personModalOpen}
        onClose={() => setPersonModalOpen(false)}
        type={personModalType}
        initialData={editingPerson}
        onSave={handleSavePerson}
      />

      <BookModal
        isOpen={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        bookToView={bookToView}
        onAddBook={(bookData) => addBook(bookData)}
        onUpdateBook={updateBook}
      />

      <BirthdayWidget
        isOpen={birthdayOpen}
        onClose={() => setBirthdayOpen(false)}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      <UserManagementModal
        isOpen={userManagementOpen}
        onClose={() => setUserManagementOpen(false)}
      />

      <ServicesManagerModal
        isOpen={servicesManagerOpen}
        onClose={() => setServicesManagerOpen(false)}
      />

      <PersonalProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
