import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import './Menu.css';

export default function Menu() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [orderHistory, setOrderHistory] = useState([]);
  const [currentOrders, setCurrentOrders] = useState([]);
  const [allfoodItems, setAllFoodItems] = useState([]);
  const [user, setUser] = useState(null);
  const [isCurrentOrdersOpen, setIsCurrentOrdersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedCanteen, setSelectedCanteen] = useState('');
  const [availableCanteens, setAvailableCanteens] = useState([]);

  const loadAllFoodItems = async () => {
    try {
      const response = await fetch(`/api/v1/foods/`, {
        method: 'GET'
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load food Items");
      }

      if (!data) {
        console.log("data couldn't be fetched");
      }

      setAllFoodItems(data.foodMenu.map(item => ({
        ...item,
        isActive: true // Override backend's isActive status
      })));
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load menu items");
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch('api/v1/users/get-user', {
        method: 'GET',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error("Error fetching user data:", error.message);
    }
  }

  const fetchCollegeCanteens = async () => {
    try {
      const response = await fetch('api/v1/colleges/get-college-canteens', {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error("Failed to fetch college canteens");
      }

      const data = await response.json();
      setAvailableCanteens(data.canteens || []);
    } catch (error) {
      console.error("Error fetching canteens:", error.message);
    }
  }

  const fetchCanteenMenu = async (adminId) => {
    try {
      if (!adminId) return;

      const response = await fetch(`api/v1/foods/canteens-menu/${adminId}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error("Failed to fetch canteens menu");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error fetching canteen menu:", error.message);
      throw error;
    }
  }

  const handleCanteenSelect = async (e) => {
    const selectedCanteenId = e.target.value;
    setSelectedCanteen(selectedCanteenId);

    try {
      if (selectedCanteenId) {
        const menuData = await fetchCanteenMenu(selectedCanteenId);
        setAllFoodItems(menuData.foodslist || []);
      } else {
        await loadAllFoodItems();
      }
    } catch (error) {
      toast.error(`Failed to load menu: ${error.message}`);
    }
  };

  const filteredFoodItems = selectedCanteen
  ? allfoodItems.filter(item => 
      String(item.adminId?._id || item.adminId) === String(selectedCanteen) && 
      (selectedCanteen ? item.isActive : true) // Only filter by isActive for specific canteen
    )
  : allfoodItems;

  useEffect(() => {
    loadAllFoodItems();
    fetchUser();
    fetchCollegeCanteens();
  }, []);

  const fetchSingleFoodItem = async (foodId) => {
    try {
      setIsSearching(true);
      const response = await fetch(`/api/v1/foods/${foodId}`, {
        method: 'GET',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch food item");
      }

      return data.Food;
    } catch (error) {
      console.error("Error fetching food item:", error);
      throw error;
    } finally {
      setIsSearching(false);
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError('');

    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const isIdSearch = /^[0-9a-fA-F]{24}$/.test(searchTerm.trim());

    try {
      if (isIdSearch) {
        const foodItem = await fetchSingleFoodItem(searchTerm.trim());
        setSearchResults(foodItem ? [foodItem] : []);
      } else {
        const results = filteredFoodItems.filter(item =>
          item.foodName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(results);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchError("Error searching for food items");
    }
  }

  const addToCart = (item) => {
    if (!item.isActive) {
      toast.error(`${item.foodName} is currently unavailable`);
      return;
    }

    const existingItem = cart.find(cartItem => cartItem._id === item._id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem._id === item._id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, {
        ...item,
        quantity: 1,
        cartId: Date.now(),
        name: item.foodName,
        price: item.foodPrice
      }]);
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
      toast.error('Your cart is empty!');
      return;
    }
    setCheckoutStep('payment');
  };

  const handlePlaceOrder = async () => {
    if (!selectedCanteen) {
      toast.error('Please select a canteen before placing your order');
      return;
    }

    const unavailableItems = cart.filter(item => !item.isActive);
    if (unavailableItems.length > 0) {
      toast.error(`Some items in your cart are no longer available: ${unavailableItems.map(i => i.foodName).join(', ')}`);
      return;
    }

    const userId = localStorage.getItem('userId');

    try {
      const response = await fetch(`api/v1/orders/admins/${selectedCanteen}/place-order`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          foodItems: cart.map(item => ({
            foodId: item._id,
            foodQuantity: item.quantity
          }))
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to place Order");
      }

      const newOrder = {
        id: Date.now(),
        items: [...cart],
        total: totalAmount,
        user: user ? { ...user } : null,
        paymentMethod,
        date: new Date().toISOString(),
        status: 'Preparing'
      };

      setCurrentOrders([newOrder, ...currentOrders]);
      setOrderHistory([newOrder, ...orderHistory]);
      setCart([]);
      setCheckoutStep('confirmation');
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error("Error in Placing order", error);
      toast.error(error.message || "Failed to place order");
    }
  }

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
  const currentOrdersCount = currentOrders.length;

  const renderMenuItems = (items) => {
    return items.map(item => (
      <div key={item._id} className={`menu-item ${selectedCanteen && !item.isActive ? 'unavailable' : ''}`}>
        <div className="item-image">
          <img src={item.foodImage} alt={item.foodName} />
          {selectedCanteen && !item.isActive && (
            <div className="unavailable-banner">
              Currently Unavailable
            </div>
          )}
        </div>
        <div className="item-details">
          <h3>{item.foodName}</h3>
          <p className="item-description">{item.foodDescription}</p>
          <p className="item-price">₹{item.foodPrice}</p>
          <p className="item-category">{item.foodCategory}</p>
          <div className="availability-status">
            {item.isActive ? (
              <span className="available">Available</span>
            ) : (
              <span className="unavailable">Unavailable</span>
            )}
          </div>
        </div>
        <div className="item-actions">
          <button
            className={`add-to-cart-btn ${!item.isActive ? 'disabled' : ''}`}
            onClick={() => addToCart(item)}
            disabled={!item.isActive}
          >
            {item.isActive ? 'Add +' : 'Unavailable'}
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="menu-page">
      <div className="menu-header">
        <h1>Student Specials</h1>
        <p>Budget-friendly meals that taste like home</p>
      </div>

      <div className="search-container">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by food name or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSearchError('');
              if (e.target.value.trim() === '') {
                setSearchResults([]);
              }
            }}
            className="search-input"
          />
          <button type="submit" className="search-button" disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {searchError && (
          <div className="search-error-message animate__animated animate__shakeX">
            {searchError}
          </div>
        )}
      </div>

      <div className="filter-container">
        <label htmlFor="canteen-filter">Select canteen to view its menu:</label>
        <select
          id="canteen-filter"
          value={selectedCanteen}
          onChange={handleCanteenSelect}
          className="canteen-filter-dropdown"
        >
          <option value="">All Canteens (Show everything)</option>
          {availableCanteens.map(canteen => (
            <option key={canteen.id} value={canteen.id}>
              {canteen.name}
            </option>
          ))}
        </select>
      </div>

      {searchResults.length > 0 && (
        <div className="search-results-section">
          <h3>Search Results</h3>
          <div className="menu-items">
            {renderMenuItems(searchResults)}
          </div>
        </div>
      )}

      <div className="menu-container">
        <div className="menu-items">
          {Array.isArray(filteredFoodItems) && filteredFoodItems.length > 0 ? (
            renderMenuItems(filteredFoodItems)
          ) : (
            <p className="no-items-message">
              {selectedCanteen
                ? "No active food items available from this canteen"
                : "No items found"}
            </p>
          )}
        </div>
      </div>

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
                    <span>{item.foodName} (₹{item.foodPrice})</span>
                    {!item.isActive && (
                      <div className="cart-item-unavailable">
                        This item is no longer available
                      </div>
                    )}
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

        {checkoutStep === 'payment' && (
          <div className="payment-section">
            <h3>Complete Your Order</h3>
            <div className="user-details-summary">
              <h4>Delivery To</h4>
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Phone:</strong> {user?.contact}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>College:</strong> {user?.college}</p>
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

      <div className={`current-orders-preview ${isCurrentOrdersOpen ? 'active' : ''}`}>
        <button className="close-current-orders" onClick={() => setIsCurrentOrdersOpen(false)}>
          ×
        </button>

        <h3>Your Current Orders ({currentOrdersCount})</h3>

        {currentOrders.length > 0 ? (
          <ul className="current-orders-list">
            {currentOrders.map(order => (
              <li key={order.id} className="current-order-item">
                <div className="order-header">
                  <span>Order #{order.id.toString().slice(-4)}</span>
                  <span className={`status ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
                <div className="order-details">
                  <ul>
                    {order.items.map(item => (
                      <li key={item.cartId}>
                        {item.name} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                  <div className="order-total">
                    Total: ₹{order.total}
                  </div>
                </div>
                <div className="order-footer">
                  <span>{new Date(order.date).toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-orders">You have no current orders</p>
        )}
      </div>

      {cart.length > 0 && checkoutStep === 'cart' && (
        <button className="cart-toggle-btn" onClick={() => setIsCartOpen(!isCartOpen)}>
          🛒 {totalItems}
        </button>
      )}

      <button
        className={`current-orders-toggle-btn ${currentOrdersCount > 0 ? 'has-orders' : ''}`}
        onClick={() => setIsCurrentOrdersOpen(!isCurrentOrdersOpen)}
      >
        {currentOrdersCount > 0 ? (
          <span className="orders-count">{currentOrdersCount}</span>
        ) : null}
        📝 Orders
      </button>
    </div>
  );
}





















// import { useState, useEffect } from 'react';
// import './Menu.css';

// export default function Menu() {
//   const [cart, setCart] = useState([]);
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const [checkoutStep, setCheckoutStep] = useState('cart');
//   const [paymentMethod, setPaymentMethod] = useState('cash');
//   const [orderHistory, setOrderHistory] = useState([]);
//   const [currentOrders, setCurrentOrders] = useState([]);
//   const [allfoodItems, setAllFoodItems] = useState([]);
//   const [user, setUser] = useState(null);
//   const [isCurrentOrdersOpen, setIsCurrentOrdersOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [isSearching, setIsSearching] = useState(false);
//   const [searchError, setSearchError] = useState('');
//   const [selectedCanteen, setSelectedCanteen] = useState('');
//   const [availableCanteens, setAvailableCanteens] = useState([]);

//   const loadAllFoodItems = async () => {
//     try {
//       const response = await fetch(`/api/v1/foods/`, {
//         method: 'GET'
//       });

//       const data = await response.json();
//       console.log(data);
//       if (!response.ok) {
//         throw new Error(data.message || "Failed to load food Items");
//       }

//       if (!data) {
//         console.log("data couldn't be fetched");
//       }

//       console.log("Fetched foods: ", data.foodMenu);
//       setAllFoodItems(data.foodMenu);
//     } catch (error) {
//       console.error("Fetch error:", error);
//     }
//   };


//   const fetchUser = async () => {
//     try {
//       const response = await fetch('api/v1/users/get-user', {
//         method: 'GET',
//         credentials: 'include'
//       });
//       if (!response.ok) {
//         throw new Error("Failed to fetch user data");
//       }
//       const data = await response.json();
//       if (!data) {
//         console.log("Error in fetching the userData : ", data.message);
//       }

//       console.log("User data fetched successfully:", data.user);

//       setUser(data.user);

//     } catch (error) {
//       console.error("Error fetching user data:", error.message);

//     }
//   }


//   const fetchCollegeCanteens = async () => {
//     try {
//       const response = await fetch('api/v1/colleges/get-college-canteens', {
//         method: 'GET',
//         credentials: 'include',
//       })

//       if (!response.ok) {
//         throw new Error("Failed to fetch college canteens");
//       }

//       const data = await response.json();

//       if (!data) {
//         console.log("Error in fetching canteen Colleges : ", data.message);
//       }
//       console.log("All college canteens : ", data)
//       setAvailableCanteens(data.canteens || []);


//     } catch (error) {
//       console.error("Error fetching user data:", error.message);

//     }
//   }

//   const fetchCanteenMenu = async (adminId) => {
//     try {
//       if (!adminId) {
//         console.log("No adminId provided, skipping fetch");
//         // return;
//       }

//       const response = await fetch(`api/v1/foods/canteens-menu/${adminId}`, {
//         method: 'GET',
//         credentials: 'include'
//       });

//       if (!response.ok) {
//         throw new Error("Failed to fetch canteens menu");
//       }

//       const data = await response.json();
//       if (!data) {
//         console.log("Error in getting datas of canteens menu : ", data.error);
//       }
//       console.log("Canteen menu data : ", data);
//       return data;

//     } catch (error) {
//       console.log("Catch Error in fetching cateens menu : ", error.message)
//       throw error;
//     }
//   }

//   // New handler for canteen selection
//   const handleCanteenSelect = async (e) => {
//     const selectedCanteenId = e.target.value;
//     setSelectedCanteen(selectedCanteenId);

//     try {
//       if (selectedCanteenId) {
//         const menuData = await fetchCanteenMenu(selectedCanteenId);
//         setAllFoodItems(menuData.foodslist || []);
//       } else {
//         // If "All Canteens" selected, load all food items
//         await loadAllFoodItems();
//       }
//     } catch (error) {

//       console.log('Error : ', `Failed to load menu: ${error.message}`);
//     }
//   };
//   const filteredFoodItems = selectedCanteen
//     ? allfoodItems.filter(item =>
//       String(item.adminId?._id || item.adminId) === String(selectedCanteen)
//     )
//     : allfoodItems;


//   console.log("Selected Canteen:", selectedCanteen);
//   console.log("All Food Items:", allfoodItems);
//   console.log("Filtered Items:", filteredFoodItems);



//   useEffect(() => {
//     loadAllFoodItems();
//     fetchUser();
//     fetchCollegeCanteens();
//     // fetchCanteenMenu();
//   }, []);


//   const fetchSingleFoodItem = async (foodId) => {

//     console.log("Fetching food item with ID:", foodId);
//     try {
//       setIsSearching(true);
//       const response = await fetch(`/api/v1/foods/${foodId}`, {
//         method: 'GET',
//         // credentials: 'include'
//       });

//       const data = await response.json();
//       console.log("Single food item data: ", data);

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to fetch food item");
//       }

//       if (!data) {
//         console.log("data couldn't be fetched");
//       }

//       console.log("Fetched food item: ", data.food);
//       return data.Food;

//     } catch (error) {
//       console.error("Error fetching food item:", error);

//     } finally {
//       setIsSearching(false);
//     }
//   }

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     setSearchError('');

//     if (!searchTerm.trim()) {
//       setSearchResults([]);
//       return;
//     }

//     const isIdSearch = /^[0-9a-fA-F]{24}$/.test(searchTerm.trim());

//     try {
//       if (isIdSearch) {
//         const foodItem = await fetchSingleFoodItem(searchTerm.trim());
//         setSearchResults(foodItem ? [foodItem] : []);
//       } else {
//         const results = filteredFoodItems.filter(item =>
//           item.foodName.toLowerCase().includes(searchTerm.toLowerCase())
//         );
//         setSearchResults(results);
//       }
//     } catch (error) {
//       console.error("Search error:", error);
//       setSearchError("Error searching for food items");
//     }
//   }

//   const addToCart = (item) => {
//     const existingItem = cart.find(cartItem => cartItem._id === item._id);
//     if (existingItem) {
//       setCart(cart.map(cartItem =>
//         cartItem._id === item._id
//           ? { ...cartItem, quantity: cartItem.quantity + 1 }
//           : cartItem
//       ));
//     } else {
//       setCart([...cart, {
//         ...item,
//         quantity: 1,
//         cartId: Date.now(),
//         name: item.foodName,
//         price: item.foodPrice
//       }]);
//     }
//     setIsCartOpen(true);
//   };
//   // const addToCart = (item) => {
//   //   const normalizedItem = {
//   //     ...item,
//   //     name: item.foodName,
//   //     price: item.foodPrice
//   //   };

//   //   const existingItem = cart.find(cartItem => cartItem._id === item._id);
//   //   if (existingItem) {
//   //     setCart(cart.map(cartItem =>
//   //       cartItem._id === item._id
//   //         ? { ...cartItem, quantity: cartItem.quantity + 1 }
//   //         : cartItem
//   //     ));
//   //   } else {
//   //     setCart([...cart, { ...normalizedItem, quantity: 1, cartId: Date.now() }]);
//   //   }
//   //   setIsCartOpen(true);
//   // };


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

//   const handlePlaceOrder = async () => {

//     if (!selectedCanteen) {
//       alert('Please select a canteen before placing your order');
//       return;
//     }

//     const userId = localStorage.getItem('userId')

//     try {

//       const response = await fetch(`api/v1/orders/admins/${selectedCanteen}/place-order`, {
//         method: 'POST',
//         credentials: 'include',

//         headers: {
//           "Content-Type": "application/json",
//         },

//         body: JSON.stringify({
//           userId: userId,
//           foodItems: cart.map(item => ({
//             foodId: item._id,
//             foodQuantity: item.quantity
//           }))

//         })
//       })

//       console.log("Order Placing reponse : ", response);

//       const data = await response.json();
//       if (!data) {
//         throw new Error("Unable to fetch data")
//       }
//       console.log("data : ", data);

//       const newOrder = {
//         id: Date.now(),
//         items: [...cart],
//         total: totalAmount,
//         user: user ? { ...user } : null,
//         paymentMethod,
//         date: new Date().toISOString(),
//         status: 'Preparing'
//       };

//       setCurrentOrders([newOrder, ...currentOrders]);
//       setOrderHistory([newOrder, ...orderHistory]);
//       setCart([]);
//       setCheckoutStep('confirmation');

//       if (!response.ok) {
//         throw new Error(data.message || "Unable to place Order");
//       }

//     } catch (error) {
//       console.error("Error in Placing order", error);
//     };

//   }
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
//       rootMargin: '0px 0px -100px 0px'
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
//   }, [allfoodItems]);

//   const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
//   const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//   const currentOrdersCount = currentOrders.length;


//   return (
//     <div className="menu-page">
//       <div className="menu-header">
//         <h1>Student Specials</h1>
//         <p>Budget-friendly meals that taste like home</p>
//       </div>

//       <div className="search-container">
//         <form onSubmit={handleSearch}>
//           <input
//             type="text"
//             placeholder="Search by food name or ID..."
//             value={searchTerm}
//             onChange={(e) => {
//               setSearchTerm(e.target.value);
//               setSearchError('');
//               if (e.target.value.trim() === '') {
//                 setSearchResults([]);
//               }
//             }}
//             className="search-input"
//           />
//           <button type="submit" className="search-button" disabled={isSearching}>
//             {isSearching ? 'Searching...' : 'Search'}
//           </button>
//         </form>

//         {searchError && (
//           <div className="search-error-message animate__animated animate__shakeX">
//             {searchError}
//           </div>
//         )}
//       </div>

//       {/* Canteen Filter Dropdown */}
//       <div className="filter-container">
//         <label htmlFor="canteen-filter">Select canteen to view its menu:</label>
//         <select
//           id="canteen-filter"
//           value={selectedCanteen}
//           onChange={handleCanteenSelect}
//           className="canteen-filter-dropdown"
//         >
//           <option value="">All Canteens (Show everything)</option>
//           {availableCanteens.map(canteen => (
//             <option key={canteen.id} value={canteen.id}>
//               {canteen.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Show search results if they exist */}
//       {searchResults.length > 0 && (
//         <div className="search-results-section">
//           <h3>Search Results</h3>
//           <div className="menu-items">
//             {searchResults.map(item => (
//               <div key={item._id} className="menu-item">
//                 <div className="item-image">
//                   <img src={item.foodImage} alt={item.foodName} />
//                 </div>
//                 <div className="item-details">
//                   <h3>{item.foodName}</h3>
//                   <p className="item-description">{item.foodDescription}</p>
//                   <p className="item-price">₹{item.foodPrice}</p>
//                   <p className="item-category">{item.foodCategory}</p>
//                 </div>
//                 <div className="item-actions">
//                   <button className="add-to-cart-btn" onClick={() => addToCart(item)}>
//                     Add +
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Main Menu Items */}

//       <div className="menu-container">
//         <div className="menu-items">
//           {Array.isArray(filteredFoodItems) && filteredFoodItems.length > 0 ? (
//             filteredFoodItems.map(item => (
//               <div key={item._id} className="menu-item">
//                 <div className="item-image">
//                   <img src={item.foodImage} alt={item.foodName} />
//                 </div>
//                 <div className="item-details">
//                   <h3>{item.foodName}</h3>
//                   <p className="item-description">{item.foodDescription}</p>
//                   <p className="item-price">₹{item.foodPrice}</p>
//                   <p className="item-category">{item.foodCategory}</p>
//                 </div>
//                 <div className="item-actions">
//                   <button className="add-to-cart-btn" onClick={() => addToCart(item)}>
//                     Add +
//                   </button>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p className="no-items-message">
//               {selectedCanteen
//                 ? "No active food items available from this canteen"
//                 : "No items found"}
//             </p>
//           )}
//         </div>
//       </div>

//       {/* {Array.isArray(allFoodItems) ? (
//         allFoodItems.map((item) => (
//           <div key={item._id} className="menu-item">
//             <h3>{item.name}</h3>
//             <p>{item.description}</p>
//             <p>₹{item.price}</p>
//           </div>
//         ))
//       ) : (
//         <p>No items found.</p>
//       )} */}

//       {/* 🛒 Cart Preview */}
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
//                     <span>{item.foodName} (₹{item.foodPrice})</span>
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

//         {/* 💳 Payment Section */}
//         {checkoutStep === 'payment' && (
//           <div className="payment-section">
//             <h3>Complete Your Order</h3>
//             <div className="user-details-summary">
//               <h4>Delivery To</h4>
//               <p><strong>Name:</strong> {user.name}</p>
//               <p><strong>Phone:</strong> {user.contact}</p>
//               <p><strong>Email:</strong> {user.email}</p>
//               <p><strong>College:</strong> {user.college}</p>
//             </div>

//             <div className="payment-options">
//               <h4>Payment Method</h4>
//               {['cash', 'upi', 'card'].map(method => (
//                 <label key={method} className="payment-option">
//                   <input
//                     type="radio"
//                     name="paymentMethod"
//                     value={method}
//                     checked={paymentMethod === method}
//                     onChange={() => setPaymentMethod(method)}
//                   />
//                   <div className="payment-content">
//                     <span>{method === 'cash' ? 'Cash on Delivery' : method === 'upi' ? 'UPI Payment' : 'Credit/Debit Card'}</span>
//                   </div>
//                 </label>
//               ))}
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
//               <button className="back-btn" onClick={() => setCheckoutStep('cart')}>Back to Cart</button>
//               <button className="place-order-btn" onClick={handlePlaceOrder}>Place Order</button>
//             </div>
//           </div>
//         )}

//         {/* ✅ Order Confirmation */}
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

//             <button className="back-to-menu-btn" onClick={() => {
//               setIsCartOpen(false);
//               setCheckoutStep('cart');
//             }}>
//               Back to Menu
//             </button>
//           </div>
//         )}
//       </div>

//       {/* {cart.length > 0 && checkoutStep === 'cart' && (
//           <button className="cart-toggle-btn" onClick={() => setIsCartOpen(!isCartOpen)}>
//             🛒 {totalItems}
//           </button>
//         )} */}

//       <div className={`current-orders-preview ${isCurrentOrdersOpen ? 'active' : ''}`}>
//         <button className="close-current-orders" onClick={() => setIsCurrentOrdersOpen(false)}>
//           ×
//         </button>

//         <h3>Your Current Orders ({currentOrdersCount})</h3>

//         {currentOrders.length > 0 ? (
//           <ul className="current-orders-list">
//             {currentOrders.map(order => (
//               <li key={order.id} className="current-order-item">
//                 <div className="order-header">
//                   <span>Order #{order.id.toString().slice(-4)}</span>
//                   <span className={`status ${order.status.toLowerCase()}`}>
//                     {order.status}
//                   </span>
//                 </div>
//                 <div className="order-details">
//                   <ul>
//                     {order.items.map(item => (
//                       <li key={item.cartId}>
//                         {item.name} × {item.quantity}
//                       </li>
//                     ))}
//                   </ul>
//                   <div className="order-total">
//                     Total: ₹{order.total}
//                   </div>
//                 </div>
//                 <div className="order-footer">
//                   <span>{new Date(order.date).toLocaleString()}</span>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p className="no-orders">You have no current orders</p>
//         )}
//       </div>

//       {/* Cart Toggle Button */}
//       {cart.length > 0 && checkoutStep === 'cart' && (
//         <button className="cart-toggle-btn" onClick={() => setIsCartOpen(!isCartOpen)}>
//           🛒 {totalItems}
//         </button>
//       )}

//       {/* Current Orders Toggle Button */}
//       <button
//         className={`current-orders-toggle-btn ${currentOrdersCount > 0 ? 'has-orders' : ''}`}
//         onClick={() => setIsCurrentOrdersOpen(!isCurrentOrdersOpen)}
//       >
//         {currentOrdersCount > 0 ? (
//           <span className="orders-count">{currentOrdersCount}</span>
//         ) : null}
//         📝 Orders
//       </button>
//     </div>
//   );
// }


















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
