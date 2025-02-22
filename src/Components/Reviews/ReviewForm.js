import React, { useState, useEffect } from "react";
import "./ReviewForm.css";

/**
 * ReviewForm
 *
 * A form that allows a logged-in user to:
 *  - Submit a new review for a book, or
 *  - Update an existing review, or
 *  - Delete their existing review (if present).
 *
 * @component
 * @param {Object} props
 * @param {Object|null} props.userReview - The user's existing review object if present (null otherwise).
 * @param {Function} props.onSubmit - Called when the user submits a new/updated review; expects formData as { rating, reviewText }.
 * @param {Function} props.onDelete - Called to delete the user's existing review.
 * @returns {JSX.Element} A form with rating and text fields, plus submit/delete buttons.
 */
const ReviewForm = ({ userReview, onSubmit, onDelete }) => {
    const [formData, setFormData] = useState({ rating: 5, reviewText: "" });

    /**
     * If an existing review is provided, populate the form with its data; otherwise reset to defaults.
     */
    useEffect(() => {
        if (userReview) {
            setFormData({
                rating: userReview.rating,
                reviewText: userReview.review_text,
            });
        } else {
            setFormData({ rating: 5, reviewText: "" });
        }
    }, [userReview]);

    /**
     * Handles changes to form fields, updating local state.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Submits the current form data (rating/reviewText) to the onSubmit callback.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    /**
     * Invokes onDelete for the user's existing review, then resets the form.
     */
    const handleDelete = () => {
        onDelete(userReview.id);
        setFormData({ rating: 5, reviewText: "" });
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

                <div className="review-form-buttons">
                    <button type="submit" className="submit-review-btn">
                        {userReview ? "Update Review" : "Submit Review"}
                    </button>

                    {userReview && (
                        <button
                            type="button"
                            className="delete-review-btn"
                            onClick={handleDelete}
                        >
                            Delete Review
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;
