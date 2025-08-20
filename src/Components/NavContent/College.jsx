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
  const [canteens, setCanteens] = useState([]);
  const [affiliatedCanteens, setAffiliatedCanteens] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
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

      const collegeId = localStorage.getItem('collegeId');
      const college = localStorage.getItem("college");
      const collegeToken = localStorage.getItem('collegeToken');

      console.log("collegeId : ", collegeId);
      console.log("college : ", college);

      if (!collegeToken) {
        console.log("No token found, logging out");
        setIsLoggedIn(false);
        setCollege(null);
        setShowRegistration(false); // ⬅️ set to false if you want Login, true if Registration
        return;
      }

      try {
        // const response = await fetch('http://localhost:5000/api/v1/colleges/verify-college-token', {
        const response = await fetch('https://canteen-order-backend.onrender.com/api/v1/colleges/verify-college-token', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${collegeToken}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        if (!data) {
          console.log('Can not get the data : ', data.mesage);
        }
        console.log("college data verification-token : ", data);

        if (!response.ok || !data?.college) {
          console.log('Unauthorized or invalid response, logging out user');
          localStorage.removeItem("collegeId");
          localStorage.removeItem("collegeToken");
          setIsLoggedIn(false);
          setCollege(null);
          setShowRegistration(false);
          return;
        }

        setCollege(college);
        console.log("data.college via verifyAuth: ", data.college);
        setIsLoggedIn(true);

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
      // const response = await fetch('http://localhost:5000/api/v1/colleges/register', {
      const response = await fetch('https://canteen-order-backend.onrender.com/api/v1/colleges/register', {
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
      // const response = await fetch('http://localhost:5000/api/v1/colleges/login', {
      const response = await fetch('https://canteen-order-backend.onrender.com/api/v1/colleges/login', {
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
      if (!data) {
        console.log("Error in getting login-data : ", data.message);
      }
      console.log(" Login data : ", data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      localStorage.setItem("collegeId", data.college.collegeId);
      localStorage.setItem("collegeToken", data.collegeToken);
      localStorage.setItem("college", data.college);

      setCollege({
        collegeId: data.college.collegeId,
        collegeName: data.college.collegeName,
        collegeEmail: data.college.collegeEmail,
      });
      console.log("data.college : ", data.college)

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
      // const response = await fetch('http://localhost:5000/api/v1/colleges/logout', {
      const response = await fetch('https://canteen-order-backend.onrender.com/api/v1/colleges/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {

        const data = response.json();
        if (!data) {
          console.log("Error in fetching logout funcitonality data : ", data.message);
        }
        console.log("Logged out data : ", data);

        localStorage.removeItem("collegeId");
        localStorage.removeItem("collegeToken");

        setIsLoggedIn(false);
        console.log("setCollege(college) : ", college);

        setCollege(null);
        console.log("setCollege(null) :  ", setCollege(null));
        setShowRegistration(true);
        showToast('success', 'Logged Out', 'You have been successfully logged out.');

      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      showToast('error', 'Logout Error', error.message || 'Failed to logout. Please try again.');
    }
  };

  const fetchAllCanteens = async () => {
    try {
      // const response = await fetch('http://localhost:5000/api/v1/admin/get-all-admins', {
      const response = await fetch('https://canteen-order-backend.onrender.com/api/v1/admin/get-all-admins', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch canteens');
      }

      const data = await response.json();
      if (!data) {
        console.error('No canteens found : ', data);
        throw new Error('No canteens found');
      }
      setCanteens(data.admins);
    } catch (error) {
      showToast('error', 'Fetch Error', error.message || 'Could not load canteens.');
    }
  }

  const fetchSelectedCanteens = async () => {
    const collegeId = localStorage.getItem("collegeId");

    if (!collegeId) {
      setAffiliatedCanteens([]);
      return;
    }
    console.log("Fetching selected canteens for collegeId:", collegeId);
    try {

      // const response = await fetch(`http://localhost:5000/api/v1/colleges/college-canteens/${collegeId}`, {
      const response = await fetch(`https://canteen-order-backend.onrender.com/api/v1/colleges/college-canteens/${collegeId}`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();
      if (!data) {
        console.log("Error in fetching selected canteens : ", data.message);
      }
      console.log("GET SELECTED CANTEENS DATA : ", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch selected canteens");
      }

      const formattedCanteens = (data.canteens || []).map(canteen => ({
        _id: canteen.id,
        name: canteen.name|| 'Anonymous Canteen'
      }));
      console.log("Formatted Canteens: ", formattedCanteens);

      setAffiliatedCanteens(formattedCanteens);
    } catch (error) {
      console.error("Error fetching selected canteens:", error.message);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchAllCanteens();
      fetchSelectedCanteens();
    }
  }, [isLoggedIn]);

  const handleAddCanteens = async () => {
    const collegeId = localStorage.getItem("collegeId");
    if (!collegeId) {
      console.error("College ID not found in localStorage");
    }
    const collegeToken = localStorage.getItem('collegeToken');

    console.log("Adding canteens for collegeId:", collegeId);
    console.log("Selected canteens to add:", selectedCanteens);
    if (selectedCanteens.length === 0) return;

    try {
      setIsAdding(true);
      // const response = await fetch(`http://localhost:5000/api/v1/colleges/add-college-canteens/${collegeId}`, {
      const response = await fetch(`https://canteen-order-backend.onrender.com/api/v1/colleges/add-college-canteens/${collegeId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${collegeToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ adminIds: selectedCanteens })
      });

      const data = await response.json();
      if (!data) {
        console.log("Error in fetching the data : ", data.message);
      }
      console.log("Adding Canteens Data : ", data)

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add canteen');
      }

      showToast('success', 'Success', 'Canteen added successfully');
      await fetchSelectedCanteens();

    } catch (error) {
      console.error('Add canteen error:', error.message);
      showToast('error', 'Error', error.message || 'Failed to add canteen');
    } finally {
      setIsAdding(false);
    }
  };

  const removeCanteen = async (canteenId) => {
    const collegeId = localStorage.getItem("collegeId");
    const collegeToken = localStorage.getItem('collegeToken');
    console.log("Removing canteen for collegeId:", collegeId);

    if (!collegeId || !canteenId) {
      console.error("College ID or Canteen ID not found");
      return;
    }

    try {
      setIsRemoving(true);
      // const response = await fetch(`http://localhost:5000/api/v1/colleges/remove-college-canteen/${collegeId}`, {
      const response = await fetch(`https://canteen-order-backend.onrender.com/api/v1/colleges/remove-college-canteen/${collegeId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${collegeToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ adminId: canteenId })
      });

      const data = await response.json();
      if (!data) {
        console.log("Error in fetching the data : ", data.message);
      }
      console.log("Removing Canteen Data : ", data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove canteen');
      }

      showToast('success', 'Success', 'Canteen removed successfully');
      await fetchSelectedCanteens();

    } catch (error) {
      console.error('Remove canteen error:', error.message);
      showToast('error', 'Error', error.message || 'Failed to remove canteen');
    } finally {
      setIsRemoving(false);
    }
  };

  const handleCanteenSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions)
      .map(option => option.value);
    setSelectedCanteens(selectedOptions);
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
            <div className="college-info">
              <h1>College Dashboard</h1>
              {college && <h2 className="college-name">{college.collegeName}</h2>}
            </div>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>

          <div className="canteen-management">
            <h2>Manage Your Canteens</h2>

            <div className="canteen-selection-container">
              <div className="canteen-select-box">
                <label>Select Canteens to Affiliate:</label>
                <div className="select-wrapper">
                  <select
                    multiple
                    onChange={handleCanteenSelect}
                    className="canteen-select"
                    value={selectedCanteens}
                  >
                    {canteens?.length > 0 ? (
                      canteens.map(canteen => (
                        <option key={canteen._id} value={canteen._id}>
                          {canteen.adminName}
                        </option>
                      ))
                    ) : (
                      <option disabled>No canteens available</option>
                    )}
                  </select>
                </div>
                <p className="select-hint">Hold Ctrl/Cmd to select multiple canteens</p>
                <button
                  className="add-btn"
                  onClick={handleAddCanteens}
                  disabled={selectedCanteens.length === 0 || isAdding}
                >
                  {isAdding ? 'Adding...' : 'Add Selected Canteens'}
                </button>
              </div>

              <div className="affiliated-canteens">
                <h3>Affiliated Canteens</h3>
                {affiliatedCanteens?.length > 0 ? (
                  <ul className="affiliated-list">
                    {affiliatedCanteens.map(canteen => (
                      <li key={canteen._id} className="affiliated-item">
                        <span>{canteen.name}</span>
                        <button
                          className="remove-btn"
                          onClick={() => removeCanteen(canteen._id)}
                          disabled={isRemoving}
                          title="Remove canteen"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-canteens">No canteens affiliated yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



