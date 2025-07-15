import { Home, CalendarDays, Pencil, ShoppingBag, Star, Power, MessageSquare, X } from "lucide-react";
import { useLocation, NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";

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

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, isMobile }: SidebarProps) {
  const location = useLocation();
  const { logout } = useAuth() as { logout: () => void };

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      const timer = setTimeout(() => {
        setIsSidebarOpen(false);
      }, 300); // Small delay to allow the click to complete
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  // Disable body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = isSidebarOpen ? 'hidden' : 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isSidebarOpen, isMobile]);

  // Handle click outside to close sidebar
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isSidebarOpen && isMobile && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
        ref={sidebarRef}
        initial={false}
        animate={{
          x: isSidebarOpen ? 0 : -280,
          opacity: isSidebarOpen ? 1 : 0.8,
          transition: {
            x: { 
              type: 'spring', 
              stiffness: 300, 
              damping: 25,
              mass: 0.5
            },
            opacity: { 
              duration: 0.3,
              ease: 'easeInOut'
            }
          }
        }}
        className={`fixed top-20 left-0 z-[900] h-[calc(100vh-4rem)] w-[280px] bg-white shadow-[4px_0_15px_-3px_rgba(0,0,0,0.1)] overflow-hidden sidebar-nav`}
      >
        <div className="flex flex-col h-full border-r border-gray-100">
          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
              aria-label="Close sidebar"
            >
              <X size={20} className="text-gray-500 cursor-pointer" />
            </button>
          )}

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
            <ul className="space-y-1 px-2">
              {links.map((link, index) => {
                // Create a class name based on the link name for the tour
                const linkClass = link.name.toLowerCase().replace(/\s+/g, '-') + '-link';
                return (
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
                      `group flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${linkClass} ${
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
                );
              })}
            </ul>
          </div>

          {/* Bottom Section */}
          <div className="mt-auto p-4 border-t border-gray-100">
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