import './OrderHistory.css';

const pastOrders = [
  {
    id: 1001,
    date: '2023-05-15',
    items: [
      { name: 'Masala Dosa', quantity: 2, price: 50 },
      { name: 'Coffee', quantity: 1, price: 20 }
    ],
    total: 120,
    status: 'Delivered'
  },
  {
    id: 1002,
    date: '2023-05-10',
    items: [
      { name: 'Veg Thali', quantity: 1, price: 80 }
    ],
    total: 80,
    status: 'Delivered'
  }
];

export default function OrderHistory() {
  return (
    <div className="order-history-page">
      <h1>Your Order History</h1>
      
      <div className="orders-list">
        {pastOrders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <span className="order-id">Order #{order.id}</span>
              <span className="order-date">{order.date}</span>
              <span className={`order-status ${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
            
            <div className="order-items">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <span>{item.quantity}x {item.name}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            
            <div className="order-footer">
              <span className="order-total">Total: ₹{order.total}</span>
              <button className="reorder-btn">Reorder</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}