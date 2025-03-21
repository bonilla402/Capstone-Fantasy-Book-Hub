﻿import React from "react";
import { NavLink } from "react-router-dom";
import { useUser } from "../../UserContext";
import "../../Styles/Layout.css";
import logo from "../../Assets/logo.png";

/**
 * NavBar
 *
 * Displays the main navigation bar of the Fantasy Book Hub application.
 * Shows different links depending on whether the user is logged in or not:
 *  - If logged in: Books, Groups, Profile, and Logout.
 *  - If logged out: Login and Register.
 *
 * @component
 * @returns {JSX.Element} The navigation bar with conditional links.
 */
const NavBar = () => {
    const { user, dispatch } = useUser();

    /**
     * Logs the user out by dispatching a LOGOUT action to UserContext.
     */
    const handleLogout = () => {
        dispatch({ type: "LOGOUT" });
    };

    return (
        <nav className="navbar">
            {/* App Logo linking back to home */}
            <NavLink to="/" className="nav-logo">
                <img src={logo} alt="Fantasy Book Hub Logo" className="navbar-logo" id="nav-logo" />
            </NavLink>

            {/* Navigation links */}
            <div className="nav-links">
                {user ? (
                    <>
                        <NavLink to="/books" className="nav-link" id="nav-books">
                            Books
                        </NavLink>
                        <div className="nav-dropdown" id="nav-groups-dropdown">
                            <NavLink to="/groups" className="nav-link" id="nav-groups">
                                Groups
                            </NavLink>
                            <div className="dropdown-menu">
                                <NavLink to="/groups" className="dropdown-item" id="nav-groups-link">
                                    Groups
                                </NavLink>
                                <NavLink to="/groups/create" className="dropdown-item" id="nav-create-group">
                                    Create Group
                                </NavLink>
                            </div>
                        </div>
                        <NavLink to="/profile" className="nav-link" id="nav-profile">
                            {user.username}
                        </NavLink>
                        <NavLink to="/" onClick={handleLogout} className="nav-link" id="nav-logout">
                            Logout
                        </NavLink>
                    </>
                ) : (
                    <>
                        <NavLink to="/login" className="nav-link" id="nav-login">
                            Login
                        </NavLink>
                        <NavLink to="/register" className="nav-link" id="nav-register">
                            Register
                        </NavLink>
                    </>
                )}
            </div>
        </nav>
    );
};

export default NavBar;
