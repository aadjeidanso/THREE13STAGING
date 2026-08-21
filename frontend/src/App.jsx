import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService'; 
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function AccountSessionBoundary() {
  const location = useLocation();
  const previousPathRef = React.useRef(location.pathname);

  React.useEffect(() => {
    const previousPath = previousPathRef.current;
    const currentPath = location.pathname;

    if (previousPath.startsWith('/dashboard') && !currentPath.startsWith('/dashboard')) {
      window.localStorage.removeItem('three13_token');
      window.sessionStorage.removeItem('three13_student_start_pane');
      window.sessionStorage.removeItem('three13_admin_start_pane');
    }

    previousPathRef.current = currentPath;
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <AccountSessionBoundary />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/dashboard" element={<Dashboard />} />
      
        {/* For the Future: I will add register, login, dashboard routes etc...*/}
      </Routes>
    </Router>
  );
}

export default App;
