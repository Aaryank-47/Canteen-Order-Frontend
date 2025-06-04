import "./NavCSS.css";
import { useState, useEffect} from "react";
import { BrowserRouter as Router, NavLink, Route, Routes } from "react-router-dom";
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import About from "./NavContent/About.jsx";
import Menu from "./NavContent/Menu.jsx";
import Info from "./NavContent/info.jsx";
import Orderhistory from "./NavContent/OrderHistory.jsx";
import Home from "./Home.jsx";
import LoginPg from "./LoginPg.jsx";
import SignupPg from "./SignupPg.jsx";
import College from "./NavContent/College.jsx";
import UserProfileModal from "./NavContent/userProfileModal.jsx";
import "./R_App.css";

export default function NavPg() {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isSignupOpen, setSignupOpen] = useState(false);
  const [isMobileView, setMobileView] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/users/verify-token', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const user = JSON.parse(localStorage.getItem('userData'));
            setIsLoggedIn(true);
            setUserData(user);
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
          handleLogout();
        }
      }
    };
    checkAuthStatus();
  }, []);

  const handleLoginSuccess = async (user) => {
    setIsLoggedIn(true);
    setUserData(user);
    setLoginOpen(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('/users/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      setIsLoggedIn(false);
      setUserData(null);
      setIsProfileOpen(false);
      setLoading(false);
    }
  };

  const handleOpenLogin = () => {
    setLoginOpen(true);
    setSignupOpen(false);
  };
  const handleOpenSignup = () => {
    setSignupOpen(true);
    setLoginOpen(false);
  };
  const handleClose = () => {
    setLoginOpen(false);
    setSignupOpen(false);
  };
  return (
    <Router>
      <nav className="nav">
        <h1 className="logo">RESTRO</h1>
        <div className="hamburger" onClick={() => setMobileView(!isMobileView)}>
          {isMobileView ? <FaTimes /> : <FaBars />}
          {/* {isMobileView ? <FaBars /> : <FaTimes />} */}
        </div>
        <ul className={`nav-list ${isMobileView ? 'active' : ''}`}>
          <li className="nav-item">
            <NavLink
              to="/"
              onClick={() => setMobileView(false)}
              className={`navlink ${({ isActive }) => (isActive ? 'active' : '')}`}
            >
              Home
            </NavLink>
          </li>
          <li className="nav-item" id="about-nav">
            <NavLink
              to="/about"
              onClick={() => setMobileView(false)}
              className={`navlink ${({ isActive }) => (isActive ? 'active' : '')}`}
            >
              About US
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/menu"
              onClick={() => setMobileView(false)}
              className={`navlink ${({ isActive }) => (isActive ? 'active' : '')}`}
            >
              Menu
            </NavLink>
          </li>
          <li className="nav-item" id="oh-nav">
            <NavLink
              to="/orderhistory"
              onClick={() => setMobileView(false)}
              className={`navlink ${({ isActive }) => (isActive ? 'active' : '')}`}
            >
              Order History
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/info"
              onClick={() => setMobileView(false)}
              className={`navlink ${({ isActive }) => (isActive ? 'active' : '')}`}
            >
              Info
            </NavLink>
          </li>
          <li className="nav-item" id="college-nav">
            <NavLink
              to="/college"
              onClick={() => setMobileView(false)}
              className={`navlink ${({ isActive }) => (isActive ? 'active' : '')}`}
            >
              College
            </NavLink>
          </li>
          {isLoggedIn ? (
            <div className="profile-container">
              <button
                className="profile-icon-btn"
                onClick={() => setIsProfileOpen(true)}
                disabled={loading}
              >
                {userData?.avatar ? (
                  <img
                    src={userData.avatar}
                    alt="Profile"
                    className="profile-avatar-img"
                  />
                ) : (
                  <div className="profile-initials">
                    {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </button>
              <button
                className="logout-btn"
                onClick={handleLogout}
                disabled={loading}
              >
                <FaSignOutAlt />
                {loading ? '...' : ''}
              </button>
            </div>
          ) : (
            <button className="nav-item" id="login" onClick={handleOpenLogin}>
              LOGIN
            </button>
          )}
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/orderhistory" element={<Orderhistory />} />
        <Route path="/info" element={<Info />} />
        <Route path="/college" element={<College />} />
      </Routes>

      {isLoginOpen && (
        <LoginPg
          isOpen={isLoginOpen}
          onClose={handleClose}
          onSignupClick={handleOpenSignup}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {isSignupOpen && (
        <SignupPg
          isOpen={isSignupOpen}
          onClose={handleClose}
          onLoginClick={handleOpenLogin}
        />
      )}
      {isProfileOpen && (
        <UserProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          userData={userData}
          onUpdateUser={(updatedUser) => {
            localStorage.setItem('userData', JSON.stringify(updatedUser));
            setUserData(updatedUser);
          }}
        />
      )}
    </Router>
  );
}
