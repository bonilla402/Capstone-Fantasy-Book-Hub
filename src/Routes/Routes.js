import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../Pages/Home/Home";
import Login from "../Pages/Auth/Login";
import Register from "../Pages/Auth/Register";
import EditProfile from "../Components/Profile/EditProfile";
import Profile from "../Components/Profile/Profile";
import GroupList from "../Components/Groups/GroupList";
import "../Styles/Layout.css";

const AppRoutes = () => {
    return (
        <div className="routes-container">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/edit" element={<EditProfile />} />
                <Route path="/groups" element={<GroupList />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
};

export default AppRoutes;
