import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import "../../Styles/Form.css";
import "./NewDiscussion.css";

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

    // Function to fetch books dynamically based on user input
    const fetchBooks = async (query) => {
        if (query.length < 3) {
            setFilteredBooks([]); // Clear results if query is too short
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

    const handleSearchChange = (e) => {
        const text = e.target.value;
        setSearchText(text);
        fetchBooks(text); // Call backend dynamically
    };

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
                                onClick={() => handleBookSelect(book.id, book.title, book.authors.join(", "), book.cover_image)}
                            >
                                {book.title} - {book.authors.join(", ")}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {selectedBook && (
                <div className="selected-book">
                    <img src={selectedBook.cover} alt={selectedBook.title} className="selected-book-cover" />
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
