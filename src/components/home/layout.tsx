import Navbar from './Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { TourProvider } from '@reactour/tour';
import AppTour from './AppTour';

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

export const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <TourProvider
        steps={[]}
        showNavigation={false}
        showBadge={false}
      >
        <Navbar user={user as User} />
        
        <div className="h-[calc(100vh-4rem)] overflow-auto">
          <main className="max-w-[1800px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
          
          <AppTour />
        </div>
      </TourProvider>
    </div>
  );
};
