import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import reportWebVitals from "./ReportWebVitals";
import "./Styles/Global.css";

/**
 * index.js
 *
 * The entry point for the React application. It:
 *  - Creates the React root.
 *  - Wraps the App component in React Router's BrowserRouter.
 *  - Optionally reports web vitals for performance measurements.
 *
 * @file
 */

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
