// LoginPg.jsx
import { GoogleLogin } from '@react-oauth/google';
// import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useState } from "react";
import PropTypes from "prop-types";
import "./NavCSS.css";

export default function LoginPg({ isOpen, onClose, onSignupClick, onLoginSuccess }) {
  const [identifier, setIdentifier] = useState(""); // Can be email or phone
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("login-modal-overlay")) onClose();
  };

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError("Please fill in both fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const isEmail = identifier.includes('@');
      const payload = isEmail ? { email: identifier, password } : { contact: identifier, password }

      const response = await fetch('/api/v1/users/login', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", //cookie
        body: JSON.stringify(payload),
      });
      console.log("Login Response : ",response);

      const data = await response.json();
      console.log("data : ",data)

      if (!response.ok) {
        throw new Error(data.message || 'Login FAILED');
      }

      // if (!data.user) {
      //   throw new Error('User data is missing in the response.');
      // }

      const { name, email, contact, _id } = data.user;

      localStorage.setItem("userData", JSON.stringify({ name, email, contact, _id }));
      localStorage.setItem('userId',data.userId);
      localStorage.setItem("token", data.token);
      // localStorage.setItem("userData", JSON.stringify({
      //   name: data.user?.name,
      //   email: data.user?.email,
      //   contact: data.user?.contact,
      //   userId: data.user?._id
      // }));


      onLoginSuccess({
        name: data.user?.name,
        email: data.user?.email,
        contact: data.user?.contact
      });
      onClose();


    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please try again.");

    } finally {
      setLoading(false);
    }
  }

  // const handleGoogleLogin = async (credentialResponse) => {
  //   const idtoken = credentialResponse.credential;
  //   try {
  //     // Handle successful login logic here
  //     const response = await fetch("/api/v1/users/google-login", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       credentials: "include",
  //       body: JSON.stringify({ idToken: idtoken })
  //     });

  //     const data = await response.json();
  //     console.log("Backend Response:", data);

  //     localStorage.setItem("token", data.token);
  //     localStorage.setItem("userData", JSON.stringify(data.user));

  //     onLoginSuccess(data.user);
  //     onClose();
  //   } catch (error) {
  //     console.error("Error during Google login:", error);
  //   }
  // };

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay" onClick={handleOverlayClick}>
      <div className="login-wrapper" onClick={(e) => e.stopPropagation()}>
        <h2>Sign In</h2>

        {error && <div className="error-message">{error}</div>}
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <div className="login-floating-label">
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
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

          <button
            className="login-button"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-divider-container">
          <hr className="login-divider" />
          <span className="login-divider-text">OR</span>
          <hr className="login-divider" />
        </div>

        <strong className="login-type">Login with Google</strong>
        {/* <GoogleOAuthProvider clientId="113373390210-s6dqhs50dfqateg8vidagfv3nqs8j974.apps.googleusercontent.com"> */}
        <GoogleLogin
          onSuccess={async (res) => {
            console.log("Google Login Success:", res);
            const idtoken = res.credential;
            try {
              // Handle successful login logic here
              const response = await fetch("http://localhost:5000/api/v1/users/google-login", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ idToken: idtoken })
              });

              const data = await response.json();
              console.log("Backend Response:", data);
            } catch (error) {
              console.error("Error during Google login:", error);
            }
          }}
          onError={() => console.log("Login Failed")}
        />
        {/* <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => console.log("Google Login Failed")}
          /> */}
        {/* </GoogleOAuthProvider> */}
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
