import React from "react";
import { useUser } from "../../UserContext";
import { useNavigate } from "react-router-dom";
import "./Profile.css"; // Uses the vintage styling for profile

const Profile = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    if (!user) {
        navigate("/login");
        return null;
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <h2>Your Profile</h2>
                <div className="profile-info">
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                </div>
                <button onClick={() => navigate("/profile/edit")}>Edit Profile</button>
            </div>
        </div>
    );
};

export default Profile;