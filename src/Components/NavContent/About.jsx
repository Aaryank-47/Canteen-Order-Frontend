import './About.css';

export default function About() {
  return (
    <div className="about-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Our Canteen Story</h1>
          <p>Delicious meals served with love since 2010</p>
        </div>
      </section>

      <section className="mission-section">
        <div className="container">
          <h2>Our Mission</h2>
          <p>
            We're committed to providing healthy, affordable meals to students while supporting 
            local farmers and sustainable practices.
          </p>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">10,000+</span>
              <span className="stat-label">Meals served monthly</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Local suppliers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Fresh ingredients</span>
            </div>
          </div>
        </div>
      </section>

      <section className="team-section">
        <div className="container">
          <h2>Meet Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-photo chef1"></div>
              <h3>Rajesh Kumar</h3>
              <p>Head Chef</p>
            </div>
            <div className="team-member">
              <div className="member-photo chef2"></div>
              <h3>Priya Sharma</h3>
              <p>Nutrition Specialist</p>
            </div>
            <div className="team-member">
              <div className="member-photo chef3"></div>
              <h3>Arjun Patel</h3>
              <p>Pastry Chef</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}