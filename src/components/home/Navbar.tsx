import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';

interface User {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface NavbarProps {
  user?: User;
}

const navLinks = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Calendar", path: "/calendar" },
  { name: "Mock Test", path: "/tests" },
  { name: "My Tests", path: "/mytest" },
  { name: "My Test Series", path: "/mytestseries" },
  { name: "Purchases", path: "/purchases" },
  { name: "Inbox", path: "/messages" },
];

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const { logout } = useAuth();
  
  return (
    <>
      <div className="w-full" />
      <nav className="sticky top-0 w-full bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] z-40 h-16 flex items-center px-4 md:px-8">
        {/* Left Section - Logo and Navigation */}
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img 
              className="h-8 w-auto" 
              src={logo} 
              alt="99notes"
            />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => 
                  `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  } ${link.name.toLowerCase().replace(' ', '-')}-link`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Right Section - Profile and Actions */}
        <div className="flex items-center space-x-4 ml-auto">
          {/* Report Card Button - Desktop */}
          <Link 
            to="/reportcard" 
            className="hidden md:flex items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="View Report Card"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
              />
            </svg>
            <span className="text-sm font-medium text-gray-700">Report Card</span>
          </Link>

          {/* Profile Dropdown */}
          <div className="relative group">
            <div className="flex items-center gap-2 focus:outline-none cursor-pointer py-2 px-1 rounded-md hover:bg-gray-100">
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.firstName+" "+user?.lastName || 'User'}&background=random`}
                alt="User Avatar" 
                className="w-8 h-8 rounded-full border-2 border-gray-200 object-cover"
              />
              <span className="hidden md:inline text-sm font-medium text-gray-700">
                {user?.firstName || 'User'}
              </span>
              <svg 
                className="w-4 h-4 text-gray-500 hidden md:block" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 9l-7 7-7-7" 
                />
              </svg>
            </div>
            
            {/* Dropdown menu */}
            <div className="absolute right-0 pt-2 w-48">
              <div className="bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                <Link 
                  to="/user" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Your Profile
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  onClick={logout}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center ml-4">
          <button className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;