import React, { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import FantasyBookHubApi from "./FantasyBookHubApi";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
    const { user, dispatch } = useUser();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) navigate("/");
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const { token, user } = await FantasyBookHubApi.login(
                formData.email,
                formData.password
            );
            dispatch({ type: "LOGIN", payload: { user, token } });
            navigate("/");
        } catch (err) {
            setError(err[0]);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h2>Login</h2>
                {error && <p className="error-text">{error}</p>}
                <form className="login-form" onSubmit={handleSubmit}>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;