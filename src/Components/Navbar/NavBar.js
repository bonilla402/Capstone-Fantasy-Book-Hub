import React from "react";
import { NavLink } from "react-router-dom";
import { useUser } from "../../UserContext";
import "../../Styles/Layout.css";
import logo from "../../Assets/logo.png";

const NavBar = () => {
    const { user, dispatch } = useUser();

    const handleLogout = () => {
        dispatch({ type: "LOGOUT" });
    };

    return (
        <nav className="navbar">
            <NavLink to="/" className="nav-logo">
                <img src={logo} alt="Fantasy Book Hub Logo" className="navbar-logo" />
            </NavLink>
            <div className="nav-links">
                {user ? (
                    <>
                        <NavLink to="/groups" className="nav-link">Groups</NavLink>
                        <NavLink to="/profile" className="nav-link">{user.username}</NavLink>
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
