import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../UserContext";
import "./Home.css";

/**
 * Home
 *
 * This component serves as the landing page of the Fantasy Book Hub application.
 * If a user is already logged in, they are automatically redirected to the
 * books list (/books) page. Otherwise, it displays a welcome message and
 * brief introduction.
 *
 * @component
 * @returns {JSX.Element} The home page with a welcome message.
 */
const Home = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    /**
     * useEffect hook that checks if there's a user logged in.
     * If so, navigates to the /books page.
     */
    useEffect(() => {
        if (user) {
            navigate("/books");
        }
    }, [user, navigate]);

    return (
        <div className="home-container">
            <h1>Welcome to Fantasy Book Hub</h1>
            <p>Your go-to place for fantasy book discussions!</p>
        </div>
    );
};

export default Home;
