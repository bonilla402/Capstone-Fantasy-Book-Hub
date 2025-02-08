import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import "./NavBar.css";

const NavBar = () => {
    const { user, dispatch } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch({ type: "LOGOUT" });
        navigate("/"); // Redirect to home after logout
    };

    return (
        <nav className="navbar">
            <div className="nav-left">
                <Link to="/" className="nav-link">Home</Link>
            </div>
            <div className="nav-right">
                {user ? (
                    <>
                        <span className="nav-user" onClick={() => navigate("/profile")}>
                            {user.username}
                        </span>
                        <Link to="/" className="nav-link" onClick={handleLogout}>Logout</Link>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="nav-link">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default NavBar;
