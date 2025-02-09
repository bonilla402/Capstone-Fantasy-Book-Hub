import React, { useState, useEffect } from "react";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import GroupCard from "./GroupCard";
import "./GroupList.css";

const GroupList = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const groups = await FantasyBookHubApi.getGroups();
                setGroups(groups);
            } catch (err) {
                setError("Failed to load groups. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchGroups();
    }, []);

    if (loading) return <p className="group-list-message">Loading groups...</p>;
    if (error) return <p className="group-list-message error">{error}</p>;
    if (groups.length === 0) return <p className="group-list-message">No groups found.</p>;

    return (
        <div className="group-list">
            {groups.map((group) => (
                <GroupCard key={group.id} group={group}  />
            ))}
        </div>
    );
};

export default GroupList;
