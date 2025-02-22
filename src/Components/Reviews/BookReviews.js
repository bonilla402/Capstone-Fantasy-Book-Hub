import React, { useEffect, useState } from "react";
import { useUser } from "../../UserContext";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import BookReview from "./BookReview";
import ReviewForm from "./ReviewForm";
import "./BookReviews.css";

/**
 * BookReviews
 *
 * A container component that:
 *  - Fetches reviews for a specific book.
 *  - Displays a form for adding/updating a review if the user is logged in.
 *  - Renders a list of existing reviews, each in a BookReview component.
 *
 * @component
 * @param {Object} props
 * @param {number|string} props.bookId - The ID of the book whose reviews are to be displayed.
 * @returns {JSX.Element} A section containing both the review form (if logged in) and the list of reviews.
 */
const BookReviews = ({ bookId }) => {
    const { user } = useUser();
    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState(null);
    const [error, setError] = useState(null);

    /**
     * Fetch all reviews for the given bookId, and check if the user
     * has already posted a review to set userReview accordingly.
     */
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

    /**
     * Handles submission of a new or updated review by either updating the existing
     * review in state or adding a new one to the top of the list.
     *
     * @param {Object} formData - Contains { rating, reviewText } from the ReviewForm component.
     */
    const handleSubmit = async (formData) => {
        try {
            if (userReview) {
                await FantasyBookHubApi.updateReview(
                    userReview.id,
                    formData.rating,
                    formData.reviewText
                );
                setReviews(prevReviews =>
                    prevReviews.map(r =>
                        r.id === userReview.id
                            ? { ...r, rating: formData.rating, review_text: formData.reviewText }
                            : r
                    )
                );
            } else {
                const newReview = await FantasyBookHubApi.addReview(
                    bookId,
                    formData.rating,
                    formData.reviewText
                );
                setReviews(prevReviews => [newReview, ...prevReviews]);
                setUserReview(newReview);
            }
        } catch (err) {
            setError("Error submitting review.");
        }
    };

    /**
     * Deletes a review (if authorized) and removes it from local state. If
     * the current user was the owner, clears userReview as well.
     *
     * @param {number} reviewId - The ID of the review to delete.
     */
    const handleDelete = async (reviewId) => {
        try {
            await FantasyBookHubApi.deleteReview(reviewId);
            setReviews((prevReviews) =>
                prevReviews.filter((r) => r.id !== reviewId)
            );

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
                        <BookReview
                            key={review.id}
                            review={review}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>
        </>
    );
};

export default BookReviews;
