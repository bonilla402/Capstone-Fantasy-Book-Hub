import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import "./BookPage.css";

const BookPage = () => {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

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
        <div className="book-page">
            <div className="book-header">
                <img src={book.cover_image} alt={book.title} className="book-cover-large" />
                <div className="book-info">
                    <h2 className="book-title">{book.title}</h2>
                    <p className="book-authors"><strong>Author(s):</strong> {book.authors.join(", ")}</p>
                    <p className="book-year"><strong>Published:</strong> {book.year_published}</p>
                    <p className="book-topics"><strong>Topics:</strong> {book.topics.join(", ")}</p>
                </div>
            </div>

            <div className="book-content">
                <h3>Synopsis</h3>
                <p className="book-synopsis">{book.synopsis || "No synopsis available."}</p>
            </div>

            <div className="book-groups">
                <h3>Groups Discussing This Book</h3>
                {book.group_count > 0 ? (
                    <p>{book.group_count} discussion groups are currently talking about this book.</p>
                ) : (
                    <p>No groups discussing this book yet.</p>
                )}
            </div>

            <Link to="/books" className="back-to-books">Back to Books</Link>
        </div>
    );
};

export default BookPage;
