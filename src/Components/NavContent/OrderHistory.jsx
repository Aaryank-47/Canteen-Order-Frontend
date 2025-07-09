import { useEffect, useState } from 'react';
import './OrderHistory.css';
import { Player } from '@lottiefiles/react-lottie-player';
import loginAnimation from '../../assets/user-req-login.json';
import noOrdersAnimation from '../../assets/No_order.json';
import loadingAnimation from '../../assets/loading.json'

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDelayedLoading, setIsDelayedLoading] = useState(false);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      setLoading(false); // don't fetch if not logged in
      return;
    }

    // Set delayed loading after 2 seconds if still loading
    const delayTimer = setTimeout(() => {
      if (loading) {
        setIsDelayedLoading(true);
      }
    }, 2000);

    const showOrderHistory = async () => {
      try {
        // const response = await fetch(`http://localhost:5000/api/v1/orders/order-history/${userId}`, {
        const response = await fetch(`https://canteen-order-backend.onrender.com/api/v1/orders/order-history/${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        const data = await response.json();
        console.log("Fetched data: ", data);

        if (response.status === 404 || !Array.isArray(data.orders)) {
          setOrders([]);
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Error fetching order history");
        }

        setOrders(data.orders);
      } catch (err) {
        console.error("Error in order history:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
        setIsDelayedLoading(false);
        clearTimeout(delayTimer);
      }
    };

    showOrderHistory();

    return () => clearTimeout(delayTimer);
  }, [userId]);

  // Show loading animation when API is taking time (only if orders will exist)
  if (isDelayedLoading && userId) {
    return (
      <div className="order-history-page flex-col-center">
        <Player 
          autoplay 
          loop 
          src={loadingAnimation} 
          style={{ height: '300px', width: '300px' }} 
        />
        <h2 className="text-xl font-semibold mt-4">Loading your order history...</h2>
      </div>
    );
  }

  // If user is not logged in
  if (!userId) {
    return (
      <div className="order-history-page flex-col-center">
        <Player autoplay loop src={loginAnimation} style={{ height: '300px', width: '300px' }} />
        <h2 className="text-xl font-semibold mt-4">Please login to view your order history</h2>
      </div>
    );
  }

  // While fetching data
  if (loading) return <div className="order-history-page">Loading your orders...</div>;

  // If an error occurred
  if (error) return <div className="order-history-page">Error: {error}</div>;

  // If user has no orders
  if (orders.length === 0) {
    return (
      <div className="order-history-page flex-col-center">
        <Player autoplay loop src={noOrdersAnimation} style={{ height: '300px', width: '300px' }} />
        <h2 className="text-xl font-semibold mt-4">You haven't ordered yet. Choose your canteen & enjoy delicious food!</h2>
      </div>
    );
  }

  // If orders exist
  return (
    <div className="order-history-page">
      <h1>Your Order History</h1>

      <div className="orders-list">
        {orders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <span className="order-id">Order #{order.orderNumber || order._id}</span>
              <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
              <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
            </div>

            <div className="order-items">
              {order.foodItems?.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="food-info">
                    <span className="food-name">{item.foodId?.foodName || "Unknown Item"}</span>
                    <span className="food-price">₹{item.foodId?.foodPrice || 0} each</span>
                  </div>
                  <div className="item-total">
                    <span>{item.foodQuantity}x</span>
                    <span>₹{(item.foodId?.foodPrice || 0) * item.foodQuantity}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <span className="order-total">Total: ₹{order.totalPrice}</span>
              <button className="reorder-btn">Reorder</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}














// import { useEffect, useState } from 'react';
// import './OrderHistory.css';

// export default function OrderHistory() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const showOrderHistory = async () => {
//       try {
//         const userId = localStorage.getItem("userId");
//         const response = await fetch(`http://localhost:5000/api/v1/orders/order-history/${userId}`, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           credentials: 'include'
//         });

//         const data = await response.json();
//         console.log("Fetched data: ", data);

//         if (response.status === 404) {
//           setOrders([]);
//           return;
//         }

//         if (!response.ok) {
//           throw new Error(data.message || "Error fetching order history");
//         }

//         setOrders(Array.isArray(data.orders) ? data.orders : []);
//       } catch (err) {
//         console.error("Error in order history:", err);
//         setError(err.message || "Something went wrong");
//       } finally {
//         setLoading(false);
//       }
//     };

//     showOrderHistory();
//   }, []);

//   if (loading) return <div className="order-history-page">Loading your orders...</div>;
//   if (error) return <div className="order-history-page">Error: {error}</div>;

//   return (
//     <div className="order-history-page">
//       <h1>Your Order History</h1>

//       <div className="orders-list">
//         {orders.length === 0 ? (
//           <p>No past orders found.</p>
//         ) : (
//           orders.map(order => (
//             <div key={order._id} className="order-card">
//               <div className="order-header">
//                 <span className="order-id">Order #{order.orderNumber || order._id}</span>
//                 <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
//                 <span className={`order-status ${order.status.toLowerCase()}`}>
//                   {order.status}
//                 </span>
//               </div>

//               <div className="order-items">
//                 {order.foodItems?.map((item, index) => (
//                   <div key={index} className="order-item">
//                     <div className="food-info">
//                       <span className="food-name">{item.foodId?.foodName || "Unknown Item"}</span>
//                       <span className="food-price">₹{item.foodId?.foodPrice || 0} each</span>
//                     </div>
//                     <div className="item-total">
//                       <span>{item.foodQuantity}x</span>
//                       <span>₹{(item.foodId?.foodPrice || 0) * item.foodQuantity}</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>



//               <div className="order-footer">
//                 <span className="order-total">Total: ₹{order.totalPrice}</span>
//                 <button className="reorder-btn">Reorder</button>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }














// import { useEffect } from 'react';
// import './OrderHistory.css';

// const pastOrders = [
//   {
//     id: 1001,
//     date: '2023-05-15',
//     items: [
//       { name: 'Masala Dosa', quantity: 2, price: 50 },
//       { name: 'Coffee', quantity: 1, price: 20 }
//     ],
//     total: 120,
//     status: 'Delivered'
//   },
//   {
//     id: 1002,
//     date: '2023-05-10',
//     items: [
//       { name: 'Veg Thali', quantity: 1, price: 80 }
//     ],
//     total: 80,
//     status: 'Delivered'
//   }
// ];

// export default function OrderHistory() {
//   useEffect(() => {
//     const showOrderHistory = async () => {
//       try {
//         const userId = localStorage.getItem("userId");
//         const response = await fetch(`api/v1/orders/order-history/${userId}`, {
//           method: 'GET'
//         });
//         const data = await response.json();
//         if (!data) {
//           throw new Error("Error in fetch data");
//         }
//         console.log("data : ", data);
//         if (!response.ok) {
//           throw new Error(data.message || "error in resposing orders of this users");
//         }
//         console.log("Order History Response", response);
//       } catch (error) {
//         console.log("error in order history");
//       }
//     };
//     showOrderHistory();
//   }, []);

//   return (
//     <div className="order-history-page">
//       <h1>Your Order History</h1>

//       <div className="orders-list">
//         {pastOrders.map(order => (
//           <div key={order.id} className="order-card">
//             <div className="order-header">
//               <span className="order-id">Order #{order.id}</span>
//               <span className="order-date">{order.date}</span>
//               <span className={`order-status ${order.status.toLowerCase()}`}>
//                 {order.status}
//               </span>
//             </div>

//             <div className="order-items">
//               {order.items.map((item, index) => (
//                 <div key={index} className="order-item">
//                   <span>{item.quantity}x {item.name}</span>
//                   <span>₹{item.price * item.quantity}</span>
//                 </div>
//               ))}
//             </div>

//             <div className="order-footer">
//               <span className="order-total">Total: ₹{order.total}</span>
//               <button className="reorder-btn">Reorder</button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }