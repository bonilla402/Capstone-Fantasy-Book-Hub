import React from "react";
import { UserProvider } from "./UserContext";
import NavBar from "./NavBar";
import Routes from "./Routes";
import "./App.css";

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
