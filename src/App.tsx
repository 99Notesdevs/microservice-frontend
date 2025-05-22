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
               
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/submit" element={<SubmitPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/tests" element={<TestSelection />} />
                <Route path="/create-test" element={<Category />} />
              <Route path="/mytest" element={<Mytest />} />
              <Route path="/packages" element={<TestSelector />} />
            </Route>
            <Route path="/login" element={<LogIn />} />
        
          
          {/* Test Portal route without Layout */}
          
              <Route path="/test" element={<TestPortal />} />
              <Route path="/socket-test" element={<SocketTestPage />} />
              <Route path="/test-series/:testSeriesId" element={<TestSeriesPage />} />
              <Route path="/review/:testId" element={<ReviewPage />} />
              <Route path="/submit" element={<SubmitPage />} />
              <Route path="/testPortal" element={<TestPortal />} />
          
        </Routes>
      </TestProvider>
    </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
// import { TestProvider } from "./contexts/TestContext"
// import { AuthProvider } from "./contexts/AuthContext"
// import { SocketProvider } from "./contexts/SocketContext"
// import TestPortal from "./pages/TestPortal"
// import SubmitPage from "./pages/SubmitPage"
// import TestSelector from "./pages/TestSelector"
// import SocketTestPage from "./pages/SocketTestPage"
// import TestSeriesPage from "./pages/TestSeriesPage"
// import ReviewPage from "./pages/ReviewPage"
// import Login from "./pages/logIn"
// import PrivateRoute from "./components/testPortal/PrivateRoute"

// function App() {
//   return (
//     <AuthProvider>
//       <SocketProvider>
//         <TestProvider>
//           <Router>
//             <Routes>
//               <Route path="/login" element={<Login />} />
//               <Route path="/" element={<PrivateRoute element={<TestSelector />} />} />
//               <Route path="/test" element={<PrivateRoute element={<TestPortal />} />} />
//               <Route path="/socket-test" element={<PrivateRoute element={<SocketTestPage />} />} />
//               <Route path="/test-series/:testSeriesId" element={<PrivateRoute element={<TestSeriesPage />} />} />
//               <Route path="/review/:testId" element={<PrivateRoute element={<ReviewPage />} />} />
//               <Route path="/submit" element={<PrivateRoute element={<SubmitPage />} />} />
//               <Route path="*" element={<Navigate to="/" replace />} />
//             </Routes>
//           </Router>
//         </TestProvider>
//       </SocketProvider>
//     </AuthProvider>
//   )
// }

// export default App
