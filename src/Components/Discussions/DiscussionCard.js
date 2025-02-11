import React from "react";
import { Link } from "react-router-dom";
import "./DiscussionCard.css";

const DiscussionCard = ({ discussion }) => {
    return (
        <div className="discussion-card">
            <h3 className="discussion-title">{discussion.title}</h3>
            <p className="discussion-book"><strong>Book:</strong> {discussion.book.title}</p>
            <p className="discussion-author"><strong>Author:</strong> {discussion.book.authors.join(", ")}</p>
            <p className="discussion-creator"><strong>Started by:</strong> {discussion.created_by}</p>
            <Link to={`/discussions/${discussion.id}`} className="discussion-view-btn">View Discussion</Link>
        </div>
    );
};

export default DiscussionCard;
