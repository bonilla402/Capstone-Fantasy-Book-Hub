import React, { useState, useEffect } from "react";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import BookCard from "./BookCard";
import SearchBar from "../SearchBar/SearchBar";
import "./BookList.css";
import Pagination from "./Pagination";

/**
 * BookList
 *
 * A React component for displaying a list of books. It provides:
 *  - A search bar (by author/title/topic).
 *  - Pagination controls for navigating multiple pages of books.
 *  - A grid of BookCard components for each book.
 *
 * @component
 * @returns {JSX.Element} A paginated list of books with searching and filtering.
 */
const BookList = () => {
    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(1);
    const [totalBooks, setTotalBooks] = useState(0);
    const booksPerPage = 20;
    const [filters, setFilters] = useState({ author: "", title: "", topic: "" });

    /**
     * Fetches and sets books whenever page or filters change.
     */
    useEffect(() => {
        async function fetchBooks() {
            try {
                const data = await FantasyBookHubApi.searchBooks({
                    title: filters.title,
                    author: filters.author,
                    topic: filters.topic,
                    page,
                    limit: booksPerPage,
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

    /**
     * Handles search input from SearchBar and resets page to 1.
     *
     * @param {Object} searchFilters - The filters object { author, title, topic }.
     */
    const handleSearch = (searchFilters) => {
        setFilters(searchFilters);
        setPage(1);
    };

    return (
        <div className="book-list-container">
            <SearchBar onSearch={handleSearch} hideGroupFilters={true} />
            <Pagination currentPage={page} totalPages={totalPages} setPage={setPage} />

            <div className="book-list">
                {books.length === 0 ? (
                    <p>No books available.</p>
                ) : (
                    books.map((book) => <BookCard key={book.id} book={book} />)
                )}
            </div>

            <Pagination currentPage={page} totalPages={totalPages} setPage={setPage} />
        </div>
    );
};

export default BookList;
