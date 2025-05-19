import { Home, CalendarDays, Mail, BookOpenCheck, Pencil, ShoppingBag, PhoneCall, Star, Power, Settings } from "lucide-react";
import { useLocation, NavLink } from "react-router-dom";
import { useState } from 'react';

const links = [
  { name: "Dashboard", icon: <Home size={18} />, path: "/dashboard" },
  { name: "Calendar", icon: <CalendarDays size={18} />, path: "/calendar" },
  { name: "Inbox", icon: <Mail size={18} />, path: "/inbox" },
  { name: "My Course", icon: <BookOpenCheck size={18} />, path: "/course" },
  { name: "Givetest", icon: <Star size={18} />, path: "/category" },
  { name: "My Tests", icon: <Pencil size={18} />, path: "/givetest" },
  { name: "My Purchase", icon: <ShoppingBag size={18} />, path: "/purchases" },
  { name: "Test Selection", icon: <Pencil size={18} />, path: "/test-selection" },
];

export default function Sidebar() {
  // Location is used internally by NavLink for active state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useLocation();

  return (
    <>
      {/* Hamburger Menu Button (visible only on mobile) */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 right-4 z-[997] p-2 rounded-lg bg-orange-100 hover:bg-orange-200 md:hidden shadow-md"
        style={{ position: 'fixed', top: '1rem', right: '1rem' }}
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
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Overlay (visible only on mobile when sidebar is open) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[998] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed md:static inset-y-0 left-0 z-[1100] w-70 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out min-h-screen bg-[#e9ded7] flex flex-col justify-between`}
      >
        {/* Top Profile Section */}
        <div className="p-4 flex items-center gap-3 border-b border-orange-200 pb-4">
          <img src="../../assets/react.svg" alt="Avatar" className="w-14 h-14 rounded-full" />
          <div className="flex-1 flex items-center justify-between">
            <div className="text-left">
              <p className="font-semibold text-sm">Ritik Gupta</p>
              <p className="text-xs text-gray-700">+91 9026704436</p>
            </div>
            <NavLink to="/profile/edit" className="ml-2 p-1 rounded-full hover:bg-orange-100">
              <Settings size={20} />
            </NavLink>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setIsSidebarOpen(false)} // Close sidebar on mobile when clicking a link
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 text-sm ${
                  isActive
                    ? "bg-orange-400 text-black font-semibold"
                    : "hover:bg-orange-100 text-gray-700"
                }`
              }
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Buttons */}
        <div className="bg-orange-400 text-white text-sm flex justify-around py-3">
          <button className="flex items-center gap-1">
            <PhoneCall size={16} /> Connect Us
          </button>
          <button className="flex items-center gap-1">
            <Power size={16} /> Logout
          </button>
        </div>
      </div>
    </>
  );
}