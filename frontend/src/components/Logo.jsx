import React from 'react';
import { FaMusic } from 'react-icons/fa';

const Logo = () => {
  return (
    <div className="flex items-center gap-2 text-green-500">
      <FaMusic size={40} />
      <span className="text-2xl font-bold text-white">MusicStream</span>
    </div>
  );
};

export default Logo;