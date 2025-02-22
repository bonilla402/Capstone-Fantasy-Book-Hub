import React from "react";
import { Link } from "react-router-dom";
import "./DiscussionCard.css";

/**
 * DiscussionCard
 *
 * A compact card component that displays basic information about
 * a single discussion, including:
 *  - Book cover image
 *  - Discussion title
 *  - Book title & author
 *  - The user who started it
 *  - Message count
 *  - A link to view the discussion
 *
 * @component
 * @param {Object} props
 * @param {Object} props.discussion - The discussion object containing its details.
 * @returns {JSX.Element} A stylized card with brief discussion info and a link to the discussion.
 */
const DiscussionCard = ({ discussion }) => {
    return (
        <div className="discussion-card">
            <div className="discussion-content">
                {discussion.book.cover_image && (
                    <img
                        src={discussion.book.cover_image}
                        alt={discussion.book.title}
                        className="discussion-book-cover"
                    />
                )}
                <div className="discussion-info">
                    <h3 className="discussion-title">{discussion.title}</h3>
                    <p className="discussion-book">
                        <strong>Book:</strong> {discussion.book.title}
                    </p>
                    <p className="discussion-author"><strong>Author:</strong> {discussion.book.authors.join(", ")}</p>
                    <p className="discussion-creator">
                        <strong>Started by:</strong> {discussion.created_by}
                    </p>
                    <p className="discussion-messages">
                        <strong>Messages:</strong> {discussion.message_count || 0}
                    </p>
                    <Link
                        to={`/discussions/${discussion.id}`}
                        className="discussion-view-btn"
                    >
                        View Discussion
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DiscussionCard;
