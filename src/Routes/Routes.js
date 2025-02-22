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
import Group from "../Components/Groups/Group";
import NewDiscussion from "../Components/Discussions/NewDiscussion";
import BookList from "../Components/Books/BookList";
import BookPage from "../Components/Books/BookPage";
import "../Styles/Layout.css";

/**
 * Routes.js
 *
 * This file defines the main routing structure for the Fantasy Book Hub client application,
 * using React Router v6. Each route corresponds to a specific component, handling pages
 * such as home, login, registration, books, groups, and discussions.
 */

/**
 * AppRoutes
 *
 * A React component that returns the top-level route definitions,
 * mapping paths to the appropriate components. If an unrecognized path is accessed,
 * it redirects to the home page.
 *
 * @component
 * @returns {JSX.Element} The set of route definitions wrapped in a container div.
 *
 * @example
 * // Typical usage in App.js:
 * <BrowserRouter>
 *   <AppRoutes />
 * </BrowserRouter>
 */
const AppRoutes = () => {
    return (
        <div className="routes-container">
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Profile & user-related routes */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/edit" element={<EditProfile />} />

                {/* Book routes */}
                <Route path="/books" element={<BookList />} />
                <Route path="/books/:id" element={<BookPage />} />

                {/* Group routes */}
                <Route path="/groups" element={<GroupList />} />
                <Route path="/groups/create" element={<AddGroup />} />
                <Route path="/groups/:id/edit" element={<EditGroup />} />
                <Route path="/groups/:id" element={<Group />} />
                <Route path="/groups/:groupId/discussions/new" element={<NewDiscussion />} />

                {/* Discussion route */}
                <Route path="/discussions/:discussionId" element={<DiscussionPage />} />

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
};

export default AppRoutes;
