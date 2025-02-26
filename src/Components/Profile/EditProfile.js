import React, { useState, useEffect } from "react";
import { useUser } from "../../UserContext";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import { useNavigate } from "react-router-dom";
import "../../Styles/Form.css";

/**
 * EditProfile
 *
 * A form that lets the logged-in user update their profile information,
 * including username, email, and password. Upon successful update,
 * the user data in context is refreshed and the user is redirected
 * to their profile page after a short delay.
 *
 * @component
 * @returns {JSX.Element|null} The profile editing form, or null if not authenticated.
 */
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

    /**
     * On mount, if the user is available, prefill the form with current info;
     * otherwise redirect to login.
     */
    useEffect(() => {
        if (user) {
            setFormData({ username: user.username, email: user.email, password: "" });
        } else {
            navigate("/login");
        }
    }, [user, navigate]);

    /**
     * Updates local state when form fields change.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    /**
     * Submits updated user data to the API. On success, it updates the global
     * user context, shows a success message, and redirects to /profile.
     */
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
        <div className="form-page">
            <div className="form-container">
                <h2>Edit Profile</h2>
                {error && <p className="error-text">{error}</p>}
                {success && <p className="success-text">Profile updated successfully!</p>}
                <form className="form" onSubmit={handleSubmit}>
                    <label htmlFor="username">Username:</label>
                    <input
                        id="username"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="email">Email:</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="password">New Password (Optional):</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Leave blank to keep current password"
                    />

                    <button type="submit">Update Profile</button>
                </form>
            </div>
        </div>

    );
};

export default EditProfile;
