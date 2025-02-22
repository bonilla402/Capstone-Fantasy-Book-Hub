import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import "../../Styles/Form.css";

/**
 * EditGroup
 *
 * Allows users (specifically the group creator or an admin) to modify
 * the name and description of an existing group. If the group is not found
 * or the user lacks permissions, an error message is displayed.
 *
 * @component
 * @returns {JSX.Element} A form to edit the specified group's details.
 */
const EditGroup = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });
    const [error, setError] = useState("");

    /**
     * On mount, fetch the group details from the server
     * and populate the form for editing.
     */
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

    /**
     * Updates local state based on user input in form fields.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    /**
     * Submits the edited group data to the server.
     * If successful, navigates back to the group's detail page.
     */
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
