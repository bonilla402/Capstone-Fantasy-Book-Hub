import React, { useState, useEffect } from "react";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import DiscussionCard from "./DiscussionCard";
import "./DiscussionList.css";

/**
 * DiscussionList
 *
 * Displays a list of discussions for a given group. Fetches data from the
 * FantasyBookHubApi based on the provided groupId prop.
 *
 * @component
 * @param {Object} props
 * @param {number|string} props.groupId - The ID of the group whose discussions are to be listed.
 * @returns {JSX.Element} A container with loading status, error messages, and a list of DiscussionCard components.
 */
const DiscussionList = ({ groupId }) => {
    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (groupId) {
            fetchDiscussions();
        }
    }, [groupId]);

    /**
     * Fetches discussions from the back-end API based on the current groupId.
     */
    const fetchDiscussions = async () => {
        setLoading(true);
        try {
            const discussions = await FantasyBookHubApi.getDiscussions(groupId);
            setDiscussions(discussions);
        } catch (err) {
            setError("Failed to load discussions. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="discussion-list-container">
            {loading && <p className="discussion-list-message">Loading discussions...</p>}
            {error && <p className="discussion-list-message error">{error}</p>}
            {discussions.length === 0 && !loading && <p className="discussion-list-message">No discussions found.</p>}

            <div className="discussion-list">
                {discussions.map((discussion) => (
                    <DiscussionCard key={discussion.id} discussion={discussion} />
                ))}
            </div>
        </div>
    );
};

export default DiscussionList;
