import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import TestPortal from './pages/testPortal';
import SubmitPage from './pages/SubmitPage';
import { Category } from './pages/Category';
import { HomeLayout } from './components/home/layout';
import Dashboard from './pages/Dashboard';
import Givetest from './pages/Givetest';
import LogIn from './pages/logIn';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layout wrapper component
const LayoutWithSidebar = () => (
  <HomeLayout>
    <Outlet />
  </HomeLayout>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Routes with Layout */}
          <Route element={<LayoutWithSidebar />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<ProtectedRoute requirePaid={true} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/submit" element={<SubmitPage />} />
              <Route path="/about" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">About Us</h1>
                  <p>Welcome to our test portal platform! We provide comprehensive test preparation resources and tools to help you succeed.</p>
                </div>
              } />
              <Route path="/category" element={<Category />} />
              <Route path="/givetest" element={<Givetest />} />
            </Route>
            <Route path="/login" element={<LogIn />} />
          </Route>
          
          {/* Test Portal route without Layout */}
          <Route element={<ProtectedRoute requirePaid={true} />}>
            <Route path="/testPortal" element={<TestPortal />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;