import React, { useState, useEffect } from "react";
import "./ReviewForm.css";

const ReviewForm = ({ userReview, onSubmit, onDelete }) => {
    const [formData, setFormData] = useState({ rating: 5, reviewText: "" });

    useEffect(() => {
        if (userReview) {
            setFormData({ rating: userReview.rating, reviewText: userReview.review_text });
        }
    }, [userReview]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="review-form">
            <h3>{userReview ? "Edit Your Review" : "Leave a Review"}</h3>
            <form onSubmit={handleSubmit}>
                <label>Rating (1-5):</label>
                <input
                    type="number"
                    name="rating"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={handleChange}
                    required
                />

                <label>Review:</label>
                <textarea
                    name="reviewText"
                    value={formData.reviewText}
                    onChange={handleChange}
                    required
                />

                <button type="submit">{userReview ? "Update Review" : "Submit Review"}</button>

                {userReview && (
                    <button type="button" className="delete-review-btn" onClick={() => onDelete(userReview.id)}>
                        Delete Review
                    </button>
                )}
            </form>
        </div>
    );
};

export default ReviewForm;
