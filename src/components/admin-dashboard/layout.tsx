import { FaPlus, FaEdit, FaClipboardList } from 'react-icons/fa';
import { NavLink, Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';

const Sidebar = () => {
  const menuItems = [
    {
      category: 'Test Management',
      items: [
        { icon: FaPlus, text: 'Add Questions', path: '/admin/add-question' },
        { icon: FaPlus, text: 'Add Test Series', path: 'admin/addtestseries' },
        { icon: FaClipboardList, text: 'Test Forms', path: 'admin/test-form' },
        { icon: FaEdit, text: 'Test Series', path: 'admin/testseries' },
        { icon: FaPlus, text: 'Add Test', path: 'admin/add-test' },
      ],
    },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>
      </div>
      <nav className="p-4">
        {menuItems.map((section, index) => (
          <div key={index} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {section.category}
            </h3>
            <ul className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.text}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
};

interface AdminLayoutProps {
  children?: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default AdminLayout;