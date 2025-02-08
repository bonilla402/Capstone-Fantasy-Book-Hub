import React, { useState } from "react";
import { useUser } from "./UserContext";
import FantasyBookHubApi from "./FantasyBookHubApi";

const Login = () => {
    const { dispatch } = useUser();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);

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
            // Step 1: Login and get the token + user
            const { token, user } = await FantasyBookHubApi.login(
                formData.email,
                formData.password
            );

            // Step 2: Store token and user in Context
            dispatch({ type: "LOGIN", payload: { user, token } });
        } catch (err) {
            setError(err[0]); // Show first error message
        }
    };

    return (
        <div>
            <h2>Login</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
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
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
