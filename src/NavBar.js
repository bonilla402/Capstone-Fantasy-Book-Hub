import React from "react";
import { NavLink } from "react-router-dom";
import { useUser } from "./UserContext";
import "./NavBar.css";

const NavBar = () => {
    const { user, dispatch } = useUser();

    const handleLogout = () => {
        dispatch({ type: "LOGOUT" });
    };

    return (
        <nav className="navbar">
            <NavLink to="/" className="nav-link">Home</NavLink>
            <div className="nav-links">
                {user ? (
                    <>
                        <NavLink to="/profile" className="nav-link nav-user">{user.username}</NavLink>
                        <NavLink to="/" onClick={handleLogout} className="nav-link">Logout</NavLink>
                    </>
                ) : (
                    <>
                        <NavLink to="/login" className="nav-link">Login</NavLink>
                        <NavLink to="/register" className="nav-link">Register</NavLink>
                    </>
                )}
            </div>
        </nav>
    );
};

export default NavBar;