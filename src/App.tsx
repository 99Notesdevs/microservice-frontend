import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import TestPortal from './pages/testPortal';
import SubmitPage from './pages/SubmitPage';
import { Category } from './pages/Category';
import { HomeLayout } from './components/home/layout';
import Dashboard from './pages/Dashboard';
import Mytest from './pages/Mytest';
import CalendarPage from './pages/Calendar';
import LogIn from './pages/logIn';
import { AuthProvider } from './contexts/AuthContext';
import { TestProvider } from "./contexts/TestContext"
import { SocketProvider } from "./contexts/SocketContext"
import TestSelector from "./pages/TestSelector"
import SocketTestPage from "./pages/SocketTestPage"
import TestSeriesPage from "./pages/TestSeriesPage"
import ReviewPage from "./pages/ReviewPage"
import TestSelection from "./pages/testSelection"
import About from "./pages/about"
import {ProtectedRoute} from "./components/ProtectedRoute"
import MytestSeries from "./pages/MytestSeries"
import UserDashboard from "./pages/UserDashboard"
import ReviewSocketPage from "./pages/ReviewSocketPage"
import AdminDashboard from './pages/admin-dashboard'
import AdminLayout from './components/admin-dashboard/layout'
import AddTest from './components/admin-dashboard/test';
import EditTest from './components/admin-dashboard/edit-test';
import AddTestSeries from './components/admin-dashboard/add-test-series';
import EditTestSeries from './components/admin-dashboard/edit-test-series';
import AddQuestion from './components/admin-dashboard/question';
import TestForm from './components/admin-dashboard/test-form';
import TestSeries from './components/admin-dashboard/test-series';
import AdminLogin from './components/admin-dashboard/admin-login';
import ReportCard from './pages/reportcard';
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
        <SocketProvider>
          <TestProvider>
            <Routes>
              {/* Routes with Layout */}
              <Route element={<LayoutWithSidebar />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
               
              <Route path="/dashboard" element={<ProtectedRoute requirePaid={true} allowedRoles={["admin", "user"]}><Dashboard /></ProtectedRoute>} />
              <Route path="/submit" element={<ProtectedRoute requirePaid={true} allowedRoles={["admin", "user"]}><SubmitPage /></ProtectedRoute>} />
                <Route path="/about" element={<ProtectedRoute requirePaid={true} allowedRoles={["admin", "user"]}><About /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute requirePaid={true} allowedRoles={["admin", "user"]}><CalendarPage /></ProtectedRoute>} />
                <Route path="/tests" element={<ProtectedRoute requirePaid={true} allowedRoles={["admin", "user"]}><TestSelection /></ProtectedRoute>} />
                <Route path="/create-test" element={<ProtectedRoute requirePaid={true} allowedRoles={["admin", "user"]}><Category /></ProtectedRoute>} />
              <Route path="/mytest" element={<ProtectedRoute requirePaid={true} allowedRoles={["admin", "user"]}><Mytest /></ProtectedRoute>} />
              <Route path="/packages" element={<ProtectedRoute requirePaid={true} allowedRoles={["admin", "user"]}><TestSelector /></ProtectedRoute>} />
              <Route path="/mytestseries" element={<ProtectedRoute requirePaid={true} allowedRoles={["admin", "user"]}><MytestSeries /></ProtectedRoute>} />
              <Route path="/user" element={<ProtectedRoute requirePaid={true} allowedRoles={["admin", "user"]}><UserDashboard /></ProtectedRoute>} />
              <Route path="/reportcard" element={<ProtectedRoute requirePaid={true} allowedRoles={["admin", "user"]}><ReportCard /></ProtectedRoute>} />
            </Route>
            <Route path="/login" element={<LogIn />} />
            {/* ADmin Routes */}
            <Route element={<AdminLayout />}>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute requirePaid={false} allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/add-test" element={<ProtectedRoute requirePaid={false} allowedRoles={["admin"]}><AddTest /></ProtectedRoute>} />
            <Route path="/admin/edit-test/:id" element={<ProtectedRoute requirePaid={false} allowedRoles={["admin"]}><EditTest /></ProtectedRoute>} />
            <Route path="/admin/addtestSeries" element={<ProtectedRoute requirePaid={false} allowedRoles={["admin"]}><AddTestSeries /></ProtectedRoute>} />
            <Route path="/admin/edit-testSeries/:id" element={<ProtectedRoute requirePaid={false} allowedRoles={["admin"]}><EditTestSeries /></ProtectedRoute>} />
            <Route path="/admin/add-question" element={<ProtectedRoute requirePaid={false} allowedRoles={["admin"]}><AddQuestion /></ProtectedRoute>} />
            <Route path="/admin/test-form" element={<ProtectedRoute requirePaid={false} allowedRoles={["admin"]}><TestForm /></ProtectedRoute>} />
            <Route path="/admin/testSeries" element={<ProtectedRoute requirePaid={false} allowedRoles={["admin"]}><TestSeries /></ProtectedRoute>} />
            </Route>
          
          {/* Test Portal route without Layout */}
          
              <Route path="/test" element={<ProtectedRoute requirePaid={true} allowedRoles={["admin", "user"]}><TestPortal /></ProtectedRoute>} />
              <Route path="/socket-test" element={<ProtectedRoute requirePaid={true} allowedRoles={["admin", "user"]}><SocketTestPage /></ProtectedRoute>} />
              <Route path="/test-series/:testSeriesId" element={<ProtectedRoute requirePaid={true} allowedRoles={["admin", "user"]}><TestSeriesPage /></ProtectedRoute>} />
              <Route path="/review/:testId" element={<ProtectedRoute requirePaid={true} allowedRoles={["admin", "user"]}><ReviewPage /></ProtectedRoute>} />
              <Route path="/review-socket/:testId" element={<ProtectedRoute requirePaid={true} allowedRoles={["admin", "user"]}><ReviewSocketPage /></ProtectedRoute>} />
              <Route path="/submit" element={<ProtectedRoute requirePaid={true} allowedRoles={["admin", "user"]}><SubmitPage /></ProtectedRoute>} />
              <Route path="/testPortal" element={<ProtectedRoute requirePaid={true} allowedRoles={["admin", "user"]}><TestPortal /></ProtectedRoute>} />
          
        </Routes>
      </TestProvider>
    </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;