import { useState, useEffect } from "react";
import { FaUser, FaEdit, FaTimes, FaCheck } from "react-icons/fa";
import { motion } from "framer-motion";
import "./UserProfileModal.css";
import { useParams, useNavigate } from "react-router-dom";

export default function UserProfileModal({ isOpen, userData: initialUserData, onUpdateUser, onClose }) {
  // const navigate = useNavigate();

  const [userData, setUserData] = useState(initialUserData || null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    contact: "",
    college: "",
  });
  const userId = localStorage.getItem("userId");
  const userToken = localStorage.getItem("userToken");

  console.log("Current userId:", userId);
  console.log("Current token:", userToken);

  // Load user data from API
  const fetchUserData = async () => {
    try {
      setLoading(true);

      if (!userId || !userToken) {
        throw new Error("User ID or token not found in local storage.");
      }

      const response = await fetch(`/api/v1/profile/${userId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      console.log("Profile Response : ", response)

      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }

      const data = await response.json();
      console.log("userdata via fetchUserData : ", data)
      console.log("userdata via fetchUserData------- data.userProfile------ : ", data.userProfile)
      setUserData(data.userProfile);
      setEditData({
        name: data.userProfile.name || "",
        email: data.userProfile.email || "",
        contact: data.userProfile.contact || "",
        college: data.userProfile.college || "",
      });
    } catch (err) {
      setError(err.message);
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = async () => {
    try {
      setLoading(true);

      if (!userId || !userToken) {
        throw new Error("User ID or token not found in local storage.");
      }

      const response = await fetch(`/api/v1/profile/update-profile/${userId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      setUserData(data.updatedUserData);
      onUpdateUser?.(data.updatedUserData);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setIsEditing(false);
  };

  if (!isOpen) return null;


  useEffect(() => {
    const fetchAllColleges = async () => {
      setCollegesLoading(true);
      try {
        const response = await fetch("/api/v1/colleges/all-colleges");
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Failed to fetch colleges");

        // Handle both array and object responses
        const collegeList = Array.isArray(data) ? data : data.colleges || [];
        console.log("collegeList via fetchAllColleges: ", collegeList);
        setColleges(collegeList);
        console.log("colleges via fetchAllColleges : ", colleges);

      } catch (error) {
        console.error("Error fetching colleges:", error);
        setError("Failed to load colleges. Please try again later.");
      } finally {
        setCollegesLoading(false);
      }
    };

    if (isOpen) fetchAllColleges();
  }, [isOpen]);



  if (loading) {
    return (
      <div className="profile-modal-overlay" onClick={onClose}>
        <motion.div
          className="profile-modal-content"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="loading-spinner">Loading...</div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-modal-overlay" onClick={onClose}>
        <motion.div
          className="profile-modal-content"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="error-message">Error: {error}</div>
          <button onClick={() => setError(null)}>Try Again</button>
        </motion.div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <motion.div
        className="profile-modal-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="profile-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="profile-header">
          <div className="profile-avatar">
            {userData.profilePicture ? (
              <img src={userData.profilePicture} alt="Profile" />
            ) : (
              <span>
                {userData.name
                  ? userData.name.charAt(0).toUpperCase()
                  : <FaUser />}
              </span>
            )}
          </div>
          <h3>{userData.name || "User"}</h3>
        </div>

        <div className="profile-details">
          {isEditing ? (
            <>
              <button className="back-button" onClick={handleBack}>
                ← Back
              </button>
              <div className="profile-field">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="profile-field">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="profile-field">
                <label>Phone</label>
                <input
                  type="tel"
                  name="contact"
                  value={editData.contact}
                  onChange={handleInputChange}
                />
              </div>
              <div className="profile-field">
                <label>College</label>
                <select
                  name="college"
                  value={editData.college}
                  onChange={handleInputChange}
                  disabled={collegesLoading}
                >
                  <option value="" disabled hidden>
                    {collegesLoading ? "Loading colleges..." : "Select your college"}
                  </option>
                  {colleges.map((college) => (
                    <option key={college._id} value={college.collegeName}>
                      {college.collegeName}
                    </option>
                  ))}
                </select>
              </div>

            </>
          ) : (
            <>
              <div className="profile-field">
                <span className="field-label">Name</span>
                <span className="field-value">
                  {userData.name || "Not provided"}
                </span>
              </div>
              <div className="profile-field">
                <span className="field-label">Email</span>
                <span className="field-value">
                  {userData.email || "Not provided"}
                </span>
              </div>
              <div className="profile-field">
                <span className="field-label">Phone</span>
                <span className="field-value">
                  {userData.contact || "Not provided"}
                </span>
              </div>
              <div className="profile-field">
                <span className="field-label">College</span>
                <span className="field-value">
                  {userData.college || "Not provided"}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <button className="save-btn" onClick={handleEdit}>
              <FaCheck /> Save Changes
            </button>
          ) : (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              <FaEdit /> Edit Profile
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
















// import { useState, useEffect } from 'react';
// import { FaUser, FaEdit, FaTimes, FaCheck } from 'react-icons/fa';
// import { motion } from 'framer-motion';
// import './UserProfileModal.css'

// export default function UserProfileModal({ isOpen, onClose }) {
//   const [userData, setUserData] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false)
//   const [editData, setEditData] = useState({
//     name: '',
//     email: '',
//     contact: '',
//     college: ''
//   });

//   // Load user data from localStorage
//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const userId = localStorage.getItem("userId");
//         const response = await fetch(`/api/v1/profile/${userId}`, {
//           method: "GET",
//           credentials: "include",
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${localStorage.getItem('token')}`
//           }
//         });

//         if (!response.ok) {
//           throw new Error('Failed to fetch the user Data');
//         }

//         const data = await response.json();
//         const user = data.userProfile;
//         setUserData(user);
//         setEdit({
//           name: user.name || '',
//           email: user.email || '',
//           contact: user.contact || '',
//           college: user.college || ''
//         });
//       } catch (error) {
//         setError(error.message);
//         console.error('Error fetching user data:', error);
//       } finally {
//         setLoading(false);
//       }
//     }
//     if (isOpen) {fetchUserData()};
//   }, [isOpen]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleEdit = async () => {
//     try {
//       const userId = localStorage.getItem("userId");
//       const response = await fetch(`api/v1/profile/${userId}`, {
//         method: 'PUT',
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: editData.name,
//           email: editData.email,
//           contact: editData.contact,
//           college: editData.college,
//         }),
//       })

//       if (!response.ok) {
//         throw new Error('failed update the user Data');
//       }

//       const data = await response.json();
//       setUserData(data.updatedUserData);
//       setIsEditing(false);
//     } catch (error) {
//         throw new Error('Error in updating the profile');
//     }finally{
//       setLoading(false);
//     }
//   }

//   const handleBack = () => {
//     setIsEditing(false); // Just exit editing mode
//   };


//   if (!isOpen || !userData) return null;

//   return (
//     <div className="profile-modal-overlay" onClick={onClose}>

//       <motion.div
//         className="profile-modal-content"
//         initial={{ scale: 0.9, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         exit={{ scale: 0.9, opacity: 0 }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <button className="profile-modal-close" onClick={onClose}>
//           <FaTimes />
//         </button>

//         <div className="profile-header">
//           <div className="profile-avatar">
//             {userData.avatar ? (
//               <img src={userData.avatar} alt="Profile" />
//             ) : (
//               <span>{userData.name ? userData.name.charAt(0).toUpperCase() : <FaUser />}</span>
//             )}
//           </div>
//           <h3>{userData.name || 'User'}</h3>
//         </div>

//         <div className="profile-details">

//           {isEditing ? (
//             <>
//               <button
//                 className="back-button"
//                 onClick={handleBack}
//               >
//                 ← Back
//               </button>
//               <div className="profile-field">
//                 <label>Name</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={editData.name}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="profile-field">
//                 <label>Email</label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={editData.email}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="profile-field">
//                 <label>Phone Number</label>
//                 <input
//                   type="tel"
//                   name="contact"
//                   value={editData.contact}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="profile-field">
//                 <label>College</label>
//                 <input
//                   type="text"
//                   name="college"
//                   value={editData.college}
//                   onChange={handleInputChange}
//                 />
//               </div>
//             </>
//           ) : (
//             <>
//               <div className="profile-field">
//                 <span className="field-label">Name</span>
//                 <span className="field-value">{userData.name || 'Not provided'}</span>
//               </div>
//               <div className="profile-field">
//                 <span className="field-label">Email</span>
//                 <span className="field-value">{userData.email || 'Not provided'}</span>
//               </div>
//               <div className="profile-field">
//                 <span className="field-label">contact</span>
//                 <span className="field-value">{userData.contact || 'Not provided'}</span>
//               </div>
//               <div className="profile-field">
//                 <span className="field-label">College</span>
//                 <span className="field-value">{userData.college || 'Not provided'}</span>
//               </div>
//             </>
//           )}
//         </div>

//         <div className="profile-actions">
//           {isEditing ? (
//             <button className="save-btn" onClick={handleEdit}>
//               <FaCheck /> Save Changes
//             </button>
//           ) : (
//             <button className="edit-btn" onClick={() => setIsEditing(true)}>
//               <FaEdit /> Edit Profile
//             </button>
//           )}
//         </div>
//       </motion.div>
//     </div>
//   );
// }