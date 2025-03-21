﻿import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import { useUser } from "../../UserContext";
import GroupMembersList from "./GroupMembersList";
import DiscussionList from "../Discussions/DiscussionList";
import "../../Styles/Form.css";
import "./Group.css";

/**
 * Group
 *
 * Displays a single group's details (name, description, creator, member count, etc.),
 * along with the option to join/leave the group, edit it (if creator), or start a new
 * discussion (if a member). Also shows group members and existing discussions.
 *
 * @component
 * @returns {JSX.Element} Group details page, plus membership and discussion sections.
 */
const Group = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();

    const [group, setGroup] = useState(null);
    const [isMember, setIsMember] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(false);

    /**
     * Fetches group details and user's membership status upon mount or group ID change.
     */
    useEffect(() => {
        const fetchGroupDetails = async () => {
            try {
                const fetchedGroup = await FantasyBookHubApi.getGroup(id);
                if (!fetchedGroup) {
                    setError("Group not found.");
                    return;
                }
                setGroup(fetchedGroup);

                const membershipStatus = await FantasyBookHubApi.isUserMember(id);
                setIsMember(membershipStatus.isMember);
            } catch (err) {
                setError("Error fetching group details.");
            } finally {
                setLoading(false);
            }
        };

        fetchGroupDetails();
    }, [id, user]);

    /**
     * Allows the user to join or leave the group, refreshing the group's info on success.
     */
    const handleJoinLeave = async () => {
        try {
            if (isMember) {
                await FantasyBookHubApi.leaveGroup(id);
                setIsMember(false);
                setSuccessMessage("You have left the group.");
            } else {
                await FantasyBookHubApi.joinGroup(id);
                setIsMember(true);
                setSuccessMessage("You have joined the group.");
            }

            const updatedGroup = await FantasyBookHubApi.getGroup(id);
            setGroup(updatedGroup);

            setRefreshTrigger((prev) => !prev);
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            setError("Error updating group membership.");
        }
    };

    if (loading) return <p>Loading group details...</p>;
    if (error) return <p className="error-text">{error}</p>;

    return (
        <div className="group-page-container">
            <div className="group-content-container">
                <div className="group-container">
                    <h2>{group.group_name}</h2>
                    <p>{group.description}</p>
                    <p>
                        <strong>Created by:</strong> {group.created_by_username}
                    </p>
                    <p>
                        <strong>Members:</strong> {group.member_count}
                    </p>
                    <p>
                        <strong>Discussions:</strong> {group.discussion_count}
                    </p>

                    {successMessage && <p className="success-text">{successMessage}</p>}

                    <div className="group-buttons">
                        {user && user.id === group.created_by && (
                            <button
                                className="edit-button"
                                onClick={() => navigate(`/groups/${id}/edit`)}
                            >
                                Edit Group
                            </button>
                        )}

                        <button className="join-leave-button" onClick={handleJoinLeave}>
                            {isMember ? "Leave Group" : "Join Group"}
                        </button>

                        {isMember && (
                            <button
                                className="discussion-button"
                                onClick={() => navigate(`/groups/${id}/discussions/new`)}
                            >
                                Start New Discussion
                            </button>
                        )}

                        <button className="back-button" onClick={() => navigate("/groups")}>
                            Back to All Groups
                        </button>
                    </div>
                </div>

                <div className="group-members-section">
                    <GroupMembersList groupId={id} refreshTrigger={refreshTrigger} />
                </div>
            </div>

            {isMember && group.discussion_count > 0 && (
                <div className="group-discussions-section">
                    <h3 className="group-discussions-tittle">Group Discussions</h3>
                    <DiscussionList groupId={id} />
                </div>
            )}
        </div>
    );
};

export default Group;
