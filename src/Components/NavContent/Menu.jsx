import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import './Menu.css';
// import thumbsDownAnimation from '../../assets/thumbs_down.json'
import noFoodAnimation from '../../assets/NoFoods.json'
import { Player } from '@lottiefiles/react-lottie-player';


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
  const [isLoading, setIsLoading] = useState(true);
  const [totalFoodCount, setTotalFoodCount] = useState(0);

  const loadAllFoodItems = async () => {
    try {
      // const response = await fetch(`http://localhost:5000/api/v1/foods/`, {
      const response = await fetch(`https://canteen-order-backend.onrender.com/api/v1/foods/`, {
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
      // console.log("allfoodItems via load all foods =====================: ",allfoodItems)
      console.log("data.foodMenu.length  : ", data.foodMenu.length);
      setTotalFoodCount(data.foodMenu.length);
      console.log("totalFoodCount : ", totalFoodCount);

    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load menu items");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUser = async () => {

    const userToken = localStorage.getItem('userToken');
    console.log("userToken via fetchCollegeCanteens : ", userToken);

    try {
      // const response = await fetch('http://localhost:5000/api/v1/users/get-user', {
      const response = await fetch('https://canteen-order-backend.onrender.com/api/v1/users/get-user', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const data = await response.json();
      if (!data) {
        console.log("Error in fethcing user data : ", data.message);
      }
      console.log(" data data via fetchUser : ", data);
      setUser(data.user);

    } catch (error) {
      console.error("Error fetching user data:", error.message);
    }
  }

  const fetchCollegeCanteens = async () => {
    const userToken = localStorage.getItem('userToken');
    console.log("userToken via fetchCollegeCanteens : ", userToken);

    try {
      // const response = await fetch('http://localhost:5000/api/v1/colleges/get-college-canteens', {
      const response = await fetch('https://canteen-order-backend.onrender.com/api/v1/colleges/get-college-canteens', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      })


      const data = await response.json();
      if (!response.ok) {
        throw new Error("Failed to fetch college canteens : ", data.message);
      }
      if (!data) {
        console.log("Error in fetching the college-canteens data  : ", data.message);
      }
      console.log("college canteens data : ", data);

      // console.log("data.canteens || [] : ", setAvailableCanteens(data.canteens || []))


      setAvailableCanteens(data.canteens || []);
    } catch (error) {
      console.error("Error fetching canteens:", error.message);
    }
  }

  const fetchCanteenMenu = async (adminId) => {
    try {
      if (!adminId) return;

      // const response = await fetch(`http://localhost:5000/api/v1/foods/canteens-menu/${adminId}`, {
      const response = await fetch(`https://canteen-order-backend.onrender.com/api/v1/foods/canteens-menu/${adminId}`, {
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
      // const response = await fetch(`http://localhost:5000/api/v1/foods/${foodId}`, {
      const response = await fetch(`https://canteen-order-backend.onrender.com/api/v1/foods/${foodId}`, {
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
    console.log("Selected Canteen: ", selectedCanteen);

    const userId = localStorage.getItem('userId');
    const userToken = localStorage.getItem('userToken');

    // Check if logged in
    if (!userId || !userToken) {
      return toast.error('Please log in before placing your order');
    }

    // Check if canteen is selected
    if (selectedCanteen == null) {
      return toast.error('Please select a canteen before placing your order');
    }

    // Check if any unavailable items
    const unavailableItems = cart.filter(item => !item.isActive);
    if (unavailableItems.length > 0) {
      toast.error(`Some items in your cart are no longer available: ${unavailableItems.map(i => i.foodName).join(', ')}`);
      return;
    }

    console.log("userToken via fetchCollegeCanteens : ", userToken);

    try {
      // const response = await fetch(`http://localhost:5000/api/v1/orders/admins/${selectedCanteen}/place-order`, {
      const response = await fetch(`https://canteen-order-backend.onrender.com/api/v1/orders/admins/${selectedCanteen}/place-order`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
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
      console.log("place order datas : ", data);
      if (!data) {
        console.log("Unable to place order data : ", data.message);
        toast.error("Unable to place order");
      }

      if (!response.ok) {
        toast.error(data.message || "Unable to place Order");
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
      toast.error("Needed to login or select before placing an order");
      console.error("Error in Placing order", error);
    }
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
  const currentOrdersCount = currentOrders.length;




  const renderShimmer = () => {
    const shimmerCount = allfoodItems.length > 0 ? allfoodItems.length : 6;

    return (
      <div className="shimmer-container">
        {[...Array(shimmerCount)].map((_, index) => (
          <div key={index} className="shimmer-card">
            <div className="shimmer-image-container">
              <div className="shimmer-image"></div>
            </div>
            <div className="shimmer-content">
              <div className="shimmer-line shimmer-title"></div>
              <div className="shimmer-line shimmer-description"></div>
              <div className="shimmer-line shimmer-price"></div>
              <div className="shimmer-line shimmer-category"></div>
              <div className="shimmer-line shimmer-status"></div>
              <div className="shimmer-button"></div>
            </div>
          </div>
        ))}
      </div>
    );
  };



  const renderMenuItems = (items) => {
    if (isLoading) {
      return renderShimmer();
    }
    if (!items || items.length === 0) {
      return (
        <div className="full-width-animation-container">
          <div className="no-items-content">
            <Player
              autoplay
              loop
              src={noFoodAnimation}
              style={{ height: '200px', width: '200px' }}
            />
            <p className="no-items-message">
              {selectedCanteen
                ? "No active food items available from this canteen"
                : "No items found"}
            </p>
          </div>
        </div>
      );
    }

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
          {isLoading ? (
            // Show shimmer loading effect while loading
            renderShimmer()
          ) : (
            // After loading, show either items or empty state
            Array.isArray(filteredFoodItems) && filteredFoodItems.length > 0 ? (
              renderMenuItems(filteredFoodItems)
            ) : (
              <div className="no-items-container">
                <Player
                  autoplay
                  loop
                  src={noFoodAnimation}
                  style={{ height: '200px', width: '200px' }}
                />
                <p className="no-items-message">
                  {selectedCanteen
                    ? "No active food items available from this canteen"
                    : "No items found"}
                </p>
              </div>
            )
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

