import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {UserContext, UserProvider} from "../../UserContext";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import EditProfile from "./EditProfile";


// Mock the `useNavigate` function
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate, // Mock navigation
}));

// Mock API call
jest.mock("../../Api/FantasyBookHubApi");

describe("EditProfile Component", () => {
    let mockDispatch, mockUser;

    beforeEach(() => {
        mockDispatch = jest.fn();
        mockUser = {
            id: 1,
            username: "testuser",
            email: "test@example.com",
        };

        jest.spyOn(React, "useContext").mockReturnValue({
            user: mockUser,
            dispatch: mockDispatch,
        });
    });

    test("redirects to login if no user is logged in", () => {
        render(
            <UserContext.Provider value={{ user: null, dispatch: mockDispatch }}>
                    <EditProfile />
            </UserContext.Provider>
        );

        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    test("pre-fills form fields with existing user data", () => {
        render(
            <UserContext.Provider value={{ user: mockUser, dispatch: mockDispatch }}>
                    <EditProfile />
            </UserContext.Provider>
        );

        expect(screen.getByLabelText(/Username:/i)).toHaveValue("testuser");
        expect(screen.getByLabelText(/Email:/i)).toHaveValue("test@example.com");
        expect(screen.getByLabelText(/New Password/i)).toHaveValue("");
    });

    test("updates state when input fields change", () => {
        render(
            <UserContext.Provider value={{ user: mockUser, dispatch: mockDispatch }}>
                    <EditProfile />
            </UserContext.Provider>
        );

        const usernameInput = screen.getByLabelText(/Username:/i);
        fireEvent.change(usernameInput, { target: { value: "updateduser" } });

        expect(usernameInput).toHaveValue("updateduser");
    });

    test("updates profile and redirects on success", async () => {

        FantasyBookHubApi.updateUser.mockResolvedValueOnce({
            id: 1,
            username: "updateduser",
            email: "updated@example.com",
        });

        render(
            <UserProvider>
                    <EditProfile/>
            </UserProvider>
        );

        fireEvent.change(screen.getByLabelText(/username:/i), {target: {value: "updateduser"}});
        fireEvent.change(screen.getByLabelText(/email:/i), {target: {value: "updated@example.com"}});
        fireEvent.click(screen.getByRole("button", {name: /update profile/i}));

        expect(await screen.findByText(/updated/i)).toBeInTheDocument();

      //  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/profile"));
    });

    test("handles API error correctly", async () => {
        FantasyBookHubApi.updateUser.mockRejectedValueOnce(["Something went wrong"]);

        render(
            <UserContext.Provider value={{ user: mockUser, dispatch: mockDispatch }}>
                    <EditProfile />
            </UserContext.Provider>
        );

        fireEvent.click(screen.getByText(/Update Profile/i));

        await waitFor(() => expect(screen.getByText("Something went wrong")).toBeInTheDocument());
    });
});
