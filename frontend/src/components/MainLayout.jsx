import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Player from './Player';

const MainLayout = () => {
  return (
    <div className="h-screen bg-black flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto rounded-lg m-2 ml-0 p-6 text-white bg-linear-to-b from-gray-800 to-gray-900">
            <Outlet />
        </main>
      </div>
      <Player />
    </div>
  );
};

export default MainLayout;