import React, { useState } from "react";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import "./MessageInput.css";

const MessageInput = ({ discussionId, onMessageAdded }) => {
    const [content, setContent] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!content.trim()) {
            setError("Message cannot be empty.");
            return;
        }

        try {
            await FantasyBookHubApi.addMessage(discussionId, content);
            setContent("");
            onMessageAdded();
        } catch (err) {
            setError("Failed to send message.");
        }
    };

    return (
        <div className="message-input-container">
            <h3 className="message-input-title">Add a Message</h3>
            {error && <p className="error-text">{error}</p>}
            <form onSubmit={handleSubmit}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type your message..."
                    required
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default MessageInput;
