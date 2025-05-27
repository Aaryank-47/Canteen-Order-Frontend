// LoginPg.jsx
import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import PropTypes from "prop-types";
import "./NavCSS.css";

export default function LoginPg({ isOpen, onClose, onSignupClick }) {
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("login-modal-overlay")) onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="login-modal-overlay" onClick={handleOverlayClick}>
      <div className="login-wrapper" onClick={(e) => e.stopPropagation()}>
        <h2>Sign In</h2>

        <div className="login-floating-label">
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            autoComplete="off"
          />
          <label>Phone No. | Email-id</label>
        </div>

        <div className="login-floating-label">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="off"
          />
          <label>Password</label>
        </div>

        <button className="login-button" onClick={() => {
          if (!contact || !password) return alert("Please fill in both fields.");
          alert(contact.includes("@")
            ? `Logging in with Email: ${contact}`
            : `Logging in with Phone Number: ${contact}`);
          onClose();
        }}>
          Login
        </button>

        <div className="login-divider-container">
          <hr className="login-divider" />
          <span className="login-divider-text">OR</span>
          <hr className="login-divider" />
        </div>

        <strong className="login-type">Login with Google</strong>
        <GoogleLogin
          onSuccess={async (res) => {
            console.log("Google Login Success:", res);
            const idtoken = res.credential;
            try {
              // Handle successful login logic here
              const response = await fetch("http://localhost:5000/api/v1/auth/googlelogin", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ idtoken })
              });

              const data = await response.json();
              console.log("Backend Response:", data);
            } catch (error) {
              console.error("Error during Google login:", error);
            }
          }}
          onError={() => console.log("Login Failed")}
        />

        <p className="login-footer-text">
          Don't have an account?{" "}
          <span className="login-switch-link" onClick={onSignupClick}>
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

LoginPg.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSignupClick: PropTypes.func.isRequired,
};
