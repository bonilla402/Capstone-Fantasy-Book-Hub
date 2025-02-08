import React, { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import FantasyBookHubApi from "./FantasyBookHubApi";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const { user, dispatch } = useUser();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

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
        setError(null); // Clear previous errors

        try {
            // Step 1: Register user and get token + user details
            const { token, user } = await FantasyBookHubApi.register(
                formData.username,
                formData.email,
                formData.password
            );

            // Step 2: Store token and user in Context
            dispatch({ type: "LOGIN", payload: { user, token } });

            // Step 3: Redirect to Home
            navigate("/");
        } catch (err) {
            setError(err[0]); // Show first error message
        }
    };

    return (
        <div>
            <h2>Register</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Username:
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Password:
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;
