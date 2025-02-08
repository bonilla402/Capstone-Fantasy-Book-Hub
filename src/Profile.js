import React from "react";
import { useUser } from "./UserContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    if (!user) {
        navigate("/login"); // Redirect if not logged in
        return null;
    }

    return (
        <div>
            <h2>User Profile</h2>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Admin:</strong> {user.is_admin ? "Yes" : "No"}</p>
            <button onClick={() => navigate("/profile/edit")}>Edit</button>
        </div>
    );
};

export default Profile;
