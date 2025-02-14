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

    const handleBookSelect = (selectedBookId) => {
        setBookId(selectedBookId);
        setSearchText(""); // Clear search text after selection
        setFilteredBooks([]); // Hide dropdown after selection
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!title || !content || !bookId || !groupId) {
            setError("Title, content, book selection, and group ID are required.");
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
                                onClick={() => handleBookSelect(book.id)}
                            >
                                {book.title} - {book.authors.join(", ")}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

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
