import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Navbar from '../components/dashboard/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

const StudentLayout = ({ children, searchQuery, setSearchQuery }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-slate-50 flex font-sans overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Dynamic Layout Wrapper */}
      <div 
        className="student-content-wrapper flex-grow flex flex-col h-screen min-w-0 overflow-hidden transition-all duration-300"
        style={{
          paddingLeft: isSidebarCollapsed ? '80px' : '260px'
        }}
      >
        {/* CSS Override for Mobile Responsiveness */}
        <style>{`
          @media (max-width: 768px) {
            .student-content-wrapper {
              padding-left: 0px !important;
            }
          }
        `}</style>

        {/* Top Navbar */}
        <Navbar 
          isCollapsed={isSidebarCollapsed}
          setIsMobileOpen={setIsMobileSidebarOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Dynamic Inner Page Content with Fading Transition */}
        <main className="flex-grow overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
