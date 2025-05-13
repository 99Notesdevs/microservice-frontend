import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TestPortal from './pages/testPortal';
import SubmitPage from './pages/SubmitPage';
import { Category } from './pages/Category';
import StudentSidebar from './components/home/sidebar';

function App() {
  return (
    <Router>
      <div className="flex">
        <StudentSidebar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/testPortal" element={<TestPortal />} />
            <Route path="/submit" element={<SubmitPage />} />
            <Route path="/about" element={
              <div className="p-6">
                <h1 className="text-2xl font-bold">About Us</h1>
                <p>Welcome to our test portal platform! We provide comprehensive test preparation resources and tools to help you succeed.</p>
              </div>
            } />
            <Route path="/category" element={
              <Category />
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;