import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar />

      <div className="flex flex-1 pt-16">
        {/* Left Navigation Drawer */}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Dynamic Margin Content Page */}
        <main 
          className={`flex-1 min-w-0 p-6 md:p-8 transition-all duration-300 ${
            sidebarOpen ? 'pl-20 md:pl-64' : 'pl-20'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
