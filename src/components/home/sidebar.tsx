import { Home, CalendarDays, Pencil, ShoppingBag, Star, Power, MessageSquare, X } from "lucide-react";
import { useLocation, NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  // Add other user properties as needed
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

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, isMobile }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth() as { user: User | null; logout: () => void };
  const userName = user?.firstName+" "+user?.lastName || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile, isSidebarOpen, setIsSidebarOpen]);

  // Disable body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = isSidebarOpen ? 'hidden' : 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isSidebarOpen, isMobile]);

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-20"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: isSidebarOpen ? '17rem' : '0rem',
          opacity: isSidebarOpen ? 1 : 0.8,
          x: isSidebarOpen ? 0 : -250,
          
        }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300,
        }}
        className="fixed top-0 left-0 z-30 h-screen bg-white shadow-lg overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Top Section */}
          <div className="border-b border-gray-100 p-4">
            <div className="flex items-center justify-between">
            <NavLink 
              to="/user" 
              className="flex items-center gap-4 flex-1"
              onClick={() => setIsSidebarOpen(false)}
            >
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={userName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 font-medium">{userInitial}</span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{userName}</p>
                  {user?.email && <p className="text-xs text-gray-500">{user.email}</p>}
                </div>
              </div>
            </NavLink>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close sidebar"
              >
                <X size={20} className="text-gray-500 cursor-pointer" />
              </button>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <NavLink 
              to="/"
              onClick={() => setIsSidebarOpen(false)}
            >
              <ul className="space-y-1 px-2">
                {links.map((link, index) => (
                  <motion.li 
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 24,
                      delay: 0.05 * index
                    }}
                  >
                    <NavLink
                      to={link.path}
                      className={({ isActive }) =>
                        `group flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                      onClick={() => isMobile && setIsSidebarOpen(false)}
                    >
                      <span className="mr-3 transition-transform group-hover:scale-110">
                        {link.icon}
                      </span>
                      <span className="whitespace-nowrap">{link.name}</span>
                      {location.pathname === link.path && (
                        <motion.span
                          layoutId="activeIndicator"
                          className="ml-auto w-1.5 h-6 bg-blue-500 rounded-full"
                          initial={false}
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                    </NavLink>
                  </motion.li>
                ))}
              </ul>
            </NavLink>
          </div>
          
          {/* Bottom Section */}
          <div className="p-4 border-t border-gray-100 ">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                logout();
                if (isMobile) setIsSidebarOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group cursor-pointer"
            >
              <Power 
                size={18} 
                className="mr-3 transition-transform group-hover:scale-110" 
              />
              <span className="whitespace-nowrap">Sign Out</span>
            </motion.button>
          </div>
        </div>
      </motion.aside>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </>
  );
}