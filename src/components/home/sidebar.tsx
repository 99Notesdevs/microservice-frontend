import { Home, CalendarDays, Pencil, ShoppingBag, PhoneCall, Star, Power} from "lucide-react";
import { useLocation, NavLink } from "react-router-dom";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
}

const links = [
  { name: "Dashboard", icon: <Home size={18} />, path: "/dashboard" },
  { name: "Calendar", icon: <CalendarDays size={18} />, path: "/calendar" },
  { name: "My Purchase", icon: <ShoppingBag size={18} />, path: "/purchases" },
  { name: "Givetest", icon: <Star size={18} />, path: "/tests" },
  { name: "My Tests", icon: <Pencil size={18} />, path: "/mytest" },
];

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, isMobile }: SidebarProps) {
  useLocation();

  return (
    <div className={`fixed top-0 left-0 h-screen bg-[#e9ded7] flex flex-col justify-between z-[1200] transition-all duration-300 ${
      isMobile ? (isSidebarOpen ? 'w-70' : 'w-0') : 'w-70'
    }`} style={{ overflow: 'auto' }}>
      {/* Hamburger Menu Button (visible only on mobile) */}
      {/* <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-[1300] p-2 rounded-lg bg-orange-100 hover:bg-orange-200 lg:hidden shadow-md"
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
      </button> */}

      {/* Sidebar Content */}
      <div className="flex flex-col justify-between min-h-screen">
        {/* Top Profile Section */}
        <div className="p-4 flex items-center gap-3 border-b border-orange-200 pb-4">
          <img src="../../assets/react.svg" alt="Avatar" className="w-14 h-14 rounded-full" />
          <div className="flex-1 flex items-center justify-between">
            <div className="text-left">
              <p className="font-semibold text-sm">Ritik Gupta</p>
              <p className="text-xs text-gray-700">+91 9026704436</p>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="ml-2 p-1 rounded-full hover:bg-orange-100 lg:hidden"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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
    </div>
  );
}