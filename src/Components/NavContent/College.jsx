import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './College.css';

export default function College() {
  // State management
  const [showRegistration, setShowRegistration] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedCanteens, setSelectedCanteens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [college, setCollege] = useState(null);

  const [formData, setFormData] = useState({
    collegeName: '',
    collegeEmail: '',
    collegePassword: '',
    confirmPassword: '',
    collegeAddress: '',
    collegeCode: ''
  });

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    collegeCode: ''
  });

  // Canteen data
  const canteens = [
    { id: 1, name: 'Main Canteen' },
    { id: 2, name: 'Hostel Canteen' },
    { id: 3, name: 'Medical Block Canteen' }
  ];

  // Toast notification helpers
  const showToast = (type, title, message, duration = 5000) => {
    toast[type](
      <div className="custom-toast">
        <h4>{title}</h4>
        <p>{message}</p>
      </div>,
      {
        position: "top-right",
        autoClose: duration,
        className: `toast-${type}`,
        closeButton: true,
      }
    );
  };

  // Handle input changes for both forms
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    showRegistration
      ? setFormData(prev => ({ ...prev, [name]: value }))
      : setLoginData(prev => ({ ...prev, [name]: value }));
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      collegeName: '',
      collegeEmail: '',
      collegePassword: '',
      confirmPassword: '',
      collegeAddress: '',
      collegeCode: ''
    });
  };

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/v1/colleges/verify-college-token', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(true);
          setCollege(data.college);
          localStorage.setItem("CollegeId", data.college._id);
        } else {
          localStorage.removeItem("CollegeId");
          localStorage.removeItem("CollegeToken");
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Auth verification error:", error);
      }
    };

    verifyAuth();
  }, []);

  // Handle college registration
  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.collegePassword !== formData.confirmPassword) {
      showToast('error', 'Password Mismatch', 'The passwords you entered do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/v1/colleges/register', {
        method: 'POST',
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeName: formData.collegeName,
          collegeEmail: formData.collegeEmail,
          collegePassword: formData.collegePassword,
          collegeAddress: formData.collegeAddress,
          collegeCode: formData.collegeCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.message.includes("already exists")) {
          showToast('warning', 'College Code Taken',
            `The code "${formData.collegeCode}" is already registered. Please use a different code.`,
            8000);
        } else {
          throw new Error(data.message || 'Registration failed due to server error');
        }
        return;
      }

      showToast('success', 'Registration Complete!',
        'Your college has been successfully registered. You can now log in.',
        6000);

      resetForm();
      setShowRegistration(false);

    } catch (error) {
      showToast('error', 'Registration Failed',
        error.message || 'Please check your details and try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle college login
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/v1/colleges/login', {
        method: 'POST',
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeEmail: loginData.email,
          collegePassword: loginData.password,
          collegeCode: loginData.collegeCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      setCollege(data.college);
      showToast('success', 'Login Successful!', 'Welcome to your college dashboard.', 3000);
      setIsLoggedIn(true);

    } catch (error) {
      showToast('error', 'Login Failed', error.message || 'Please try again.');
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/colleges/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        localStorage.removeItem("CollegeId");
        setIsLoggedIn(false);
        setCollege(null);
        setShowRegistration(true); // Reset to show login form
        showToast('success', 'Logged Out', 'You have been successfully logged out.');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      showToast('error', 'Logout Error', error.message || 'Failed to logout. Please try again.');
    }
  };

  // Handle canteen selection
  const handleCanteenSelect = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(option => option.value);
    setSelectedCanteens(selected);
  };

  // Handle adding canteens
  const handleAddCanteens = () => {
    if (selectedCanteens.length === 0) {
      showToast('warning', 'No Canteens Selected', 'Please select at least one canteen to add.');
      return;
    }

    showToast('success', 'Canteens Added',
      `Successfully added ${selectedCanteens.length} canteen(s) to your college.`);
  };

  return (
    <div className="college-page">
      <ToastContainer />
      
      {!isLoggedIn ? (
        <div className="auth-modal">
          {showRegistration ? (
            <div className="registration-form">
              <h2>College Registration</h2>
              <form onSubmit={handleSignup}>
                <input
                  type="text"
                  name="collegeName"
                  placeholder="College Name"
                  value={formData.collegeName}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <input
                  type="text"
                  name="collegeAddress"
                  placeholder="College Address"
                  value={formData.collegeAddress}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <input
                  type="text"
                  name="collegeCode"
                  placeholder="College Code (Unique)"
                  value={formData.collegeCode}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <input
                  type="email"
                  name="collegeEmail"
                  placeholder="College Email"
                  value={formData.collegeEmail}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <input
                  type="password"
                  name="collegePassword"
                  placeholder="Password"
                  value={formData.collegePassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Register'}
                </button>
              </form>
              <p>
                Already registered?{' '}
                <button
                  onClick={() => setShowRegistration(false)}
                  disabled={isLoading}
                >
                  Login here
                </button>
              </p>
            </div>
          ) : (
            <div className="login-form">
              <h2>College Login</h2>
              <form onSubmit={handleLogin}>
                <input
                  type="text"
                  name="collegeCode"
                  placeholder="College Code"
                  value={loginData.collegeCode}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="College Email"
                  value={loginData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>
              <p>
                Need to register?{' '}
                <button
                  onClick={() => setShowRegistration(true)}
                  disabled={isLoading}
                >
                  Register here
                </button>
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="college-dashboard">
          <div className="dashboard-header">
            <h1>College Dashboard</h1>
            <button 
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
          
          <div className="canteen-management">
            <h2>Manage Your Canteens</h2>

            <div className="canteen-selection">
              <select multiple onChange={handleCanteenSelect}>
                {canteens.map(canteen => (
                  <option key={canteen.id} value={canteen.id}>
                    {canteen.name}
                  </option>
                ))}
              </select>
              <p>Hold Ctrl/Cmd to select multiple canteens</p>
              <button className="add-btn" onClick={handleAddCanteens}>
                Add Selected Canteens
              </button>
            </div>

            <div className="current-canteens">
              <h3>Your Canteens</h3>
              {selectedCanteens.length > 0 ? (
                <ul>
                  {selectedCanteens.map(id => {
                    const canteen = canteens.find(c => c.id.toString() === id);
                    return <li key={id}>{canteen?.name}</li>;
                  })}
                </ul>
              ) : (
                <p>No canteens selected yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}