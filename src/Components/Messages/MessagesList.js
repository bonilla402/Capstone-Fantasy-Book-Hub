import React, { useState, useEffect } from "react";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import "./MessagesList.css";

const MessagesList = ({ discussionId }) => {
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, [discussionId]);

    const fetchMessages = async () => {
        try {
            const data = await FantasyBookHubApi.getMessages(discussionId);
            setMessages(data);
        } catch (err) {
            setError("Failed to load messages.");
        }
    };

    // Function to format timestamps
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
                    messages.map((msg, index) => (
                        <div key={msg.id} className={`message ${index % 2 === 0 ? "message-even" : "message-odd"}`}>
                            <div className="message-header">
                                <p className="message-user"><strong>{msg.username}</strong></p>
                                <p className="message-date">{formatDate(msg.created_at)}</p>
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
