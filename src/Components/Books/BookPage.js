﻿import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import BookReviews from "../Reviews/BookReviews"; // Keep BookReviews
import "./BookPage.css";

/**
 * BookPage
 *
 * Displays detailed information about a single book, including:
 *  - Cover image, title, average rating, authors, topics, and synopsis.
 *  - A list of discussion groups that feature the book.
 *  - A link back to the main books list.
 *  - A book reviews section (BookReviews).
 *
 * @component
 * @returns {JSX.Element} The book detail page with reviews.
 */
const BookPage = () => {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Fetches the book details from the API once on mount, based on the URL parameter id.
     */
    useEffect(() => {
        async function fetchBook() {
            try {
                const data = await FantasyBookHubApi.getBook(id);
                setBook(data);
            } catch (err) {
                setError("Failed to load book details.");
            } finally {
                setLoading(false);
            }
        }
        fetchBook();
    }, [id]);

    if (loading) return <p className="loading-text">Loading book details...</p>;
    if (error) return <p className="error-text">{error}</p>;
    if (!book) return <p className="error-text">Book not found.</p>;

    return (
        <>
            <div className="book-page">
                <div className="book-header">
                    <img
                        src={book.cover_image}
                        alt={book.title}
                        className="book-cover-large"
                    />
                    <div className="book-info">
                        <h2 className="book-title">{book.title}</h2>
                        <p className="book-average-rating">
                            <strong>Average rating:</strong> {book.average_rating}
                        </p>
                        <p className="book-authors">
                            <strong>Author(s):</strong> {book.authors.join(", ")}
                        </p>
                        <p className="book-year">
                            <strong>Published:</strong> {book.year_published}
                        </p>
                        <p className="book-topics">
                            <strong>Topics:</strong> {book.topics.join(", ")}
                        </p>
                    </div>
                </div>

                <div className="book-content">
                    <h3>Synopsis</h3>
                    <p className="book-synopsis">
                        {book.synopsis || "No synopsis available."}
                    </p>
                </div>

                <div className="book-groups-cards">
                    <h3>Groups Discussing This Book</h3>
                    {book.groups && book.groups.length > 0 ? (
                        <div className="group-buttons">
                            {book.groups.map((group) => (
                                <Link
                                    key={group.id}
                                    to={`/groups/${group.id}`}
                                    className="group-btn"
                                >
                                    {group.group_name}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p>No groups discussing this book yet.</p>
                    )}
                </div>

                <Link to="/books" className="back-to-books">
                    Back to Books
                </Link>
            </div>

            {/* BookReviews - includes a review list and form for adding reviews */}
            <BookReviews bookId={id} />
        </>
    );
};

export default BookPage;
