import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../UserContext";
import "./Home.css";

const Home = () => {
    const { user } = useUser();
    const navigate = useNavigate();

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
