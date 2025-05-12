import { Link } from 'react-router-dom';
import { CategorySelection } from '../components/home/CategorySelection';
import { Button } from '../components/ui/button';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-center text-gray-900">99Notes</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3 bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Quick Actions</h2>
                <Button variant="outline" size="sm">
                  + New Note
                </Button>
              </div>
              <nav className="space-y-2">
                <Link to="/dashboard/add" className="flex items-center px-4 py-2 hover:bg-gray-50 rounded-md">
                  Create Note
                </Link>
                <Link to="/dashboard/edit" className="flex items-center px-4 py-2 hover:bg-gray-50 rounded-md">
                  Edit Notes
                </Link>
                <Link to="/dashboard/settings" className="flex items-center px-4 py-2 hover:bg-gray-50 rounded-md">
                  Settings
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 md:col-span-9 bg-white rounded-lg shadow-sm p-6">
            <CategorySelection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;