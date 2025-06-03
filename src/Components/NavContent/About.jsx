import './About.css';
import { motion } from 'framer-motion';
import { GiMeal, GiFarmer } from 'react-icons/gi';
import { FaLeaf, FaAward } from 'react-icons/fa';

export default function About() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8 }
    }
  };

  const scaleUp = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="about-page">
      <motion.section 
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="hero-content"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <h1>Our Canteen Story</h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Delicious meals served with love since 2010
          </motion.p>
        </motion.div>
      </motion.section>

      <motion.section 
        className="mission-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
      >
        <div className="container">
          <motion.h2 variants={itemVariants}>Our Mission</motion.h2>
          <motion.p variants={itemVariants}>
            We're committed to providing healthy, affordable meals to students while supporting 
            local farmers and sustainable practices.
          </motion.p>
          <motion.div 
            className="stats-grid"
            variants={containerVariants}
          >
            <motion.div 
              className="stat-item"
              variants={itemVariants}
              whileHover={{ y: -10 }}
            >
              <div className="stat-icon">
                <GiMeal />
              </div>
              <span className="stat-number">10,000+</span>
              <span className="stat-label">Meals served monthly</span>
            </motion.div>
            <motion.div 
              className="stat-item"
              variants={itemVariants}
              whileHover={{ y: -10 }}
            >
              <div className="stat-icon">
                <GiFarmer />
              </div>
              <span className="stat-number">50+</span>
              <span className="stat-label">Local suppliers</span>
            </motion.div>
            <motion.div 
              className="stat-item"
              variants={itemVariants}
              whileHover={{ y: -10 }}
            >
              <div className="stat-icon">
                <FaLeaf />
              </div>
              <span className="stat-number">100%</span>
              <span className="stat-label">Fresh ingredients</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section 
        className="team-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
      >
        <div className="container">
          <motion.h2 variants={itemVariants}>Meet Our Team</motion.h2>
          <motion.div 
            className="team-grid"
            variants={containerVariants}
          >
            <motion.div 
              className="team-member"
              variants={itemVariants}
              whileHover={{ y: -15, boxShadow: "0 15px 30px rgba(0,0,0,0.12)" }}
            >
              <motion.div 
                className="member-photo chef1"
                whileHover={{ scale: 1.05 }}
              />
              <h3>Rajesh Kumar</h3>
              <p>Head Chef</p>
              <motion.div 
                className="member-badge"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <FaAward />
              </motion.div>
            </motion.div>
            <motion.div 
              className="team-member"
              variants={itemVariants}
              whileHover={{ y: -15, boxShadow: "0 15px 30px rgba(0,0,0,0.12)" }}
            >
              <motion.div 
                className="member-photo chef2"
                whileHover={{ scale: 1.05 }}
              />
              <h3>Priya Sharma</h3>
              <p>Nutrition Specialist</p>
            </motion.div>
            <motion.div 
              className="team-member"
              variants={itemVariants}
              whileHover={{ y: -15, boxShadow: "0 15px 30px rgba(0,0,0,0.12)" }}
            >
              <motion.div 
                className="member-photo chef3"
                whileHover={{ scale: 1.05 }}
              />
              <h3>Arjun Patel</h3>
              <p>Pastry Chef</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}