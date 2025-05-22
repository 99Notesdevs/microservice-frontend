import React from 'react';
import { Link, NavLink } from 'react-router-dom';


// import { Pencil, CalendarDays, Mail, BookOpenCheck, ShoppingBag, Home } from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';
interface NavbarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  // const { isAuthenticated } = useAuth();

  // const links = [
  //   { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
  //   { name: "Calendar", icon: <CalendarDays size={20} />, path: "/calendar" },
  //   { name: "Inbox", icon: <Mail size={20} />, path: "/inbox" },
  //   { name: "My Course", icon: <BookOpenCheck size={20} />, path: "/course" },
  //   { name: "My Purchase", icon: <ShoppingBag size={20} />, path: "/purchases" },
  //   { name: "Test Selection", icon: <Pencil size={20} />, path: "/test-selection" },
  // ];

  return (
    <>
    <div className="w-full" />
    <nav className="sticky top-0 w-full bg-white shadow-md z-40 h-16 flex items-center justify-between px-8">
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
        {/* <div className="flex items-center gap-4">
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
        </div> */}

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
        {/* <div className="flex items-center gap-4">
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
        </div> */}
      </div>

      {/* Right Section - Hamburger Menu */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-orange-100 hover:bg-orange-200 shadow-md lg:hidden"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isSidebarOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>
    </nav>
    </>
  );
};

export default Navbar;