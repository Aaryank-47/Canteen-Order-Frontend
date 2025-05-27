import { useState } from 'react';
import './Menu.css';

const menuCategories = [
  {
    id: 1,
    name: 'Breakfast',
    items: [
      { id: 101, name: 'Masala Dosa', price: 50, description: 'Crispy rice crepe with spiced potatoes' },
      { id: 102, name: 'Poha', price: 30, description: 'Flattened rice with peanuts and spices' }
    ]
  },
  {
    id: 2,
    name: 'Lunch',
    items: [
      { id: 201, name: 'Thali', price: 80, description: 'Complete meal with 4 curries, rice, and bread' },
      { id: 202, name: 'Biryani', price: 90, description: 'Fragrant rice with chicken/vegetables' }
    ]
  }
];

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState(1);
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  return (
    <div className="menu-page">
      <div className="menu-header">
        <h1>Our Menu</h1>
        <p>Freshly prepared meals for every taste</p>
      </div>

      <div className="menu-container">
        <div className="category-tabs">
          {menuCategories.map(category => (
            <button
              key={category.id}
              className={`tab-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="menu-items">
          {menuCategories.find(cat => cat.id === activeCategory)?.items.map(item => (
            <div key={item.id} className="menu-item">
              <div className="item-details">
                <h3>{item.name}</h3>
                <p className="item-description">{item.description}</p>
                <p className="item-price">₹{item.price}</p>
              </div>
              <button 
                className="add-to-cart-btn"
                onClick={() => addToCart(item)}
              >
                Add +
              </button>
            </div>
          ))}
        </div>
      </div>

      {cart.length > 0 && (
        <div className="cart-preview">
          <h3>Your Cart ({cart.length})</h3>
          <button className="checkout-btn">Proceed to Checkout</button>
        </div>
      )}
    </div>
  );
}