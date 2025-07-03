import Navbar from './Navbar';
import Sidebar from './sidebar';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}
interface HomeLayoutProps {
  children: React.ReactNode;
}

export const HomeLayout: React.FC<HomeLayoutProps> = ({
  children,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();
  useEffect(() => {
    const handleResize = () => {
      const isMobileScreen = window.innerWidth < 1024;
      setIsMobile(isMobileScreen);
      // Keep sidebar closed by default on all screen sizes
      // User can manually open it using the hamburger menu
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} user={user as User} />
      
      <div className="flex flex-1 relative pt-16 h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <Sidebar 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isMobile={isMobile}
        />
        
        {/* Main Content */}
        <div 
          className={`flex-1 transition-all duration-300 h-full overflow-auto ${
            !isMobile && isSidebarOpen ? 'md:ml-[280px]' : 'md:ml-0'
          }`}
        >
          <div className="w-full p-4 md:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
