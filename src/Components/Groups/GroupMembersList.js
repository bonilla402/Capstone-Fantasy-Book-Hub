import React, { useState, useEffect } from "react";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import "./GroupMembersList.css";

/**
 * GroupMembersList
 *
 * A scrollable list of all members in a specific group, fetched from the server.
 * If refreshTrigger changes, it re-fetches the members list (useful after join/leave).
 *
 * @component
 * @param {Object} props
 * @param {number|string} props.groupId - The ID of the group whose members are displayed.
 * @param {boolean} props.refreshTrigger - A flag that triggers re-fetching when toggled.
 * @returns {JSX.Element} A container displaying the group members or any error message.
 */
const GroupMembersList = ({ groupId, refreshTrigger }) => {
    const [members, setMembers] = useState([]);
    const [error, setError] = useState("");

    /**
     * Fetches the group's members whenever groupId or refreshTrigger changes.
     */
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const membersList = await FantasyBookHubApi.getGroupMembers(groupId);
                setMembers(membersList);
            } catch (err) {
                setError("Error fetching group members.");
            }
        };
        fetchMembers();
    }, [groupId, refreshTrigger]);

    if (error) return <p className="error-text">{error}</p>;

    return (
        <div className="members-list-container">
            <h3>Group Members</h3>
            <div className="members-list">
                {members.length === 0 ? (
                    <p className="no-members">No members yet.</p>
                ) : (
                    members.map(member => (
                        <div key={member.id} className="member-item">
                            {member.username}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default GroupMembersList;
