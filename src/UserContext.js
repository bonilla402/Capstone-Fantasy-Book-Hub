import React, { createContext, useReducer, useContext } from "react";
import FantasyBookHubApi from "./Api/FantasyBookHubApi";

/**
 * UserContext.js
 *
 * Provides a global user state for the Fantasy Book Hub client. This context
 * handles login, logout, and user profile updates, while synchronizing
 * credentials (token) with localStorage and the FantasyBookHubApi class.
 *
 * @file
 */

/**
 * Creates a React context for global user state.
 * @constant
 */
export const UserContext = createContext();

/**
 * Custom hook to consume the UserContext.
 *
 * @function useUser
 * @returns {Object} An object with { user, dispatch } from the UserContext.
 *
 * @example
 * const { user, dispatch } = useUser();
 */
export const useUser = () => useContext(UserContext);

/**
 * A reducer function that updates the user state based on action types.
 *
 * @function userReducer
 * @param {Object|null} state - The current user state (null if no user).
 * @param {Object} action - The action object containing { type, payload }.
 * @returns {Object|null} The updated user state or null upon logout.
 *
 * @example
 * dispatch({ type: "LOGIN", payload: { user, token } });
 */
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

/**
 * The UserProvider component that wraps the application. It uses a reducer
 * to store and manage user information in context.
 *
 * @component
 * @param {Object} props - The component's props.
 * @param {React.ReactNode} props.children - Child components that will have access to the user context.
 * @returns {JSX.Element} The provider component that wraps its children.
 *
 * @example
 * // In App.js:
 * <UserProvider>
 *   <App />
 * </UserProvider>
 */
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
