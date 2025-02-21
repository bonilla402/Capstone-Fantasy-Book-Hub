import React from "react";
import "./BookReview.css";
import { useUser } from "../../UserContext";

const BookReview = ({ review, onDelete }) => {
    const { user } = useUser();
    
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
