import Navbar from './Navbar';
import Sidebar from './sidebar';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { TourProvider } from '@reactour/tour';
import AppTour from './AppTour';
import UserModal from '../UserModal';

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
      if (isMobileScreen) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <TourProvider
      steps={[]}
      styles={{
        popover: (base) => ({
          ...base,
          borderRadius: "0.5rem",
          padding: "1.5rem",
          maxWidth: "320px",
        }),
      }}
      position="right"
      disableDotsNavigation={false}
      showBadge={false}
    >
      <div className="min-h-screen bg-gray-50 flex flex-col relative">
        <Navbar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={toggleSidebar}
          user={user as User}
        />

        <div className="flex flex-1 relative h-[calc(120vh-4rem)]">
          <Sidebar 
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            isMobile={isMobile}
          />

          <div
            className={`flex-1 transition-all duration-300 h-full overflow-auto ${
              !isMobile && isSidebarOpen ? "md:ml-[280px]" : "md:ml-0"
            }`}
          >
            <div className="w-full">{children}</div>
          </div>
        </div>

        <UserModal />
        <AppTour />
      </div>
    </TourProvider>
  );
};
