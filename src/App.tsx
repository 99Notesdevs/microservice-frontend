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
import ReviewSocketPage from "./pages/ReviewSocketPage"
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
               
              <Route path="/dashboard" element={<ProtectedRoute requirePaid={true}><Dashboard /></ProtectedRoute>} />
              <Route path="/submit" element={<ProtectedRoute requirePaid={true}><SubmitPage /></ProtectedRoute>} />
                <Route path="/about" element={<ProtectedRoute requirePaid={true}><About /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute requirePaid={true}><CalendarPage /></ProtectedRoute>} />
                <Route path="/tests" element={<ProtectedRoute requirePaid={true}><TestSelection /></ProtectedRoute>} />
                <Route path="/create-test" element={<ProtectedRoute requirePaid={true}><Category /></ProtectedRoute>} />
              <Route path="/mytest" element={<ProtectedRoute requirePaid={true}><Mytest /></ProtectedRoute>} />
              <Route path="/packages" element={<ProtectedRoute requirePaid={true}><TestSelector /></ProtectedRoute>} />
              <Route path="/mytestseries" element={<ProtectedRoute requirePaid={true}><MytestSeries /></ProtectedRoute>} />
            </Route>
            <Route path="/login" element={<LogIn />} />
        
          
          {/* Test Portal route without Layout */}
          
              <Route path="/test" element={<ProtectedRoute requirePaid={true}><TestPortal /></ProtectedRoute>} />
              <Route path="/socket-test" element={<ProtectedRoute requirePaid={true}><SocketTestPage /></ProtectedRoute>} />
              <Route path="/test-series/:testSeriesId" element={<ProtectedRoute requirePaid={true}><TestSeriesPage /></ProtectedRoute>} />
              <Route path="/review/:testId" element={<ProtectedRoute requirePaid={true}><ReviewPage /></ProtectedRoute>} />
              <Route path="/review-socket/:testId" element={<ProtectedRoute requirePaid={true}><ReviewSocketPage /></ProtectedRoute>} />
              <Route path="/submit" element={<ProtectedRoute requirePaid={true}><SubmitPage /></ProtectedRoute>} />
              <Route path="/testPortal" element={<ProtectedRoute requirePaid={true}><TestPortal /></ProtectedRoute>} />
          
        </Routes>
      </TestProvider>
    </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;