import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Player from './Player';

const MainLayout = () => {
  return (
    <div className="h-screen bg-black flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto rounded-none md:rounded-lg m-0 md:m-2 md:ml-0 p-4 md:p-6 text-white bg-linear-to-b from-gray-800 to-gray-900 pb-24">
            <Outlet />
        </main>
      </div>
      <Player />
    </div>
  );
};

export default MainLayout;