import './Info.css';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

export default function Info() {
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
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

  return (
    <div className="info-page">
      <motion.div
        className="info-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Canteen Information
        </motion.h1>
      </motion.div>

      <motion.div
        className="info-container"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.section className="hours-section" variants={itemVariants}>
          <h2>Opening Hours</h2>
          <motion.div
            className="hours-grid"
            variants={containerVariants}
          >
            <motion.div
              className="day-hours"
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            >
              <span className="day">Monday - Friday</span>
              <span className="hours">8:00 AM - 8:00 PM</span>
            </motion.div>
            <motion.div
              className="day-hours"
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            >
              <span className="day">Saturday</span>
              <span className="hours">9:00 AM - 6:00 PM</span>
            </motion.div>
            <motion.div
              className="day-hours"
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            >
              <span className="day">Sunday</span>
              <span className="hours">Closed</span>
            </motion.div>
          </motion.div>
        </motion.section>

        <motion.section className="contact-section" variants={itemVariants}>
          <h2>Contact Us</h2>
          <motion.div
            className="contact-info"
            variants={containerVariants}
          >
            <motion.div
              className="contact-item"
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="icon">
                <FaMapMarkerAlt />
              </div>
              <span>College Campus, Main Building, Ground Floor</span>
            </motion.div>
            <motion.div
              className="contact-item"
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="icon">
                <FaPhone />
              </div>
              <span>+91 9876543210</span>
            </motion.div>
            <motion.div
              className="contact-item"
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="icon">
                <FaEnvelope />
              </div>
              <span>canteen@college.edu</span>
            </motion.div>
          </motion.div>
        </motion.section>

        <motion.section
          className="policies-section"
          variants={fadeIn}
        >
          <h2>Canteen Policies</h2>
          <motion.ul
            className="policies-list"
            variants={containerVariants}
          >
            <motion.li variants={itemVariants}>
              Meal coupons can be purchased at the counter
            </motion.li>
            <motion.li variants={itemVariants}>
              No outside food allowed in the canteen
            </motion.li>
            <motion.li variants={itemVariants}>
              Please maintain cleanliness
            </motion.li>
            <motion.li variants={itemVariants}>
              Special dietary requirements can be accommodated with prior notice
            </motion.li>
          </motion.ul>
        </motion.section>
      </motion.div>
    </div>
  );
}