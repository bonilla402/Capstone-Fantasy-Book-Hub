import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import "../../Styles/Form.css";
import "./NewDiscussion.css";

const NewDiscussion = ({ onDiscussionAdded }) => {
    const { groupId, bookId } = useParams(); // ✅ Extract params from the route
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [book, setBook] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        async function fetchBook() {
            try {
                const bookData = await FantasyBookHubApi.getBook(bookId);
                if (bookData) {
                    setBook(bookData);
                } else {
                    console.error("Book not found");
                }
            } catch (err) {
                console.error("Error fetching book:", err);
            }
        }
        if (bookId) fetchBook();
    }, [bookId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!title || !content) {
            setError("Title and content are required.");
            return;
        }

        try {
            const data = { bookId, title, content };
            await FantasyBookHubApi.createDiscussion(groupId, data);
            setSuccess(true);
            setTitle("");
            setContent("");
            if (onDiscussionAdded) onDiscussionAdded();
        } catch (err) {
            setError(err[0] || "Failed to create discussion.");
        }
    };

    return (
        <div className="form-container NewDiscussion">
            <h2>Start a New Discussion</h2>
            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">Discussion created successfully!</p>}

            {/* ✅ Ensure book details are displayed */}
            {book ? (
                <div className="book-info">
                    <h3>{book.title}</h3>
                    <img src={book.cover_image} alt={book.title} />
                    <p>By: {book.authors?.join(", ")}</p>
                    <p>Topics: {book.topics?.join(", ")}</p>
                </div>
            ) : (
                <p>Loading book details...</p>
            )}

            <form className="form" onSubmit={handleSubmit}>
                <label>Title:</label>
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
