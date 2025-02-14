import React, {useState, useEffect} from "react";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import BookCard from "./BookCard";
import "./BookList.css";

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchBooks() {
            try {
                const data = await FantasyBookHubApi.getAllBooks();
                setBooks(data);
            } catch (err) {
                setError("Failed to load books.");
            }
        }

        fetchBooks();
    }, []);

    return (
        <div className="book-list-container">
            <h2>Books</h2>
            {error && <p className="error-text">{error}</p>}
            <div className="book-list">
                {books.length === 0 ? (
                    <p>No books available.</p>
                ) : (
                    books.map((book) => <BookCard key={book.id} book={book}/>)
                )}
            </div>
        </div>
    );
};

export default BookList;
