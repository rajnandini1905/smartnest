import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const roleLabels = {
  resident: '🏠 Resident',
  visitor: '👤 Visitor',
  maintenance: '🔧 Maintenance',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 text-white px-6 py-3.5 shadow-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-blue-400">🏢</span> SmartNest
          </span>
          {user && (
            <span className="text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-full">
              {roleLabels[user.role]}
            </span>
          )}
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-white">{user.name}</div>
              {user.apartmentNumber && (
                <div className="text-xs text-slate-400">Apt {user.apartmentNumber}</div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
