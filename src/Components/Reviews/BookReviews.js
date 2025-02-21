import React, { useEffect, useState } from "react";
import { useUser } from "../../UserContext"; // 🔹 Use context
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import BookReview from "./BookReview";
import "./BookReviews.css";

const BookReviews = ({ bookId }) => {
    const { user } = useUser(); // 🔹 Get user from context
    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState(null);
    const [formData, setFormData] = useState({ rating: 5, reviewText: "" });
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchReviews() {
            try {
                const reviewData = await FantasyBookHubApi.getReviews(bookId);
                const reviewsArray = Array.isArray(reviewData) ? reviewData : [];

                setReviews(reviewsArray);

                if (user) {
                    const existingReview = reviewsArray.find(r => r.user_id === user.id);
                    if (existingReview) {
                        setUserReview(existingReview);
                        setFormData({ rating: existingReview.rating, reviewText: existingReview.review_text });
                    }
                }
            } catch (err) {
                console.error("Error fetching reviews:", err);
            }
        }

        fetchReviews();
    }, [bookId, user]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (userReview) {
                await FantasyBookHubApi.updateReview(userReview.id, formData.rating, formData.reviewText);
                setReviews(prevReviews => prevReviews.map(r =>
                    r.id === userReview.id ? { ...r, rating: formData.rating, review_text: formData.reviewText } : r
                ));
            } else {
                const newReview = await FantasyBookHubApi.addReview(bookId, formData.rating, formData.reviewText);
                setReviews(prevReviews => [newReview, ...prevReviews]);
                setUserReview(newReview);
            }
        } catch (err) {
            setError("Error submitting review.");
        }
    };

    const handleDelete = async (reviewId) => {
        try {
            await FantasyBookHubApi.deleteReview(reviewId);
            setReviews(prevReviews => prevReviews.filter(r => r.id !== reviewId));
            if (userReview && userReview.id === reviewId) {
                setUserReview(null);
                setFormData({ rating: 5, reviewText: "" });
            }
        } catch (err) {
            setError("Error deleting review.");
        }
    };

    return (
        <div className="book-reviews">
            <h3>Reviews</h3>

            {/* 🔹 Review Form at the Top */}
            {user && (
                <>
                    <h3>{userReview ? "Edit Your Review" : "Leave a Review"}</h3>
                    {error && <p className="error">{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <label>Rating (1-5):</label>
                        <input type="number" name="rating" min="1" max="5" value={formData.rating} onChange={handleChange} required />

                        <label>Review:</label>
                        <textarea name="reviewText" value={formData.reviewText} onChange={handleChange} required />

                        <button type="submit">{userReview ? "Update Review" : "Submit Review"}</button>
                    </form>
                </>
            )}

            {/* 🔹 List of Reviews */}
            {reviews.length === 0 ? (
                <p>No reviews yet. Be the first to review!</p>
            ) : (
                reviews.map(review => (
                    <BookReview key={review.id} review={review} onDelete={handleDelete} />
                ))
            )}
        </div>
    );
};

export default BookReviews;
