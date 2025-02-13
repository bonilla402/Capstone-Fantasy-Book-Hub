import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import MessageInput from "../Messages/MessageInput";
import MessagesList from "../Messages/MessagesList";
import "../../Styles/Form.css";
import "./DiscussionPage.css";

const DiscussionPage = () => {
    const { discussionId } = useParams();
    const [discussion, setDiscussion] = useState(null);
    const [refreshMessages, setRefreshMessages] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDiscussion() {
            try {
                const data = await FantasyBookHubApi.getDiscussion(discussionId);
                setDiscussion(data);
            } catch (err) {
                setError("Failed to load discussion.");
            } finally {
                setLoading(false);
            }
        }
        fetchDiscussion();
    }, [discussionId]);

    if (loading) return <p className="loading-text">Loading discussion...</p>;
    if (error) return <p className="error-text">{error}</p>;
    if (!discussion) return <p className="error-text">Discussion not found.</p>;

    return (
        <div className="discussion-page">
            <div className="form-container">
                <h2>{discussion.title}</h2>
                <p className="discussion-meta"><strong>By:</strong> {discussion.created_by}</p>
                <p className="discussion-meta"><strong>Book:</strong> {discussion.book?.title || "Unknown"}</p>
                <p className="discussion-content">{discussion.content}</p>

                <Link to={`/groups/${discussion.group_id}`} className="back-to-group">Back to Group</Link>
            </div>
            
            <MessageInput discussionId={discussionId} onMessageAdded={() => setRefreshMessages(prev => !prev)} />
            <MessagesList discussionId={discussionId} refreshMessages={refreshMessages} />
        </div>
    );
};

export default DiscussionPage;
