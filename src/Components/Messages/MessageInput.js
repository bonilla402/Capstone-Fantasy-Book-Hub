import React, { useState } from "react";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import "./MessageInput.css";

/**
 * MessageInput
 *
 * A component that allows users to submit new messages to a discussion.
 * After a successful message submission, it triggers the onMessageAdded
 * callback to refresh the messages list.
 *
 * @component
 * @param {Object} props
 * @param {number|string} props.discussionId - The ID of the discussion to which the message will be added.
 * @param {Function} props.onMessageAdded - A callback function invoked after a message is successfully added.
 * @returns {JSX.Element} A message input form with a textarea and submit button.
 */
const MessageInput = ({ discussionId, onMessageAdded }) => {
    const [content, setContent] = useState("");
    const [error, setError] = useState(null);

    /**
     * Handles form submission to send a new message to the discussion.
     */
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
                <button className="add-discuss-message-btn" type="submit">
                    Send
                </button>
            </form>
        </div>
    );
};

export default MessageInput;
