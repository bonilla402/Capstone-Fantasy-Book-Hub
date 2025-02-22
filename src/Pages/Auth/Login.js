import React, { useState, useEffect } from "react";
import { useUser } from "../../UserContext";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import { useNavigate } from "react-router-dom";
import "../../Styles/Form.css"; // Uses the shared form styling

/**
 * Login
 *
 * A React component that handles user login. The user provides their email
 * and password, and if the credentials are valid, the user is logged in
 * and redirected to the home page.
 *
 * @component
 * @returns {JSX.Element} A login form for existing users to authenticate.
 */
const Login = () => {
    const { user, dispatch } = useUser();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);

    /**
     * If the user is already logged in, redirect to the home page.
     */
    useEffect(() => {
        if (user) navigate("/");
    }, [user, navigate]);

    /**
     * Update local form state upon user typing in inputs.
     *
     * @param {Object} e - The DOM event from the input field.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    /**
     * Submit the login form. Communicates with FantasyBookHubApi to authenticate the user.
     * On success, updates global user context and redirects to home.
     *
     * @param {Object} e - The DOM event from submitting the form.
     */
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
        <div className="form-page">
            <div className="form-container">
                <h2>Login</h2>
                {error && <p className="error-text">{error}</p>}
                <form className="form" onSubmit={handleSubmit}>
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
