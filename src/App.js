import React from "react";
import { UserProvider } from "./UserContext";
import NavBar from "./Components/Navbar/NavBar";
import Routes from "./Routes/Routes";
import "./Styles/Global.css";

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
