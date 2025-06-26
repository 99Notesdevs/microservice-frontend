import { Home, CalendarDays, Pencil, ShoppingBag, PhoneCall, Star, Power, MessageSquare } from "lucide-react";
import { useLocation, NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
}

const links = [
  { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
  { name: "Calendar", icon: <CalendarDays size={20} />, path: "/calendar" },
  { name: "Purchases", icon: <ShoppingBag size={20} />, path: "/purchases" },
  { name: "Mock Test", icon: <Star size={20} />, path: "/tests" },
  { name: "My Tests", icon: <Pencil size={20} />, path: "/mytest" },
  { name: "Inbox", icon: <MessageSquare size={20} />, path: "/messages" },
  { name: "My Test Series", icon: <Pencil size={20} />, path: "/mytestseries" },
];

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
  useLocation();
  const { user, logout } = useAuth()

  return (
    <div 
      className={`fixed top-0 left-0 h-screen flex flex-col justify-between z-[1200] transition-all duration-300 ease-in-out transform ${
        isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0'
      }`} 
      style={{ 
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderRadius: '0 1rem 1rem 0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >

      {/* Sidebar Content */}
      <div className="flex flex-col justify-between min-h-screen w-64">
        {/* Top Profile Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <NavLink 
              to="/user" 
              className="flex items-center gap-4 flex-1"
              onClick={() => setIsSidebarOpen(false)}
            >
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=random`}
                alt="User Avatar" 
                className="w-16 h-16 rounded-full border-2 border-gray-200 object-cover"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">
                  {user?.name || 'User'}
                </h2>
                <p className="text-sm text-gray-600 truncate">
                  {user?.email || ''}
                </p>
              </div>
            </NavLink>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              aria-label="Close sidebar"
              style={{
                position: 'absolute',
                right: '1rem',
                top: '1.5rem',
                zIndex: 10
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1">
          <div className="space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50"
                  }`
                }
              >
                {link.icon}
                {link.name}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex flex-col gap-3">
            <button 
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 w-full"
            >
              <PhoneCall size={18} />
              Contact Support
            </button>
            <button 
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full"
              onClick={() => {
               logout()
              }}
            >
              <Power size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}