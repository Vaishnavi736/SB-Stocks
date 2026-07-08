import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar, { SIDEBAR_TRANSITION, SIDEBAR_WIDTH_OPEN, SIDEBAR_WIDTH_CLOSED } from './Sidebar';
import TickerTape from '../components/TickerTape';
import PageTransition from '../components/PageTransition';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const edge = sidebarOpen ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSED;

  return (
    <div className="min-h-screen bg-surface-canvas text-text-primary flex flex-col">
      {/* Top Navigation */}
      <Navbar />

      {/* Live Ticker Strip */}
      <div className="fixed top-16 left-0 right-0 z-30">
        <TickerTape />
      </div>

      <div className="flex flex-1 pt-[6.25rem]">
        {/* Left Navigation Drawer — 10% of the viewport when open, fully collapsed to 0 when closed */}
        <Sidebar isOpen={sidebarOpen} />

        {/* Floating toggle handle — lives outside the sidebar's own box so it stays
            clickable even when the sidebar has collapsed to zero width. It slides
            along with the sidebar edge, in perfect sync with both animations below. */}
        <motion.button
          onClick={toggleSidebar}
          animate={{ left: edge }}
          transition={SIDEBAR_TRANSITION}
          className="fixed top-[9rem] z-30 -translate-x-1/2 w-7 h-14 rounded-full bg-surface-raised border border-border-subtle shadow-elevation-2 flex items-center justify-center text-text-secondary hover:text-brand-500 hover:border-brand-500/40 transition-colors"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </motion.button>

        {/* Content Page — width always matches 100% minus whatever the sidebar is
            currently taking (0% closed / 10% open), animated with the identical
            duration/easing as the sidebar so both settle at the same instant */}
        <main
          style={{ paddingLeft: edge }}
          className="flex-1 min-w-0 p-6 md:p-8 transition-[padding] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        >
          {/* Animated only here — never wrap Navbar/Sidebar/TickerTape in a transformed
              element, since a CSS transform on an ancestor turns it into the containing
              block for their `position: fixed`, detaching them from the viewport. */}
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
