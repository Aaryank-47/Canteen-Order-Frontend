import { useState, useEffect } from 'react';
import './Menu.css';

export default function Menu() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [orderHistory, setOrderHistory] = useState([]);
  const [allfoodItems, setAllFoodItems] = useState([]);

  const loadAllFoodItems = async () => {
    try {
      const response = await fetch(`/api/v1/foods/`, {
        method: 'GET'
      });

      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        throw new Error(data.message || "Failed to load food Items");
      }

      if (!data) {
        console.log("data couldn't be fetched");
      }

      console.log("Fetched foods: ", data.foodslist);
      setAllFoodItems(data.foodslist);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    loadAllFoodItems();
  }, []);

  const user = {
    name: "John Doe",
    phone: "9876543210",
    address: "123 College Hostel, University Campus",
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1, cartId: Date.now() }]);
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const adjustQuantity = (cartId, amount) => {
    setCart(cart.map(item => {
      if (item.cartId === cartId) {
        const newQuantity = item.quantity + amount;
        return {
          ...item,
          quantity: newQuantity > 0 ? newQuantity : 1
        };
      }
      return item;
    }));
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    setCheckoutStep('payment');
  };

  const handlePlaceOrder = () => {
    const order = {
      id: Date.now(),
      items: [...cart],
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      user: { ...user },
      paymentMethod,
      date: new Date().toISOString(),
      status: 'Preparing'
    };

    setOrderHistory([order, ...orderHistory]);
    setCart([]);
    setCheckoutStep('confirmation');
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        } else {
          entry.target.classList.remove('in-view');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    });

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach((item, index) => {
      item.style.setProperty('--index', index);
      observer.observe(item);
    });

    return () => {
      menuItems.forEach(item => observer.unobserve(item));
      observer.disconnect();
    };
  }, [allfoodItems]);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="menu-page">
      <div className="menu-header">
        <h1>Student Specials</h1>
        <p>Budget-friendly meals that taste like home</p>
      </div>

      <div className="menu-container">
        <div className="menu-items">
          {Array.isArray(allfoodItems) ? (
            allfoodItems.map(item => (
              <div key={item._id} className="menu-item">
                <div className="item-image">
                  <img src={item.foodImage} alt={item.foodName} />
                </div>
                <div className="item-details">
                  <h3>{item.foodName}</h3>
                  <p className="item-description">{item.foodDescription}</p>
                  <p className="item-price">₹{item.foodPrice}</p>
                  <p className="item-category">{item.foodCategory}</p>
                </div>
                <div className="item-actions">
                  <button className="add-to-cart-btn" onClick={() => addToCart(item)}>
                    Add +
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No items found.</p>
          )}
        </div>
      </div>

      {/* {Array.isArray(allFoodItems) ? (
        allFoodItems.map((item) => (
          <div key={item._id} className="menu-item">
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p>₹{item.price}</p>
          </div>
        ))
      ) : (
        <p>No items found.</p>
      )} */}

      {/* 🛒 Cart Preview */}
      <div className={`cart-preview ${isCartOpen ? 'active' : ''}`}>
        <button className="close-cart" onClick={() => {
          setIsCartOpen(false);
          if (checkoutStep !== 'cart') setCheckoutStep('cart');
        }}>×</button>

        {checkoutStep === 'cart' && (
          <>
            <h3>Your Cart ({totalItems})</h3>
            <ul className="cart-items">
              {cart.map(item => (
                <li key={item.cartId}>
                  <div className="cart-item-info">
                    <span>{item.name} (₹{item.price})</span>
                    <div className="quantity-controls">
                      <button onClick={() => adjustQuantity(item.cartId, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => adjustQuantity(item.cartId, 1)}>+</button>
                    </div>
                  </div>
                  <div className="cart-item-subtotal">
                    ₹{item.price * item.quantity}
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.cartId)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <div className="cart-total">
              Total: ₹{totalAmount}
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              Proceed to Payment
            </button>
          </>
        )}

        {/* 💳 Payment Section */}
        {checkoutStep === 'payment' && (
          <div className="payment-section">
            <h3>Complete Your Order</h3>
            <div className="user-details-summary">
              <h4>Delivery To</h4>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Phone:</strong> {user.phone}</p>
              <p><strong>Address:</strong> {user.address}</p>
            </div>

            <div className="payment-options">
              <h4>Payment Method</h4>
              {['cash', 'upi', 'card'].map(method => (
                <label key={method} className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                  />
                  <div className="payment-content">
                    <span>{method === 'cash' ? 'Cash on Delivery' : method === 'upi' ? 'UPI Payment' : 'Credit/Debit Card'}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="order-summary">
              <h4>Order Summary</h4>
              <ul>
                {cart.map(item => (
                  <li key={item.cartId}>
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
              <div className="order-total">
                <span>Total</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>

            <div className="form-actions">
              <button className="back-btn" onClick={() => setCheckoutStep('cart')}>Back to Cart</button>
              <button className="place-order-btn" onClick={handlePlaceOrder}>Place Order</button>
            </div>
          </div>
        )}

        {/* ✅ Order Confirmation */}
        {checkoutStep === 'confirmation' && (
          <div className="confirmation-section">
            <div className="confirmation-icon">✓</div>
            <h3>Order Confirmed!</h3>
            <p>Your order has been placed successfully.</p>
            <p>Estimated delivery time: 30-45 minutes</p>

            <div className="order-details">
              <h4>Order Summary</h4>
              <ul>
                {orderHistory[0]?.items.map(item => (
                  <li key={item.cartId}>
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
              <div className="order-total">
                <span>Total</span>
                <span>₹{orderHistory[0]?.total}</span>
              </div>
            </div>

            <button className="back-to-menu-btn" onClick={() => {
              setIsCartOpen(false);
              setCheckoutStep('cart');
            }}>
              Back to Menu
            </button>
          </div>
        )}
      </div>

      {cart.length > 0 && checkoutStep === 'cart' && (
        <button className="cart-toggle-btn" onClick={() => setIsCartOpen(!isCartOpen)}>
          🛒 {totalItems}
        </button>
      )}
    </div>
  );
}


















// import { useState, useEffect } from 'react';
// import './Menu.css';

// // Import food images (you'll need to add these to your project)

// const menuItems = [
//   { id: 101, name: 'Masala Dosa', price: 40, description: 'Crispy golden delight with spiced potato filling', image: "https://media.istockphoto.com/id/183321245/photo/south-indian-crepe-masala-dosa.jpg?s=612x612&w=0&k=20&c=c6Z7P5uovp2M9JVS0rlS8nCKRL73QkTYRyL7FK348Os=" },
//   { id: 102, name: 'Idli', price: 30, description: 'Soft steamed rice cakes with coconut chutney', image: "https://media.istockphoto.com/id/1024549454/photo/idly-sambar-or-idli-with-sambhar-and-green-red-chutney-popular-south-indian-breakfast.jpg?s=612x612&w=0&k=20&c=6BgjEFvHIfc4lEd0xEfFFSW3I8_aq-_xnKND996ZoVY=" },
//   { id: 103, name: 'Poha', price: 25, description: 'Fluffy flattened rice with peanuts and lemon', image: "https://media.istockphoto.com/id/1198052406/photo/poha-a-traditional-indian-breakfastac.jpg?s=612x612&w=0&k=20&c=lAg6L8Co_--s2Zu00kctvAqMj0qN3xGRDjIIDeBj1nM=" },
//   { id: 104, name: 'Samosa', price: 30, description: 'Crispy pastry stuffed with spicy potatoes', image: "https://media.istockphoto.com/id/1420058934/photo/vegetarian-aloo-samosa-or-samosas-indian-special-traditional-street-food-famous-indian.jpg?s=612x612&w=0&k=20&c=V1j34G9ckMGXzolpxERBXDVQn0TwIwY9TvV1DlfKOkI=" },
//   { id: 105, name: 'Maggie', price: 30, description: 'Comfort noodles with veggies in 2 minutes!', image: "https://media.istockphoto.com/id/831817536/photo/maggie-masala-noodles.jpg?s=612x612&w=0&k=20&c=DyyikWEWivdkxs9P_A5zvXvKcZsfpGcc5JB4aMHU6pM=" },
//   { id: 201, name: 'Thali', price: 80, description: 'Complete meal - 3 curries, rice, roti & dessert', image: "https://media.istockphoto.com/id/1173807289/photo/indian-food.jpg?s=612x612&w=0&k=20&c=1F-in5AuRPGd8-95r0r2DZAwP7Qf6KQrROHxINFXsxM=" },
//   { id: 202, name: 'Biryani', price: 90, description: 'Fragrant basmati rice with chicken/veggies', image: "https://media.istockphoto.com/id/1345624336/photo/chicken-biriyani.jpg?s=612x612&w=0&k=20&c=adU_N0P-1SKMQLZu5yu7aPknfLLgbViI8XILqLP92A4=" },
//   { id: 203, name: 'Paneer Fried Rice', price: 50, description: 'Chinese-style rice with juicy paneer cubes', image: "https://media.istockphoto.com/id/1292617686/photo/healthy-and-tasty-paneer-fried-rice-made-of-rice-mixed-veggies-and-paneer-served-in-bowl-over.jpg?s=612x612&w=0&k=20&c=frc5aSMeFo4zjjP8fo497lhKJBr6VWxyByFAHqPjpj4=" },
//   { id: 204, name: 'Paneer Chilli', price: 70, description: 'Spicy-sweet paneer with crispy peppers', image: "https://media.istockphoto.com/id/1460543157/photo/fry-pepper-paneer.jpg?s=612x612&w=0&k=20&c=8KbCi8tlHEmvV0fDQmjS-6Y4tSYECPEsmKIfZNr9oEA=" },
//   { id: 301, name: 'Chai', price: 5, description: 'Kadak masala chai to fuel your studies', image: "https://media.istockphoto.com/id/1482828620/photo/clay-tea-cup-being-hold-in-the-hand.jpg?s=612x612&w=0&k=20&c=zULj4iZBUdV4TjzeYQLBr3QGD_1lPRuGtnD1i57p-A8=" },
//   { id: 302, name: 'Coffee', price: 10, description: 'Strong brew to keep you awake in lectures', image: "https://media.istockphoto.com/id/1400194993/photo/cappuccino-art.jpg?s=612x612&w=0&k=20&c=_nYOcyQ15cYEeUYgUzkC5qG946nkCwU06NiWKt1s8SE=" },
//   { id: 303, name: 'Coca Cola', price: 15, description: 'Ice-cold fizz for instant refreshment', image: "https://media.istockphoto.com/id/458297599/photo/coke-bottle-and-glass.jpg?s=612x612&w=0&k=20&c=chNsWLeR3CVaRWNgCDgVtLuL3N2BOULQySh9MCl2PX0=" },
//   { id: 304, name: 'Chowmein', price: 40, description: 'Street-style noodles with crunchy veggies', image: "https://media.istockphoto.com/id/2157098939/photo/chinese-chicken-chow-mein-in-a-bowl-with-chopsticks-high-angle-photo.jpg?s=612x612&w=0&k=20&c=irHY1-P-BclmTffBL-0Rb9JaPljZZevNSNvH1we5BvQ=" },
//   { id: 305, name: 'Hakka Noodles', price: 50, description: 'Spicy schezwan noodles with Indo-Chinese twist', image: "https://media.istockphoto.com/id/1158749219/photo/schezwan-noodles-with-vegetables-in-a-plate-on-a-green-table-top-view-hakka-noodles-is-a.jpg?s=612x612&w=0&k=20&c=O0MyUfudXX01rvBYgYE4SSDBzoGFN7oqxVkzHXf-TIY=" }
// ];

// export default function Menu() {
//   const [cart, setCart] = useState([]);
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart', 'payment', 'confirmation'
//   const [paymentMethod, setPaymentMethod] = useState('cash');
//   const [orderHistory, setOrderHistory] = useState([]);
//   const [allfoodItems, setAllFoodItems] = useState([]);


//   const loadAllFoodItems = async () => {
//     try {
//       const response = fetch(`api/v1/menu`, {
//         method: 'GET'
//       });
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to load food Items")
//       }

//       if (!data) {
//         console.log("data couldn't be fetched")
//       }
//       console.log(data);

//       setAllFoodItems(data.foods)
//       console.log("Fetched foods: ", data.foods);
//     } catch (error) {
//       console.error("Fetch error:", err);
//     }
//   }

//   useEffect(() => {
//     loadAllFoodItems();
//   }, []);

//   const user = {
//     name: "John Doe",
//     phone: "9876543210",
//     address: "123 College Hostel, University Campus",
//   };

//   const addToCart = (item) => {
//     const existingItem = cart.find(cartItem => cartItem.id === item.id);

//     if (existingItem) {
//       setCart(cart.map(cartItem =>
//         cartItem.id === item.id
//           ? { ...cartItem, quantity: cartItem.quantity + 1 }
//           : cartItem
//       ));
//     } else {
//       setCart([...cart, { ...item, quantity: 1, cartId: Date.now() }]);
//     }
//     setIsCartOpen(true);
//   };

//   const removeFromCart = (cartId) => {
//     setCart(cart.filter(item => item.cartId !== cartId));
//   };

//   const adjustQuantity = (cartId, amount) => {
//     setCart(cart.map(item => {
//       if (item.cartId === cartId) {
//         const newQuantity = item.quantity + amount;
//         return {
//           ...item,
//           quantity: newQuantity > 0 ? newQuantity : 1
//         };
//       }
//       return item;
//     }));
//   };

//   const handleCheckout = () => {
//     if (cart.length === 0) {
//       alert('Your cart is empty!');
//       return;
//     }
//     setCheckoutStep('payment');
//   };

//   const handlePlaceOrder = () => {
//     // In a real app, you would send this to your backend
//     const order = {
//       id: Date.now(),
//       items: [...cart],
//       total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
//       user: { ...user },
//       paymentMethod,
//       date: new Date().toISOString(),
//       status: 'Preparing'
//     };

//     // Add to order history (simulating backend update)
//     setOrderHistory([order, ...orderHistory]);

//     // Clear cart and show confirmation
//     setCart([]);
//     setCheckoutStep('confirmation');
//   };

//   useEffect(() => {
//     const observer = new IntersectionObserver((entries) => {
//       entries.forEach(entry => {
//         if (entry.isIntersecting) {
//           entry.target.classList.add('in-view');
//         } else {
//           entry.target.classList.remove('in-view');
//         }
//       });
//     }, {
//       threshold: 0.1,
//       rootMargin: '0px 0px -100px 0px' // Adjust this value as needed
//     });

//     const menuItems = document.querySelectorAll('.menu-item');
//     menuItems.forEach((item, index) => {
//       item.style.setProperty('--index', index);
//       observer.observe(item);
//     });

//     return () => {
//       menuItems.forEach(item => observer.unobserve(item));
//       observer.disconnect();
//     };
//   }, [menuItems]); // Add menuItems as dependency

//   const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
//   const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

//   return (
//     <div className="menu-page">
//       <div className="menu-header">
//         <h1>Student Specials</h1>
//         <p>Budget-friendly meals that taste like home</p>
//       </div>

//       <div className="menu-container">
//         <div className="menu-items">
//           {menuItems.map(item => (
//             <div key={item.id} className="menu-item">
//               <div className="item-image">
//                 <img src={item.image} alt={item.name} />
//               </div>
//               <div className="item-details">
//                 <h3>{item.name}</h3>
//                 <p className="item-description">{item.description}</p>
//                 <p className="item-price">₹{item.price}</p>
//               </div>
//               <div className="item-actions">
//                 <button
//                   className="add-to-cart-btn"
//                   onClick={() => addToCart(item)}
//                 >
//                   Add +
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Cart Preview */}
//       <div className={`cart-preview ${isCartOpen ? 'active' : ''}`}>
//         <button className="close-cart" onClick={() => {
//           setIsCartOpen(false);
//           if (checkoutStep !== 'cart') setCheckoutStep('cart');
//         }}>×</button>

//         {checkoutStep === 'cart' && (
//           <>
//             <h3>Your Cart ({totalItems})</h3>
//             <ul className="cart-items">
//               {cart.map(item => (
//                 <li key={item.cartId}>
//                   <div className="cart-item-info">
//                     <span>{item.name} (₹{item.price})</span>
//                     <div className="quantity-controls">
//                       <button onClick={() => adjustQuantity(item.cartId, -1)}>-</button>
//                       <span>{item.quantity}</span>
//                       <button onClick={() => adjustQuantity(item.cartId, 1)}>+</button>
//                     </div>
//                   </div>
//                   <div className="cart-item-subtotal">
//                     ₹{item.price * item.quantity}
//                   </div>
//                   <button
//                     className="remove-btn"
//                     onClick={() => removeFromCart(item.cartId)}
//                   >
//                     ×
//                   </button>
//                 </li>
//               ))}
//             </ul>
//             <div className="cart-total">
//               Total: ₹{totalAmount}
//             </div>
//             <button className="checkout-btn" onClick={handleCheckout}>
//               Proceed to Payment
//             </button>
//           </>
//         )}

//         {/* Payment Options */}
//         {checkoutStep === 'payment' && (
//           <div className="payment-section">
//             <h3>Complete Your Order</h3>

//             <div className="user-details-summary">
//               <h4>Delivery To</h4>
//               <p><strong>Name:</strong> {user.name}</p>
//               <p><strong>Phone:</strong> {user.phone}</p>
//               <p><strong>Address:</strong> {user.address}</p>
//             </div>

//             <div className="payment-options">
//               <h4>Payment Method</h4>
//               <label className="payment-option">
//                 <input
//                   type="radio"
//                   name="paymentMethod"
//                   value="cash"
//                   checked={paymentMethod === 'cash'}
//                   onChange={() => setPaymentMethod('cash')}
//                 />
//                 <div className="payment-content">
//                   <span>Cash on Delivery</span>
//                 </div>
//               </label>

//               <label className="payment-option">
//                 <input
//                   type="radio"
//                   name="paymentMethod"
//                   value="upi"
//                   checked={paymentMethod === 'upi'}
//                   onChange={() => setPaymentMethod('upi')}
//                 />
//                 <div className="payment-content">
//                   <span>UPI Payment</span>
//                 </div>
//               </label>

//               <label className="payment-option">
//                 <input
//                   type="radio"
//                   name="paymentMethod"
//                   value="card"
//                   checked={paymentMethod === 'card'}
//                   onChange={() => setPaymentMethod('card')}
//                 />
//                 <div className="payment-content">
//                   <span>Credit/Debit Card</span>
//                 </div>
//               </label>
//             </div>

//             <div className="order-summary">
//               <h4>Order Summary</h4>
//               <ul>
//                 {cart.map(item => (
//                   <li key={item.cartId}>
//                     <span>{item.name} × {item.quantity}</span>
//                     <span>₹{item.price * item.quantity}</span>
//                   </li>
//                 ))}
//               </ul>
//               <div className="order-total">
//                 <span>Total</span>
//                 <span>₹{totalAmount}</span>
//               </div>
//             </div>

//             <div className="form-actions">
//               <button
//                 type="button"
//                 className="back-btn"
//                 onClick={() => setCheckoutStep('cart')}
//               >
//                 Back to Cart
//               </button>
//               <button
//                 type="button"
//                 className="place-order-btn"
//                 onClick={handlePlaceOrder}
//               >
//                 Place Order
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Order Confirmation */}
//         {checkoutStep === 'confirmation' && (
//           <div className="confirmation-section">
//             <div className="confirmation-icon">✓</div>
//             <h3>Order Confirmed!</h3>
//             <p>Your order has been placed successfully.</p>
//             <p>Estimated delivery time: 30-45 minutes</p>

//             <div className="order-details">
//               <h4>Order Summary</h4>
//               <ul>
//                 {orderHistory[0]?.items.map(item => (
//                   <li key={item.cartId}>
//                     <span>{item.name} × {item.quantity}</span>
//                     <span>₹{item.price * item.quantity}</span>
//                   </li>
//                 ))}
//               </ul>
//               <div className="order-total">
//                 <span>Total</span>
//                 <span>₹{orderHistory[0]?.total}</span>
//               </div>
//             </div>

//             <button
//               className="back-to-menu-btn"
//               onClick={() => {
//                 setIsCartOpen(false);
//                 setCheckoutStep('cart');
//               }}
//             >
//               Back to Menu
//             </button>
//           </div>
//         )}
//       </div>

//       {cart.length > 0 && checkoutStep === 'cart' && (
//         <button
//           className="cart-toggle-btn"
//           onClick={() => setIsCartOpen(!isCartOpen)}
//         >
//           🛒 {totalItems}
//         </button>
//       )}
//     </div>
//   );
// }