import Sidebar from "../components/admin-dashboard/layout";
import { Outlet } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;