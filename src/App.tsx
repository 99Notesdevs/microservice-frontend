import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TestPortal from './pages/testPortal';
import SubmitPage from './pages/SubmitPage';
import { Category } from './pages/Category';
import { HomeLayout } from './components/home/layout';
import Dashboard from './pages/Dashboard';
import Givetest from './pages/Givetest';

function App() {
  return (
    <Router>
      <HomeLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/testPortal" element={<TestPortal />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/about" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold">About Us</h1>
              <p>Welcome to our test portal platform! We provide comprehensive test preparation resources and tools to help you succeed.</p>
            </div>
          } />
          <Route path="/category" element={<Category />} />
          <Route path="/givetest" element={<Givetest />} />
        </Routes>
      </HomeLayout>
    </Router>
  );
}

export default App;