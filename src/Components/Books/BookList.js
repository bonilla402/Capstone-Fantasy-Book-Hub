import React, { useState, useEffect } from "react";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import BookCard from "./BookCard";
import "./BookList.css";

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(1);
    const [totalBooks, setTotalBooks] = useState(0);
    const booksPerPage = 10;

    useEffect(() => {
        async function fetchBooks() {
            try {
                const data = await FantasyBookHubApi.getAllBooks(page, booksPerPage);
                setBooks(data.books);
                setTotalBooks(data.totalBooks);
            } catch (err) {
                console.error("Failed to load books", err);
            }
        }
        fetchBooks();
    }, [page]);

    const totalPages = Math.ceil(totalBooks / booksPerPage);

    return (
        <div className="book-list-container">
            
            <div className="pagination">
                <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="pagination-btn"
                >
                    Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="pagination-btn"
                >
                    Next
                </button>
            </div>

            <div className="book-list">
                {books.length === 0 ? (
                    <p>No books available.</p>
                ) : (
                    books.map((book) => <BookCard key={book.id} book={book} />)
                )}
            </div>


            <div className="pagination">
                <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="pagination-btn"
                >
                    Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="pagination-btn"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default BookList;
