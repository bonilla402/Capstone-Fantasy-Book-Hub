import React from "react";
import { Link } from "react-router-dom";
import "./BookCard.css";

const BookCard = ({ book }) => {
    return (
        <div className="book-card">
            <img src={book.cover_image} alt={book.title} className="book-cover-small" />
            <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-authors"><strong>Author(s):</strong> {book.authors.join(", ")}</p>
                <p className="book-year"><strong>Published:</strong> {book.year_published}</p>
                <p className="book-groups"><strong>Groups Discussing:</strong> {book.group_count || 0}</p>
                <Link to={`/books/${book.id}`} className="book-view-btn">View Details</Link>
            </div>
        </div>
    );
};

export default BookCard;
