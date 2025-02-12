import React, { useState, useEffect } from "react";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import "../../Styles/Form.css";
import "./NewDiscussion.css";

const NewDiscussion = ({ groupId, bookId: propBookId, onDiscussionAdded }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [bookId, setBookId] = useState(propBookId || null);
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        async function fetchBooks() {
            try {
                const allBooks = await FantasyBookHubApi.getAllBooks();
                setBooks(allBooks);
                setFilteredBooks(allBooks);
            } catch (err) {
                console.error("Error fetching books:", err);
            }
        }
        fetchBooks();
    }, []);

    const handleSearchChange = (e) => {
        const text = e.target.value.toLowerCase();
        setSearchText(text);

        if (text.length >= 3) {
            const filtered = books.filter((book) =>
                book.title.toLowerCase().includes(text) ||
                book.authors.some(author => author.toLowerCase().includes(text))
            );
            setFilteredBooks(filtered);
        } else {
            setFilteredBooks(books);
        }
    };

    const handleBookSelect = (selectedBookId) => {
        setBookId(selectedBookId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!title || !content || !bookId) {
            setError("Title, content, and book selection are required.");
            return;
        }

        try {
            const data = { bookId, title, content };
            await FantasyBookHubApi.createDiscussion(groupId, data);
            setSuccess(true);
            setTitle("");
            setContent("");
        } catch (err) {
            setError(err[0] || "Failed to create discussion.");
        }
    };

    return (
        <div className="form-container NewDiscussion">
            <h2>Start a New Discussion</h2>
            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">Discussion created successfully!</p>}

            {/* Search toolbar remains visible */}
            <div className="book-search">
                <label>Search for a book:</label>
                <input
                    type="text"
                    value={searchText}
                    onChange={handleSearchChange}
                    placeholder="Type at least 3 characters..."
                />
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
