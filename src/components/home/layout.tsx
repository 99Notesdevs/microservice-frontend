import Sidebar from './sidebar';
import Navbar from './Navbar';

interface HomeLayoutProps {
  children: React.ReactNode;
}

export const HomeLayout: React.FC<HomeLayoutProps> = ({
  children,
}) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative">
        {/* Navbar */}
        <Navbar />
        <div className="" style={{ paddingTop: 56 }}>
          {children}
        </div>
      </div>
    </div>
  );
};
