import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../Pages/Home/Home";
import Login from "../Pages/Auth/Login";
import Register from "../Pages/Auth/Register";
import EditProfile from "../Components/Profile/EditProfile";
import Profile from "../Components/Profile/Profile";
import GroupList from "../Components/Groups/GroupList";
import AddGroup from "../Components/Groups/AddGroup";
import EditGroup from "../Components/Groups/EditGroup";
import DiscussionPage from "../Components/Discussions/DiscussionPage";

import "../Styles/Layout.css";
import Group from "../Components/Groups/Group";
import NewDiscussion from "../Components/Discussions/NewDiscussion";

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
                <Route path="/groups/create" element={<AddGroup />} />
                <Route path="/groups/:id/edit" element={<EditGroup />} />
                <Route path="/groups/:id" element={<Group />} />
                <Route path="/groups/:groupId/discussions/new" element={<NewDiscussion />} />
                <Route path="/discussions/:discussionId" element={<DiscussionPage />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
};

export default AppRoutes;
