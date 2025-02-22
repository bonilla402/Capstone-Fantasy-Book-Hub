import React, { useState, useEffect } from "react";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import "./MessagesList.css";

/**
 * MessagesList
 *
 * A component that displays all messages for a given discussion. It also listens
 * for changes in the refreshMessages prop to re-fetch messages when needed.
 *
 * @component
 * @param {Object} props
 * @param {number|string} props.discussionId - The ID of the discussion for which messages are displayed.
 * @param {boolean|number} props.refreshMessages - A value that, when changed, triggers the list to refresh its data.
 * @returns {JSX.Element} A container listing messages or showing loading/error states.
 */
const MessagesList = ({ discussionId, refreshMessages }) => {
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);

    /**
     * Fetches messages whenever discussionId or refreshMessages changes.
     */
    useEffect(() => {
        fetchMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [discussionId, refreshMessages]);

    /**
     * Loads messages from the back-end via the API for the specified discussion.
     */
    const fetchMessages = async () => {
        try {
            const data = await FantasyBookHubApi.getMessages(discussionId);
            setMessages(data);
        } catch (err) {
            setError("Failed to load messages.");
        }
    };

    /**
     * Formats a timestamp into a user-friendly date/time string.
     *
     * @param {string} timestamp - The ISO timestamp to format.
     * @returns {string} A formatted date string (e.g., "Feb 12, 2025, 3:45 PM").
     */
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="messages-container">
            <h3>Messages</h3>
            {error && <p className="error-text">{error}</p>}
            <div className="messages-list">
                {messages.length === 0 ? (
                    <p>No messages yet. Start the discussion!</p>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className="message">
                            <div className="message-header">
                                <span>
                                    <strong>{msg.username}</strong>
                                </span>
                                <span className="message-date">
                                    {formatDate(msg.created_at)}
                                </span>
                            </div>
                            <p className="message-content">{msg.content}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MessagesList;
