import React, { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import FantasyBookHubApi from "./FantasyBookHubApi";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
    const { user, dispatch } = useUser();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({ username: user.username, email: user.email, password: "" });
        } else {
            navigate("/login");
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        try {
            const updatedUser = await FantasyBookHubApi.updateUser(user.id, formData);
            dispatch({ type: "UPDATE_PROFILE", payload: updatedUser });
            setSuccess(true);
            setTimeout(() => navigate("/profile"), 1500);
        } catch (err) {
            setError(err[0]);
        }
    };

    return (
        <div>
            <h2>Edit Profile</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>Profile updated successfully!</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Username:
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    New Password (Optional):
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Leave blank to keep current password"
                    />
                </label>
                <br />
                <button type="submit">Update Profile</button>
            </form>
        </div>
    );
};

export default EditProfile;
