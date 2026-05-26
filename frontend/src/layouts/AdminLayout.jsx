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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans transition-colors duration-300 text-slate-800 dark:text-slate-200">
      
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
        className="flex-grow flex flex-col min-w-0 transition-all duration-300 ease-in-out"
        style={{
          paddingLeft: isSidebarCollapsed ? '90px' : '280px'
        }}
      >
        {/* CSS Override for Responsive Breaks */}
        <style>{`
          @media (max-width: 768px) {
            .flex-grow {
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
        <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
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
