import React from "react";
import {Link} from "react-router-dom";
import {useUser} from "./UserContext";

const NavBar = () => {
    const {user, dispatch} = useUser();

    const handleLogout = () => {
        dispatch({type: "LOGOUT"});
    };

    return (
        <nav>
            <Link to="/">Home</Link>

            {user ? (
                <>
                    <span>Welcome, {user.username}!</span>
                    <button onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <Link to="/login">Login</Link>
            )}
        </nav>
    );
};

export default NavBar;
