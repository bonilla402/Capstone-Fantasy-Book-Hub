import React from "react";
import "./BookReview.css";
import { useUser } from "../../UserContext";

/**
 * BookReview
 *
 * A single review display component. Shows the reviewer's name, rating (as stars),
 * and review text. If the current user owns the review or is an admin, they can delete it.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.review - The review object containing details.
 * @param {number} props.review.id - The unique ID of the review.
 * @param {number} props.review.user_id - The ID of the user who wrote the review.
 * @param {string} props.review.user_name - The name of the user who wrote the review.
 * @param {number} props.review.rating - A numeric rating from 1 to 5.
 * @param {string} props.review.review_text - The textual content of the review.
 * @param {Function} props.onDelete - A callback function to handle deleting the review.
 * @returns {JSX.Element} A styled div displaying review info and (optionally) a delete button.
 */
const BookReview = ({ review, onDelete }) => {
    const { user } = useUser();

    /**
     * Converts a numeric rating into a string of star characters.
     *
     * @param {number} rating - The numeric rating to convert to stars.
     * @returns {string} A string of star characters representing the rating.
     */
    const renderStars = (rating) => {
        return "⭐".repeat(rating);
    };

    return (
        <div className="review">
            <p>
                <strong>{review.user_name}</strong> {renderStars(review.rating)}
            </p>
            <p className="review-text">{review.review_text}</p>

            {user && (user.id === review.user_id || user.isAdmin) && (
                <button onClick={() => onDelete(review.id)} className="review-delete-btn">
                    Delete
                </button>
            )}
        </div>
    );
};

export default BookReview;
