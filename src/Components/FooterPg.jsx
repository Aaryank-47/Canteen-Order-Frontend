import { useState,useCallback } from "react";
import { MdCopyright } from "react-icons/md";
import { BiLogoInstagram } from "react-icons/bi";
import { PiXLogoBold } from "react-icons/pi";
import { IoLogoFacebook } from "react-icons/io";
import Feedback from "./Feedback";
import "./R_App.css";


function FooterPg() {
  const[isFeedbackOpen, setFeedbackOpen] = useState(false);
  
  const handleFeedbackClick = useCallback(() => {
    setFeedbackOpen(true);
  } ,[]);

  const closeFeedbackForm = useCallback(() => {
    setFeedbackOpen(false);
  } ,[]);
  // const handleFeedbackClick = () => {setFeedbackOpen(true);};
  // const closeFeedbackForm = () => {setFeedbackOpen(false);};
  const handleFormSubmit = () => {
    alert("Thank you for your feedback!" ); // Optional confirmation message
    console.log("submitted feedback: ");
    // closeFeedbackForm();
  };
  return (
    <>


      {/* <div className="SMlogo"><span id="insta" className="logoSM"><BiLogoInstagram /></span><span id="X" className="logoSM"><PiXLogoBold /></span><span id="fb" className="logoSM"><IoLogoFacebook /></span></div> */}
      <div className="SMlogo">
        <ul className="sm">
          <li id="insta" className="logoSM"><a href="https://www.instagram.com/"><BiLogoInstagram /></a></li>
          <li id="fb" className="logoSM"><a href="https://www.facebook.com/"><IoLogoFacebook /></a></li>
          <li id="x" className="logoSM"><a href="https://www.x.com/"><PiXLogoBold /></a></li>
        </ul>
      </div>

    <div className="footer">
     <div className="footerboxes">
        <div id="QuickLinks" className="footer-items">
          <h3>Quick Links</h3>
          <ul className="QL">
            <li className="QL_items"><a href='/'>Home</a></li>
            <li className="QL_items"><a href='/menu'>Menu</a></li>
            <li className="QL_items"><a href='/orderhistory'>Order History</a></li>
            <li className="QL_items"><a href='/info'>Info</a></li>
            <li className="QL_items"><a href='/about'>About</a></li>
          </ul>
        </div>



        <div id="contact" className="footer-items">
          <h3>CONTACT Us</h3>
          <ul>
            <li>Devloper  <strong>Contact</strong> : 9876543120 <strong>Email-id</strong> : xyz@gmail.com
            </li>
            <li>Canteen <strong>Contact</strong> : 9775543220 <strong>Email-id</strong> : asd@gmail.com</li>
          </ul>
          <p>Hours : 9AM - 6PM</p>
        </div>
        <div id="PPolicy" className="footer-items">
          <h3>Policies</h3>
          <ul className="PP">
            <li className="P_items"><a href='#'>Privacy Policy</a></li>
            <li className="P_items"><a href='#'>Terms & Conditions</a></li>
          </ul>
        </div>
      </div>
      <hr className="footerline" />
        <div id="feedback">  
          <h3>Your Valuable Feedback</h3>
          <p>&quot;We value your feedback! Help us improve by sharing your thoughts.&quot;</p>
          <button onClick={handleFeedbackClick} className="feedback_link">Submit Feedback</button>
          {isFeedbackOpen &&(
            <div className="modal">
              <div className="modal-content">
                <button className="close_btn" onClick={closeFeedbackForm} >&times;</button>
                <Feedback onSubmit={handleFormSubmit} closeFeedbackForm={closeFeedbackForm}/>
              </div>
            </div>
          )}
        </div>
      </div>    
        

      <div className="lastline">
        {/* <a href="/terms&services" className="tas">Terms&Services</a> */}
        <div className="copyRight"><span className="CRlogo"><MdCopyright /></span ><p className="CRtext">2024 CANTEENO<strong>.</strong> All rights reserved<strong>.</strong></p></div>
      </div>
    </>
  )

}

export default FooterPg;
