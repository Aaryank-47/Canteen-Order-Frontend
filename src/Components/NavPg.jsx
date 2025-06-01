import "./NavCSS.css";
import { useState } from "react";
import { BrowserRouter as Router, NavLink, Route, Routes } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import About from "./NavContent/About.jsx";
import Menu from "./NavContent/Menu.jsx";
import Info from "./NavContent/info.jsx";
import Orderhistory from "./NavContent/OrderHistory.jsx";
import Home from "./Home.jsx";
import LoginPg from "./LoginPg.jsx";
import SignupPg from "./SignupPg.jsx";
import College from "./NavContent/College.jsx";
import "./R_App.css";

export default function NavPg() {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isSignupOpen, setSignupOpen] = useState(false);
  const [isMobileView, setMobileView] = useState(false);

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
        </div>
        <ul className={`nav-list ${isMobileView ? "active" : ""}`}>
          <li className="nav-item">
            <NavLink
              to="/"
              onClick={() => setMobileView(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Home
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/about"
              onClick={() => setMobileView(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              About US
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/menu"
              onClick={() => setMobileView(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Menu
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/orderhistory"
              onClick={() => setMobileView(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Order History
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/info"
              onClick={() => setMobileView(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Info
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/college"
              onClick={() => setMobileView(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              College
            </NavLink>
          </li>
          <button className="nav-item" id="login" onClick={handleOpenLogin}>LOGIN</button>
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
        />
      )}

      {isSignupOpen && (
        <SignupPg
          isOpen={isSignupOpen}
          onClose={handleClose}
          onLoginClick={handleOpenLogin}
        />
      )}
    </Router>
  );
}
