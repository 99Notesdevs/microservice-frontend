import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Pencil, CalendarDays, Mail, BookOpenCheck, ShoppingBag, Home } from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';
const Navbar: React.FC = () => {
  // const { isAuthenticated } = useAuth();

  const links = [
    { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
    { name: "Calendar", icon: <CalendarDays size={20} />, path: "/calendar" },
    { name: "Inbox", icon: <Mail size={20} />, path: "/inbox" },
    { name: "My Course", icon: <BookOpenCheck size={20} />, path: "/course" },
    { name: "My Purchase", icon: <ShoppingBag size={20} />, path: "/purchases" },
    { name: "Test Selection", icon: <Pencil size={20} />, path: "/test-selection" },
  ];

  return (
    <>
    <div className="h-16 w-full" />
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50 h-16 flex items-center justify-between px-8">
      {/* Left Section - Logo */}
      <Link to="/about">
        <div className="flex items-center gap-4">
          <img 
          className="w-22 h-8" 
          src={logo} 
          alt="99notes" />
        </div>
      </Link>

      {/* Center Section - Navigation Links */}
      <div className="flex items-center gap-6">
        {/* Left Links */}
        <div className="flex items-center gap-4">
          {links.slice(0, 3).map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => 
                `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? 'bg-orange-50 text-orange-600' 
                    : 'hover:bg-gray-50 text-gray-600'
                }`
              }
            >
              {link.icon}
              <span className="text-sm font-medium">{link.name}</span>
            </NavLink>
          ))}
        </div>

        {/* Give Test Button with Professional Design */}
        <div className="relative">
          <NavLink
            to="/tests"
            className={({ isActive }) => 
              `relative flex items-center justify-center px-8 py-3 rounded-full bg-orange-500 text-white font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 ${
                isActive ? 'ring-2 ring-orange-300 ring-offset-2' : ''
              }`
            }
          >
            <div className="absolute -left-4 w-32 h-32 rounded-full bg-orange-100 blur-2xl animate-pulse"></div>
            <div className="relative">
              
              <div className="relative">
                <span className="text-xl tracking-tight">Give Test</span>
              </div>
            </div>
          </NavLink>
        </div>

        {/* Right Links */}
        <div className="flex items-center gap-4">
          {links.slice(3).map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => 
                `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? 'bg-orange-50 text-orange-600' 
                    : 'hover:bg-gray-50 text-gray-600'
                }`
              }
            >
              {link.icon}
              <span className="text-sm font-medium">{link.name}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Right Section - Profile/Settings */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <img 
            src="https://via.placeholder.com/40" 
            alt="Profile" 
            className="w-10 h-10 rounded-full cursor-pointer"
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 hidden">
            <NavLink 
              to="/dashboard" 
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/profile" 
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Profile
            </NavLink>
            <hr className="border-t border-gray-200 my-1" />
            <button 
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
};

export default Navbar;