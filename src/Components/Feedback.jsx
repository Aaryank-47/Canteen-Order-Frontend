import { useState} from "react";
import PropTypes from 'prop-types';

const Feedback = ({ onSubmit, closeFeedbackForm }) => {
    const [formData, setFormData] = useState({
        name: "",
        college: "",
        category: "",
        comments: "",
        rating: "",
        suggestions: "",
        email: "",
        file: null,
        agree: false,
    });

    const handleChange = (e) => {
        e.preventDefault();
        const { name, value, type, checked, files } = e.target;
        console.log(name, value, type, checked, files);
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("submitted feedback: ", formData);

        // Call the onSubmit prop
        onSubmit(formData);

        // Show an alert message
        alert("Thank you for your feedback! We appreciate your input.");

        // Close the feedback form
        closeFeedbackForm();

        // Reset the form
        setFormData({
            name: "",
            college: "",
            category: "",
            comments: "",
            rating: "",
            suggestions: "",
            email: "",
            file: null,
            agree: false,
        });
    };

    return (
        <div>
            <div className="formContainer">
                <h2>Feedback Form</h2>
                <form onSubmit={handleSubmit}>
                    <label className="name">Name (Optional):</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter NAME"
                    />

                    <label className="clgname">College Name:</label>
                    <select
                        name="college"
                        value={formData.college}
                        onChange={handleChange}
                        required
                        className="clgselect"
                    >
                        <option value="">Select your college</option>
                        <option value="college1">College 1</option>
                        <option value="college2">College 2</option>
                        <option value="college3">College 3</option>
                    </select>

                    <label className="cmnts">Feedback/Comments:</label>
                    <textarea
                        name="comments"
                        value={formData.comments}
                        onChange={handleChange}
                        placeholder="Write your feedback here..."
                        required
                    />

                    <div className="rating">
                        <label className="rateLabel">Rating (1-5):</label>
                        {[1, 2, 3, 4, 5].map((num) => (
                            <label key={num}>
                                <input
                                    type="radio"
                                    name="rating"
                                    value={num}
                                    checked={formData.rating === String(num)}
                                    onChange={handleChange}
                                />{" "}
                                {num}
                            </label>
                        ))}
                    </div>

                    <label className="suggest">Suggestions (Optional):</label>
                    <textarea
                        name="suggestions"
                        value={formData.suggestions}
                        onChange={handleChange}
                        placeholder="Any suggestions for improvement?"
                    />

                    <label className="mail">Email (Optional):</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                    />

                    <label className="complaint">Upload Evidence (Optional):</label>
                    <input
                        type="file"
                        name="file"
                        onChange={handleChange}
                        accept="image/*"
                    />

                    <label className="agreement">
                        <input
                            type="checkbox"
                            name="agree"
                            checked={formData.agree}
                            onChange={handleChange}
                            required
                        />{" "}
                        I agree my feedback may be shared with the canteen management.
                    </label>

                    <button type="submit" className="submit">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

Feedback.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    closeFeedbackForm: PropTypes.func.isRequired,
};

export default Feedback;
