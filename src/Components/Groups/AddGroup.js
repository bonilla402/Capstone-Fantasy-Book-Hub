import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import "../../Styles/Form.css";

/**
 * AddGroup
 *
 * Provides a form to create a new discussion group by entering a name
 * and optional description. On success, navigates back to the groups list.
 *
 * @component
 * @returns {JSX.Element} A form for creating a new group.
 */
const AddGroup = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });
    const [error, setError] = useState("");

    /**
     * Handles changes to form fields, updating local state.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    /**
     * Submits the new group data to the server API. If successful,
     * navigates back to the group list page.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.name.trim()) {
            setError("Group name is required.");
            return;
        }

        try {
            const response = await FantasyBookHubApi.createGroup({
                groupName: formData.name,
                description: formData.description,
            });

            if (response?.id) {
                navigate("/groups");
            } else {
                setError("Failed to create group. Unexpected response.");
            }
        } catch (err) {
            setError(err || "Failed to create group. Please try again.");
        }
    };

    return (
        <div className="form-page">
            <div className="form-container">
                <h2>Create a New Group</h2>
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

                    <button type="submit">Create Group</button>
                </form>
            </div>
        </div>
    );
};

export default AddGroup;
