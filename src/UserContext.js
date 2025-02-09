import React, { createContext, useReducer, useContext } from "react";
import FantasyBookHubApi from "./Api/FantasyBookHubApi";

// Create the context
const UserContext = createContext();

// Custom hook to consume UserContext
export const useUser = () => useContext(UserContext);

// Reducer function for user state management
const userReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN":
            localStorage.setItem("token", action.payload.token);
            localStorage.setItem("user", JSON.stringify(action.payload.user));
            FantasyBookHubApi.token = action.payload.token; // Sync API with token
            return action.payload.user;

        case "LOGOUT":
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            FantasyBookHubApi.logout(); // Clears token from API
            return null;

        case "UPDATE_PROFILE":
            const updatedUser = { ...state, ...action.payload };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            return updatedUser;

        default:
            throw new Error(`Unknown action type: ${action.type}`);
    }
};

// UserProvider component to wrap the app
export const UserProvider = ({ children }) => {
    // Initialize state from localStorage
    const [user, dispatch] = useReducer(userReducer, null, () => {
        const storedUser = localStorage.getItem("user");
        FantasyBookHubApi.token = localStorage.getItem("token"); // Ensure API has the token
        return storedUser ? JSON.parse(storedUser) : null;
    });

    return (
        <UserContext.Provider value={{ user, dispatch }}>
            {children}
        </UserContext.Provider>
    );
};
