import React from "react";
import { UserProvider } from "./UserContext";
import NavBar from "./NavBar";
import Routes from "./Routes";

function App() {
    return (
        <UserProvider>
            <NavBar />
            <Routes />
        </UserProvider>
    );
}

export default App;
