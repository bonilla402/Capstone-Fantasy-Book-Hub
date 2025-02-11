import React, { useState, useEffect } from "react";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import "./GroupMembersList.css"; // Styling for scrollable list

const GroupMembersList = ({ groupId, refreshTrigger }) => {
    const [members, setMembers] = useState([]);
    const [error, setError] = useState("");

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
