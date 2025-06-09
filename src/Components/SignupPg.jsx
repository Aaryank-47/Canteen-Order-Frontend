import { GoogleLogin } from "@react-oauth/google";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./NavCSS.css";

export default function SignupPg({ isOpen, onClose, onLoginClick }) {
  const [formData, setFormData] = useState({
    name: "", college: "", contact: "", email: "", password: "", confirmPassword: ""
  });

  const [colleges, setColleges] = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAllColleges = async () => {
      setCollegesLoading(true);
      try {
        const response = await fetch("/api/v1/college/all-colleges");
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Failed to fetch colleges");

        // Handle both array and object responses
        const collegeList = Array.isArray(data) ? data : data.colleges || [];
        setColleges(collegeList);

      } catch (error) {
        console.error("Error fetching colleges:", error);
        setError("Failed to load colleges. Please try again later.");
      } finally {
        setCollegesLoading(false);
      }
    };

    if (isOpen) fetchAllColleges();
  }, [isOpen]);

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

  const handleSignup = async () => {


    const { name, college, contact, email, password, confirmPassword } = formData;

    if (password !== confirmPassword)
      return alert("Passwords do not match");

    setLoading(true)
    try {

      const response = await fetch("/api/v1/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, college, contact, email, password }),
      });

      console.log("Signup Response:", response);
      // alert(`Signed up as ${name}`);

      const data = await response.json();

      console.log("data : ", data);

      // if (Array.isArray(data)) {

      //   setColleges(data);

      // } else if (data.colleges && Array.isArray(data.colleges)) {

      //   setColleges(data.colleges);
      // } else {
      //   throw new Error("Invalid colleges data format");
      // }

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      onLoginClick();

    } catch (error) {
      console.error("Signup Error:", error);
      alert("An error occurred during signup. Please try again.");
      return;
    }
  };

  if (!isOpen) return null;

  return (

    <div className="signup-modal-overlay" onClick={handleOverlayClick}>
      <div className="signup-wrapper" onClick={(e) => e.stopPropagation()}>
        <h2>Create an Account</h2>

        {error && <div className="error-message">{error}</div>}
        <form>
          {["name", "contact", "email", "password", "confirmPassword"].map((field) => (
            <div key={field} className="signup-floating-label">
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
              <label>
                {field === "confirmPassword" ? "Confirm Password" :
                  field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
            </div>
          ))}

          <div className="signup-floating-label">
            <select
              name="college"
              value={formData.college}
              onChange={handleChange}
              required
              disabled={collegesLoading}
            >
              {collegesLoading ? (
                <option value="">Loading colleges...</option>
              ) : (
                <>
                  <option value="" disabled hidden>Select your college</option>
                  {Array.isArray(colleges) && colleges.map(college => (
                    <option key={college._id} value={college.collegeName}>
                      {college.collegeName}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>


          <button
            className="signup-button"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}

          </button>

        </form>

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






{/* <div className="signup-floating-label">
          <select
            name="college"
            value={formData.college}
            onChange={handleChange}
            required
            style={{ border: '1px solid #ccc', padding: '8px' }} // Temporary styling
          >
            <option value="" disabled hidden>
              {collegesLoading ? "Loading colleges..." : "Select your college"}
            </option>
            
            {colleges.map(college => (
              <option key={college._id} value={college.collegeName}>
                {college.collegeName}
              </option>
            ))}
            
            {!collegesLoading && colleges.length === 0 && (
              <option disabled>No colleges available</option>
            )}
          </select>
          <label>College</label>
        </div> */}