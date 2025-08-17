import "./NavCSS.css";
import { useState, useEffect } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
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
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function NavPg() {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isSignupOpen, setSignupOpen] = useState(false);
  const [isMobileView, setMobileView] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {

      const userToken = localStorage.getItem('userToken');
      const userId = localStorage.getItem('userId');

      console.log('Checking auth status, userToken:', userToken);
      console.log('Checking auth status, userId:', userId);

      if (userToken) {
        try {
          // const response = await fetch('http://localhost:5000/api/v1/users/verify-token', {
          const response = await fetch('https://canteen-order-backend.onrender.com/api/v1/users/verify-token', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${userToken}`,
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json();

          if (!response.ok) {
            throw new Error('Token verification failed', data.message);
          }
          console.log('Auth response:', response);

          if (!data) {
            console.log('No user data found in response', data.message);
          }

          console.log('Token verification successful, user data:', data);
          // localStorage.setItem('userData', JSON.stringify(data));

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

    const savedUser = JSON.parse(localStorage.getItem("userData"));
    const clg = savedUser?.college;
    console.log("College found in localStorage:", clg);

    if (!clg || clg.trim() === "" || clg === null || clg === undefined) {
      setTimeout(() => {
      alert("⚠️ Update your profile with College Name & Phone Number before placing an order.");
      toast("Update your profile with College Name & Phone Number before placing an order.", {
        icon: "⚠️",
        position: "top-center"
      });
    }, 1000);
    
      setIsProfileOpen(true);
    } else {
      navigate("/");
    }

  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      // const userToken = localStorage.getItem('userToken');
      await fetch('api/v1/users/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userId');
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
    <>
      <nav className="nav">
        <h1 className="logo">RESTRO</h1>
        <div className="hamburger" onClick={() => setMobileView(!isMobileView)}>
          {isMobileView ? <FaTimes /> : <FaBars />}
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
                    {userData?.name ? userData.name.charAt(0).toUpperCase() : <FaUserCircle />}
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
        <Route path="/profile/:userId" element={<UserProfileModal />} />
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
    </>
  );
}
