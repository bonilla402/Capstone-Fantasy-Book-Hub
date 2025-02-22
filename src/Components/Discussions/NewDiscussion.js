import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import "../../Styles/Form.css";
import "./NewDiscussion.css";

/**
 * NewDiscussion
 *
 * A form that allows the user to create a new discussion within a group.
 * The user can search for a book by title or author (minimum 3 chars), then
 * fill in a discussion title and content. Upon submission, the discussion is created.
 *
 * @component
 * @param {Object} props
 * @param {number|string} [props.groupId] - Optional group ID if passed directly. Defaults to the route param if not provided.
 * @param {number|string} [props.bookId] - Optional preselected book ID.
 * @returns {JSX.Element} A new discussion form with dynamic book search.
 */
const NewDiscussion = ({ groupId: propGroupId, bookId: propBookId }) => {
    const { groupId: routeGroupId } = useParams();
    const navigate = useNavigate();
    const groupId = propGroupId || routeGroupId;

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [bookId, setBookId] = useState(propBookId || null);
    const [selectedBook, setSelectedBook] = useState(null);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    /**
     * Searches for books dynamically as the user types a query (minimum 3 characters).
     * If the query is too short, clears the search results.
     */
    const fetchBooks = async (query) => {
        if (query.length < 3) {
            setFilteredBooks([]);
            return;
        }

        setLoading(true);
        try {
            const books = await FantasyBookHubApi.searchBooksDynamic(query);
            setFilteredBooks(books);
        } catch (err) {
            console.error("Error searching books:", err);
        }
        setLoading(false);
    };

    /**
     * Handler for the search text input. Triggers fetchBooks for dynamic suggestions.
     */
    const handleSearchChange = (e) => {
        const text = e.target.value;
        setSearchText(text);
        fetchBooks(text);
    };

    /**
     * Sets the selected book state once a user chooses one from the suggestions.
     */
    const handleBookSelect = (selectedBookId, selectedTitle, selectedAuthors, selectedCover) => {
        setBookId(selectedBookId);
        setSearchText(selectedTitle);
        setSelectedBook({
            id: selectedBookId,
            title: selectedTitle,
            authors: selectedAuthors,
            cover: selectedCover
        });
        setFilteredBooks([]);
    };

    /**
     * Submits the new discussion form, including:
     *  - group ID
     *  - selected book ID
     *  - discussion title
     *  - discussion content
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!title || !content || !bookId || !groupId) {
            setError("Please select a book.");
            return;
        }

        try {
            const data = { bookId, title, content };
            const newDiscussion = await FantasyBookHubApi.createDiscussion(groupId, data);
            setSuccess(true);
            setTitle("");
            setContent("");
            navigate(`/discussions/${newDiscussion.id}`);
        } catch (err) {
            setError(err[0] || "Failed to create discussion.");
        }
    };

    return (
        <div className="form-container NewDiscussion">
            <h2>Start a New Discussion</h2>
            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">Discussion created successfully!</p>}

            <div className="book-search">
                <label>Search for a book:</label>
                <input
                    type="text"
                    value={searchText}
                    onChange={handleSearchChange}
                    placeholder="Type at least 3 characters..."
                />
                {loading && <p className="loading-text">Searching...</p>}
                {filteredBooks.length > 0 && (
                    <ul className="book-dropdown">
                        {filteredBooks.map((book) => (
                            <li
                                key={book.id}
                                className={book.id === bookId ? "selected" : ""}
                                onClick={() =>
                                    handleBookSelect(
                                        book.id,
                                        book.title,
                                        book.authors.join(", "),
                                        book.cover_image
                                    )
                                }
                            >
                                {book.title} - {book.authors.join(", ")}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {selectedBook && (
                <div className="selected-book">
                    <img
                        src={selectedBook.cover}
                        alt={selectedBook.title}
                        className="selected-book-cover"
                    />
                    <div className="selected-book-info">
                        <p className="selected-book-title">{selectedBook.title}</p>
                        <p className="selected-book-authors">{selectedBook.authors}</p>
                    </div>
                </div>
            )}

            <form className="form" onSubmit={handleSubmit}>
                <label>Discussion Title:</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                <label>Content:</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                ></textarea>

                <button type="submit">Create Discussion</button>
            </form>
        </div>
    );
};

export default NewDiscussion;
