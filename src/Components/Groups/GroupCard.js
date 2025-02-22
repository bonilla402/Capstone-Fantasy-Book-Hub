import React from "react";
import { Link } from "react-router-dom";
import "./GroupCard.css";

/**
 * GroupCard
 *
 * A small card component used to display basic information about a group,
 * including its name, description, and membership/discussion counts.
 * Provides a link to view the group's detail page.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.group - The group object containing its details.
 * @returns {JSX.Element} A stylized card with group info and a link to the group.
 */
const GroupCard = ({ group }) => {
    return (
        <div className="group-card">
            <h3 className="group-title">{group.group_name}</h3>
            <p className="group-description">{group.description}</p>
            <p className="group-members">
                <strong>Members:</strong> {group.member_count}
            </p>
            <p className="group-members">
                <strong>Discussions:</strong> {group.discussion_count}
            </p>
            <Link to={`/groups/${group.id}`} className="group-view-btn">
                View Group
            </Link>
        </div>
    );
};

export default GroupCard;
