import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import "../../Styles/Form.css";

const EditGroup = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const group = await FantasyBookHubApi.getGroup(id);
                if (group) {
                    setFormData({
                        name: group.group_name,
                        description: group.description,
                    });
                } else {
                    setError("Group not found.");
                }
            } catch (err) {
                setError("Error fetching group details.");
            }
        })();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.name.trim()) {
            setError("Group name is required.");
            return;
        }

        try {
            await FantasyBookHubApi.updateGroup(id, {
                groupName: formData.name,
                description: formData.description,
            });

            navigate(`/groups/${id}`);
        } catch (err) {
            setError("Failed to update group. Please try again.");
        }
    };

    return (
        <div className="form-page">
            <div className="form-container">
                <h2>Edit Group</h2>
                {error && <p className="error-text">{error}</p>}
                <form onSubmit={handleSubmit} className="form">
                    <label htmlFor="name">Group Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    ></textarea>

                    <button type="submit">Save Changes</button>
                </form>
            </div>
        </div>
    );
};

export default EditGroup;
