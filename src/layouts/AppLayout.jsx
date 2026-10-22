import React, { useState } from 'react';
import AppSidebar from '../components/AppSidebar';
import AppHeader from '../components/AppHeader';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function AppLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useScrollReveal('reveal');
  useScrollReveal('reveal-left');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--warm-cream)' }}>
      {/* Sidebar Navigation */}
      <AppSidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          transition: 'padding-left 0.25s ease',
        }}
        className="app-main-content"
      >
        {/* Topbar Header */}
        <AppHeader
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Page Children */}
        <main style={{ flex: 1 }} className="page-enter">
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 1025px) {
          .app-main-content {
            padding-left: 256px;
          }
        }
      `}</style>
    </div>
  );
}
