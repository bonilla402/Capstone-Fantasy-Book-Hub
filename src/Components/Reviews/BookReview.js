import React from "react";
import "./BookReview.css";
import { useUser } from "../../UserContext";

const BookReview = ({ review, onDelete }) => {
    const { user } = useUser();

    return (
        <div className="review">
            <p><strong>{review.user_name}</strong> rated {review.rating} ⭐</p>
            <p className="review-text">{review.review_text}</p>
            
            {user && (user.id === review.user_id || user.isAdmin) && (
                <button onClick={() => onDelete(review.id)} className="delete-review-btn">
                    Delete
                </button>
            )}
        </div>
    );
};

export default BookReview;
