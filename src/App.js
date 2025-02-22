import React from "react";
import { UserProvider } from "./UserContext";
import NavBar from "./Components/Navbar/NavBar";
import Routes from "./Routes/Routes";
import "./Styles/Global.css";

/**
 * App.js
 *
 * The root component of the Fantasy Book Hub client application. It wraps the
 * entire application with the UserProvider (for global user state) and renders
 * a NavBar along with the main routing structure.
 *
 * @component
 * @returns {JSX.Element} The top-level app component.
 */
function App() {
    return (
        <UserProvider>
            <div className="app-container">
                <NavBar />
                <Routes />
            </div>
        </UserProvider>
    );
}

export default App;
