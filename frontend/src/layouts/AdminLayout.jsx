import React, { useState } from 'react';
import AdminSidebar from '../components/dashboard/AdminSidebar';
import AdminNavbar from '../components/dashboard/AdminNavbar';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = ({ 
  children,
  selectedSubject,
  setSelectedSubject,
  searchQuery,
  setSearchQuery
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 flex font-sans transition-colors duration-300 text-slate-800 dark:text-slate-200 overflow-hidden">
      
      {/* Admin Sidebar Panel */}
      <AdminSidebar 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
      />

      {/* Main Content Wrapper */}
      <div 
        className="main-content-wrapper flex-grow flex flex-col h-screen min-w-0 overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          paddingLeft: isSidebarCollapsed ? '80px' : '280px'
        }}
      >
        {/* CSS Override for Responsive Breaks */}
        <style>{`
          @media (max-width: 768px) {
            .main-content-wrapper {
              padding-left: 0px !important;
            }
          }
        `}</style>

        {/* Top Sticky Navbar */}
        <AdminNavbar 
          setIsMobileOpen={setIsMobileSidebarOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Inner Page Content */}
        <main className="flex-grow overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;
