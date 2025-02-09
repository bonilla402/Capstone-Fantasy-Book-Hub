import React from "react";
import { Link } from "react-router-dom";
import "./GroupCard.css";

const GroupCard = ({ group }) => {
    return (
        <div className="group-card">
            <h3 className="group-title">{group.group_name}</h3> {/* ✅ Always show group name */}
            <p className="group-description">{group.description}</p>
            <p className="group-members"><strong>Members:</strong> {group.member_count}</p>
            <Link to={`/groups/${group.id}`} className="group-view-btn">View Group</Link>
        </div>
    );
};

export default GroupCard;
