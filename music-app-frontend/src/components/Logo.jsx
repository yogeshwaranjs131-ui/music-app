import React from 'react';
import { FaMusic } from 'react-icons/fa';

const Logo = () => {
  return (
    <div className="flex items-center gap-3 px-4 py-2 mb-2">
        <div className="w-8 h-8 bg-linear-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
            <FaMusic className="text-white text-sm" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
            Music<span className="text-green-500">Stream</span>
        </h1>
    </div>
  );
};

export default Logo;