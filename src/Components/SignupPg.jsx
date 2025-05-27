import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import PropTypes from "prop-types";
import "./NavCSS.css";

export default function SignupPg({ isOpen, onClose, onLoginClick }) {
  const [formData, setFormData] = useState({
    name: "", college: "", contact: "", email: "", password: "", confirmPassword: ""
  });

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("signup-modal-overlay")) onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contact") {
      // Accept only numbers, max 10 digits
      if (/^\d{0,10}$/.test(value)) {
        setFormData((s) => ({ ...s, [name]: value }));
      }
    } else {
      setFormData((s) => ({ ...s, [name]: value }));
    }
  };

  const handleSignup = () => {
    const { name, college, contact, email, password, confirmPassword } = formData;

    if (!name || !college || !contact || !email || !password || !confirmPassword)
      return alert("Please fill all fields");

    if (!/^\d{10}$/.test(contact))
      return alert("Contact number must be exactly 10 digits");

    if (password !== confirmPassword)
      return alert("Passwords do not match");

    alert(`Signed up as ${name}`);
    onLoginClick();
  };

  if (!isOpen) return null;
  return (
    <div className="signup-modal-overlay" onClick={handleOverlayClick}>
      <div className="signup-wrapper" onClick={(e) => e.stopPropagation()}>
        <h2>Create an Account</h2>

        {["name", "college", "contact", "email", "password", "confirmPassword"].map((field) => (
          <div key={field} className="signup-floating-label">
            {field === "college" ? (
              <select
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
              >
                <option value="" disabled hidden />
                <option>IIT Delhi</option>
                <option>IIT Bombay</option>
                <option>IIT Kanpur</option>
              </select>
            ) : (
              <input
                type={
                  field.includes("password") ? "password" :
                  field === "contact" ? "tel" :
                  field === "email" ? "email" : "text"
                }
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
                maxLength={field === "contact" ? 10 : undefined}
              />
            )}
            <label>
              {field === "confirmPassword" ? "Confirm Password" :
                field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
          </div>
        ))}

        <button className="signup-button" onClick={handleSignup}>
          Sign Up
        </button>

        <p className="signup-footer-text">
          Already have an account?{" "}
          <span className="signup-switch-link" onClick={onLoginClick}>
            Login
          </span>
        </p>

        <div className="signup-divider-container">
          <hr className="signup-divider" />
          <span className="signup-divider-text">OR</span>
          <hr className="signup-divider" />
        </div>

        <strong className="signup-type">Sign up with Google</strong>
        <GoogleLogin
          onSuccess={res => console.log("Google Signup Success:", res)}
          onError={() => console.log("Google Signup Failed")}
        />
      </div>
    </div>
  );
}

SignupPg.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onLoginClick: PropTypes.func.isRequired,
};
