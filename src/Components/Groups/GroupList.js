import React, { useState, useEffect } from "react";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import GroupCard from "./GroupCard";
import SearchBar from "../SearchBar/SearchBar";
import "./GroupList.css";

const GroupList = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async (query = "") => {
        setLoading(true);
        try {
            const groups = query
                ? await FantasyBookHubApi.searchGroups(query)
                : await FantasyBookHubApi.getGroups();
            setGroups(groups);
        } catch (err) {
            setError("Failed to load groups. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="group-list-container">
            <SearchBar onSearch={fetchGroups} placeholder="Search groups..." />

            {loading && <p className="group-list-message">Loading groups...</p>}
            {error && <p className="group-list-message error">{error}</p>}
            {groups.length === 0 && !loading && <p className="group-list-message">No groups found.</p>}

            <div className="group-list">
                {groups.map((group) => (
                    <GroupCard key={group.id} group={group} />
                ))}
            </div>
        </div>
    );
};

export default GroupList;
