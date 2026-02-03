import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Player from './Player';
import { FaBars } from 'react-icons/fa';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-black flex flex-col">
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Mobile Menu Button */}
        <div className="absolute top-4 left-4 z-40 md:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="text-white p-2 bg-gray-800 rounded-full shadow-lg">
                <FaBars size={20} />
            </button>
        </div>

        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        <main className="flex-1 overflow-y-auto rounded-none md:rounded-lg m-0 md:m-2 md:ml-0 p-4 md:p-6 text-white bg-linear-to-b from-gray-800 to-gray-900 pb-24 pt-16 md:pt-6">
            <Outlet />
        </main>
      </div>
      <Player />
    </div>
  );
};

export default MainLayout;