import { useState } from 'react';
import './College.css';

export default function College() {
  const [showRegistration, setShowRegistration] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedCanteens, setSelectedCanteens] = useState([]);
  
  const canteens = [
    { id: 1, name: 'Main Canteen' },
    { id: 2, name: 'Hostel Canteen' },
    { id: 3, name: 'Medical Block Canteen' }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  const handleCanteenSelect = (e) => {
    const options = e.target.selectedOptions;
    const selected = Array.from(options).map(option => option.value);
    setSelectedCanteens(selected);
  };

  return (
    <div className="college-page">
      {!isLoggedIn ? (
        <div className="auth-modal">
          {showRegistration ? (
            <div className="registration-form">
              <h2>College Registration</h2>
              <form>
                <input type="text" placeholder="College Name" required />
                <input type="text" placeholder="College Address" required />
                <input type="text" placeholder="College Code" required />
                <input type="email" placeholder="College Email" required />
                <input type="password" placeholder="Password" required />
                <button type="submit" onClick={() => setShowRegistration(false)}>
                  Register
                </button>
              </form>
              <p>
                Already registered?{' '}
                <button onClick={() => setShowRegistration(false)}>
                  Login here
                </button>
              </p>
            </div>
          ) : (
            <div className="login-form">
              <h2>College Login</h2>
              <form onSubmit={handleLogin}>
                <input type="email" placeholder="College Email" required />
                <input type="password" placeholder="Password" required />
                <button type="submit">Login</button>
              </form>
              <p>
                Need to register?{' '}
                <button onClick={() => setShowRegistration(true)}>
                  Register here
                </button>
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="college-dashboard">
          <h1>College Dashboard</h1>
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
              <button className="add-btn">Add Selected Canteens</button>
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