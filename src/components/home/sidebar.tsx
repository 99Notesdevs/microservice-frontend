import { Link } from 'react-router-dom';
import { User, Home, Info, Mail, TestTube } from 'lucide-react';

interface SidebarProps {
  username: string;
  profilePicture?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ username, profilePicture }) => {
  return (
    <div className="h-screen w-64 bg-white shadow-sm">
      {/* Profile Section */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <img
              src={profilePicture || '/default-avatar.png'}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold">{username}</h3>
            <p className="text-sm text-gray-500">Student</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <Link
          to="/about"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Info className="w-5 h-5" />
          <span>About</span>
        </Link>

        <Link
          to="/contact"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Mail className="w-5 h-5" />
          <span>Contact</span>
        </Link>

        <Link
          to="/category"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <TestTube className="w-5 h-5" />
          <span>Tests</span>
        </Link>
      </nav>
    </div>
  );
};