import React, { useEffect, useState } from "react";
import { useUser } from "../../UserContext";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import BookReview from "./BookReview";
import ReviewForm from "./ReviewForm";
import "./BookReviews.css";

const BookReviews = ({ bookId }) => {
    const { user } = useUser();
    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchReviews() {
            try {
                const reviewData = await FantasyBookHubApi.getReviews(bookId);
                const reviewsArray = Array.isArray(reviewData) ? reviewData : [];
                setReviews(reviewsArray);

                if (user) {
                    const existingReview = reviewsArray.find(r => r.user_id === user.id);
                    setUserReview(existingReview || null);
                }
            } catch (err) {
                console.error("Error fetching reviews:", err);
            }
        }

        fetchReviews();
    }, [bookId, user]);

    const handleSubmit = async (formData) => {
        try {
            if (userReview) {
                await FantasyBookHubApi.updateReview(userReview.id, formData.rating, formData.reviewText);
                setReviews(prevReviews =>
                    prevReviews.map(r =>
                        r.id === userReview.id ? { ...r, rating: formData.rating, review_text: formData.reviewText } : r
                    )
                );
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
            }
        } catch (err) {
            setError("Error deleting review.");
        }
    };

    return (
        <>
            {user && <ReviewForm userReview={userReview} onSubmit={handleSubmit} onDelete={handleDelete} />}

            <div className="book-reviews">
                <h3>Reviews</h3>
                {reviews.length === 0 ? (
                    <p>No reviews yet. Be the first to review!</p>
                ) : (
                    reviews.map(review => (
                        <BookReview key={review.id} review={review} onDelete={handleDelete} />
                    ))
                )}
            </div>
        </>
    );
};

export default BookReviews;
