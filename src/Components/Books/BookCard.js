import React from "react";
import { Link } from "react-router-dom";
import "./BookCard.css";

/**
 * BookCard
 *
 * Displays a brief overview of a single book, including:
 *  - Cover image
 *  - Title
 *  - Average rating
 *  - Authors
 *  - Year published
 *  - Number of groups discussing the book
 *  - A button to view detailed information
 *
 * @component
 * @param {Object} props
 * @param {Object} props.book - The book object containing details.
 * @param {string} props.book.cover_image - The book cover image URL.
 * @param {string} props.book.title - The book title.
 * @param {string} props.book.average_rating - The average rating string (e.g., '4.3 of 120 reviews').
 * @param {string[]} props.book.authors - An array of author names.
 * @param {number} [props.book.year_published] - The year the book was published.
 * @param {number} [props.book.group_count] - The number of groups discussing this book.
 * @returns {JSX.Element} A card element with minimal book info.
 */
const BookCard = ({ book }) => {
    return (
        <div className="book-card">
            <img
                src={book.cover_image}
                alt={book.title}
                className="book-cover-small"
            />
            <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-average-rating">
                    <strong>Average rating:</strong> {book.average_rating}
                </p>
                <p className="book-authors">
                    <strong>Author(s):</strong> {book.authors.join(", ")}
                </p>
                <p className="book-year">
                    <strong>Published:</strong> {book.year_published}
                </p>
                <p className="book-groups"><strong>Groups Discussing:</strong> {book.group_count || 0}</p>
                <Link to={`/books/${book.id}`} className="book-view-btn">
                    View Details
                </Link>
            </div>
        </div>
    );
};

export default BookCard;
