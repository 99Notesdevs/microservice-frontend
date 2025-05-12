import { Sidebar } from './sidebar';

interface HomeLayoutProps {
  children: React.ReactNode;
  username: string;
  profilePicture?: string;
}

export const HomeLayout: React.FC<HomeLayoutProps> = ({
  children,
  username,
  profilePicture,
}) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar username={username} profilePicture={profilePicture} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
