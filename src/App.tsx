import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import TestPortal from './pages/testPortal';
import SubmitPage from './pages/SubmitPage';
import { Category } from './pages/Category';
import { HomeLayout } from './components/home/layout';
import Dashboard from './pages/Dashboard';
import Mytest from './pages/Mytest';
import CalendarPage from './pages/Calendar';
// import LogIn from './pages/logIn';
import { AuthProvider } from './contexts/AuthContext';
import { TestProvider } from "./contexts/TestContext"
import { SocketProvider } from "./contexts/SocketContext"
import TestSelector from "./pages/TestSelector"
import SocketTestPage from "./pages/SocketTestPage"
import TestSeriesPage from "./pages/TestSeriesPage"
import ReviewPage from "./pages/ReviewPage"
import TestSelection from "./pages/testSelection"
import About from "./pages/about"
import MytestSeries from "./pages/MytestSeries"
import UserDashboard from "./pages/UserDashboard"
import ReviewSocketPage from "./pages/ReviewSocketPage"
import AdminLayout from './components/admin-dashboard/layout'
import AddTest from './components/admin-dashboard/test';
import EditTest from './components/admin-dashboard/edit-test';
import AddTestSeries from './components/admin-dashboard/add-test-series';
import EditTestSeries from './components/admin-dashboard/edit-test-series';
import AddQuestion from './components/admin-dashboard/question';
import TestForm from './components/admin-dashboard/test-form';
import TestSeries from './components/admin-dashboard/test-series';
import AdminLogin from './components/admin-dashboard/admin-login';
import Subscription from './pages/subscription'
import ReportCard from './pages/reportcard';
import AdminPermissions from './components/admin-dashboard/admin-permissions';
import AdminMessages from './components/admin-dashboard/admin-messages';
import { UserProvider } from './contexts/UserContext';
import EditQuestionPage from './components/admin-dashboard/edit-question';
// Layout wrapper component
const LayoutWithSidebar = () => (
  <HomeLayout>
    <Outlet />
  </HomeLayout>
);

function App() {
  return (
    <Router>
      <UserProvider>
      <AuthProvider>
        <SocketProvider>
          <TestProvider>
            <Routes>
              {/* Routes with Layout */}
              <Route element={<LayoutWithSidebar />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
               
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/submit" element={<SubmitPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/tests" element={<TestSelection />} />
                <Route path="/create-test" element={<Category />} />
              <Route path="/mytest" element={<Mytest />} />
              <Route path="/packages" element={<TestSelector />} />
              <Route path="/mytestseries" element={<MytestSeries />} />
              <Route path="/user" element={<UserDashboard />} />
              <Route path="/reportcard" element={<ReportCard />} />
            </Route>
            {/* User Login route - redirects to dashboard with login prompt */}
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            {/* Admin Login route without layout */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Admin Routes with Layout - Protected */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/permissions" replace />} />
              <Route path="/admin/add-test" element={<AddTest />} />
              <Route path="/admin/edit-test/:id" element={<EditTest />} />
              <Route path="/admin/addtestSeries" element={<AddTestSeries />} />
              <Route path="/admin/edit-testSeries/:id" element={<EditTestSeries />} />
              <Route path="/admin/add-question" element={<AddQuestion />} />
              <Route path="/admin/edit-question" element={<EditQuestionPage/>} />
              <Route path="/admin/test-form" element={<TestForm />} />
              <Route path="/admin/testSeries" element={<TestSeries />} />
              <Route path="/admin/permissions" element={<AdminPermissions />} />
              <Route path="/admin/messages" element={<AdminMessages />} />
            </Route>
          
          {/* Test Portal route without Layout */}
          <Route path="/subscription" element={<Subscription />} />
              <Route path="/test" element={<TestPortal />} />
              <Route path="/socket-test" element={<SocketTestPage />} />
              <Route path="/test-series/:testSeriesId" element={<TestSeriesPage />} />
              <Route path="/review/:testId" element={<ReviewPage />} />
              <Route path="/review-socket/:testId" element={<ReviewSocketPage />} />
              <Route path="/submit" element={<SubmitPage />} />
              <Route path="/testPortal" element={<TestPortal />} />
          
        </Routes>
      </TestProvider>
    </SocketProvider>
      </AuthProvider>
      </UserProvider>
    </Router>
  );
}

export default App;