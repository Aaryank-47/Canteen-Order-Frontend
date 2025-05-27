import './Info.css';

export default function Info() {
  return (
    <div className="info-page">
      <div className="info-hero">
        <h1>Canteen Information</h1>
      </div>
      
      <div className="info-container">
        <section className="hours-section">
          <h2>Opening Hours</h2>
          <div className="hours-grid">
            <div className="day-hours">
              <span className="day">Monday - Friday</span>
              <span className="hours">8:00 AM - 8:00 PM</span>
            </div>
            <div className="day-hours">
              <span className="day">Saturday</span>
              <span className="hours">9:00 AM - 6:00 PM</span>
            </div>
            <div className="day-hours">
              <span className="day">Sunday</span>
              <span className="hours">Closed</span>
            </div>
          </div>
        </section>
        
        <section className="contact-section">
          <h2>Contact Us</h2>
          <div className="contact-info">
            <div className="contact-item">
              <i className="icon location"></i>
              <span>College Campus, Main Building, Ground Floor</span>
            </div>
            <div className="contact-item">
              <i className="icon phone"></i>
              <span>+91 9876543210</span>
            </div>
            <div className="contact-item">
              <i className="icon email"></i>
              <span>canteen@college.edu</span>
            </div>
          </div>
        </section>
        
        <section className="policies-section">
          <h2>Canteen Policies</h2>
          <ul className="policies-list">
            <li>Meal coupons can be purchased at the counter</li>
            <li>No outside food allowed in the canteen</li>
            <li>Please maintain cleanliness</li>
            <li>Special dietary requirements can be accommodated with prior notice</li>
          </ul>
        </section>
      </div>
    </div>
  );
}