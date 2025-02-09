import React, { useState, useEffect } from "react";
import { useUser } from "../../UserContext";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import { useNavigate } from "react-router-dom";
import "../../Styles/Form.css"; // Uses the shared form styling

const Register = () => {
    const { user, dispatch } = useUser();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
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
            const { token, user } = await FantasyBookHubApi.register(
                formData.username,
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
        <div className="form-page">
            <div className="form-container">
                <h2>Register</h2>
                {error && <p className="error-text">{error}</p>}
                <form className="form" onSubmit={handleSubmit}>
                    <label>Username:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
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
                    <button type="submit">Register</button>
                </form>
            </div>
        </div>
    );
};

export default Register;
