import React from "react";
import { Link } from "react-router-dom";
import "./DiscussionCard.css";

const DiscussionCard = ({ discussion }) => {
    return (
        <div className="discussion-card">
            <div className="discussion-content">
                {discussion.book.cover_image && ( // ✅ Ensure cover image exists before rendering
                    <img
                        src={discussion.book.cover_image}
                        alt={discussion.book.title}
                        className="discussion-book-cover"
                    />
                )}
                <div className="discussion-info">
                    <h3 className="discussion-title">{discussion.title}</h3>
                    <p className="discussion-book"><strong>Book:</strong> {discussion.book.title}</p>
                    <p className="discussion-author"><strong>Author:</strong> {discussion.book.authors.join(", ")}</p>
                    <p className="discussion-creator"><strong>Started by:</strong> {discussion.created_by}</p>
                    <p className="discussion-messages"><strong>Messages:</strong> {discussion.message_count || 0}</p>
                    <Link to={`/discussions/${discussion.id}`} className="discussion-view-btn">View Discussion</Link>
                </div>
            </div>
        </div>
    );
};

export default DiscussionCard;
