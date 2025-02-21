import React, { useState, useEffect } from "react";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import BookCard from "./BookCard";
import SearchBar from "../SearchBar/SearchBar";
import "./BookList.css";

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(1);
    const [totalBooks, setTotalBooks] = useState(0);
    const booksPerPage = 20;
    const [filters, setFilters] = useState({ author: "", title: "", topic: "" });

    useEffect(() => {
        async function fetchBooks() {
            try {
                const data = await FantasyBookHubApi.searchBooks({
                    title: filters.title,
                    author: filters.author,
                    topic: filters.topic,
                    page,
                    limit: booksPerPage
                });
                setBooks(data.books);
                setTotalBooks(data.totalBooks);
            } catch (err) {
                console.error("Failed to load books", err);
            }
        }
        fetchBooks();
    }, [page, filters]);

    const totalPages = Math.ceil(totalBooks / booksPerPage);

    const handleSearch = (searchFilters) => {
        setFilters(searchFilters);
        setPage(1);
    };

    return (
        <div className="book-list-container">
            <SearchBar onSearch={handleSearch} hideGroupFilters={true} />
            
            {totalPages > 1 && (
                <div className="pagination">
                    {page > 1 && (
                        <button onClick={() => setPage(page - 1)} className="pagination-btn">
                            Previous
                        </button>
                    )}
                    <span>Page {page} of {totalPages}</span>
                    {page < totalPages && (
                        <button onClick={() => setPage(page + 1)} className="pagination-btn">
                            Next
                        </button>
                    )}
                </div>
            )}

            <div className="book-list">
                {books.length === 0 ? (
                    <p>No books available.</p>
                ) : (
                    books.map((book) => <BookCard key={book.id} book={book} />)
                )}
            </div>
            
            {totalPages > 1 && (
                <div className="pagination">
                    {page > 1 && (
                        <button onClick={() => setPage(page - 1)} className="pagination-btn">
                            Previous
                        </button>
                    )}
                    <span>Page {page} of {totalPages}</span>
                    {page < totalPages && (
                        <button onClick={() => setPage(page + 1)} className="pagination-btn">
                            Next
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default BookList;