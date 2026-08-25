import React, { useState } from 'react';
import { Sidebar } from './Sidebar.js';
import { Topbar } from './Topbar.js';
import { QuickRoleSwitcher } from '../common/QuickRoleSwitcher.js';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#EAEAEA] flex flex-col lg:flex-row font-sans antialiased selection:bg-[#D4AF37] selection:text-black">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      <QuickRoleSwitcher />
    </div>
  );
};

