import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import "../../Styles/Form.css"; // Reuse existing styles
import "./Group.css"; // Custom styles

const Group = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [group, setGroup] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const fetchedGroup = await FantasyBookHubApi.getGroup(id);
                if (fetchedGroup) {
                    setGroup(fetchedGroup);
                } else {
                    setError("Group not found.");
                }
            } catch (err) {
                setError("Error fetching group details.");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) return <p>Loading group details...</p>;
    if (error) return <p className="error-text">{error}</p>;

    return (
        <div className="group-container">
            <h2>{group.group_name}</h2>
            <p>{group.description}</p>

            <div className="group-buttons">
                <button className="edit-button" onClick={() => navigate(`/groups/${id}/edit`)}>
                    Edit Group
                </button>
                <button className="back-button" onClick={() => navigate("/groups")}>
                    Back to All Groups
                </button>
            </div>
        </div>
    );
};

export default Group;
