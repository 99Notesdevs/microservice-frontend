import React from 'react';
import { Link } from 'react-router-dom';


// import { Pencil, CalendarDays, Mail, BookOpenCheck, ShoppingBag, Home } from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';
interface NavbarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {

  return (
    <>
    <div className="w-full" />
    <nav className="sticky top-0 w-full bg-white shadow-md z-40 h-16 flex items-center px-8">
      {/* Left Section - Hamburger Menu */}
      <div className="flex items-center">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 shadow-md"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Center Section - Logo */}
      <div className="flex-1 flex justify-center">
        <Link to="/about">
          <div className="flex items-center">
            <img 
              className="w-22 h-8" 
              src={logo} 
              alt="99notes" 
            />
          </div>
        </Link>
      </div>

      {/* Right Section - Empty div to balance the flex layout */}
      <div className="w-10"></div>
    </nav>
    </>
  );
};

export default Navbar;