import React from "react";
import {Link, useNavigate} from "react-router-dom";
import {useUser} from "./UserContext";

const NavBar = () => {
    const {user, dispatch} = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch({type: "LOGOUT"});
        navigate("/"); // ✅ Redirect to home after logout
    };

    return (
        <nav>
            <Link to="/">Home</Link>

            {user ? (
                <>
                    <span onClick={() => navigate("/profile")} style={{cursor: "pointer", textDecoration: "underline"}}>
                        {user.username}!
                    </span>
                    <Link to="/" onClick={handleLogout}>Logout</Link>
                </>
            ) : (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </>
            )}
        </nav>
    );
};

export default NavBar;
