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
      // Close sidebar on mobile, open on desktop
      setIsSidebarOpen(!isMobileScreen);
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        <div className={`w-70 ${isMobile ? 'lg:block' : ''}`}>
          <Sidebar 
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            isMobile={isMobile}
          />
        </div>
        <div className={`flex-1 ${isMobile && !isSidebarOpen ? 'lg:w-full' : ''}`}>
          <div className="lg:pl-0 transition-all duration-300">
            <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
