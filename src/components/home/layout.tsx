import Navbar from './Navbar';
import Sidebar from './sidebar';
import { useState, useEffect } from 'react';

interface HomeLayoutProps {
  children: React.ReactNode;
}

export const HomeLayout: React.FC<HomeLayoutProps> = ({
  children,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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
    <div className="min-h-screen bg-gray-50 relative">
      {/* Blur Overlay */}
      {isSidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-white/30 backdrop-blur-sm z-[1100] transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full z-[1200]">
        <Sidebar 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isMobile={isMobile}
        />
      </div>
      
      {/* Main Content */}
      <div 
        className={`min-h-screen transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
};
