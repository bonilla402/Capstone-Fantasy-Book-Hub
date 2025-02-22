import React, { useState, useEffect } from "react";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import GroupCard from "./GroupCard";
import SearchBar from "../SearchBar/SearchBar";
import "./GroupList.css";

/**
 * GroupList
 *
 * Displays a list of all discussion groups, optionally filtered by user input
 * via the SearchBar. Each group is rendered as a GroupCard.
 *
 * @component
 * @returns {JSX.Element} A container displaying groups or any relevant loading/error states.
 */
const GroupList = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Fetches the list of groups initially.
     */
    useEffect(() => {
        fetchGroups();
    }, []);

    /**
     * Optionally fetches groups based on provided search query (for advanced filters)
     * or gets all groups if no query is passed.
     *
     * @param {Object|string} [query=""] - The query object or string to filter groups (author, title, etc.).
     */
    const fetchGroups = async (query = "") => {
        setLoading(true);
        try {
            const groups = query
                ? await FantasyBookHubApi.searchGroups(query)
                : await FantasyBookHubApi.getAllGroups();
            setGroups(groups);
        } catch (err) {
            setError("Failed to load groups. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="group-list-container">
            <SearchBar onSearch={fetchGroups} hideGroupFilters={false} />
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
