import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TestPortal from './pages/testPortal';
import SubmitPage from './pages/SubmitPage';
import { HomeLayout } from './components/home/layout';
import { Category } from './pages/Category';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <HomeLayout username="John Doe" profilePicture="/default-avatar.png">
            <Home />
          </HomeLayout>
        } />
        <Route path="/testPortal" element={<TestPortal />} />
        <Route path="/submit" element={<SubmitPage />} />
        <Route path="/about" element={
          <HomeLayout username="John Doe" profilePicture="/default-avatar.png">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">About Us</h1>
              <p>Welcome to our test portal platform! We provide comprehensive test preparation resources and tools to help you succeed.</p>
            </div>
          </HomeLayout>
        } />
        <Route path="/contact" element={
          <HomeLayout username="John Doe" profilePicture="/default-avatar.png">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Contact Us</h1>
              <div className="space-y-2">
                <p>Email: support@example.com</p>
                <p>Phone: +1 234 567 890</p>
              </div>
            </div>
          </HomeLayout>
        } />
        <Route path="/category" element={
          <HomeLayout username="John Doe" profilePicture="/default-avatar.png">
            <Category />
          </HomeLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;