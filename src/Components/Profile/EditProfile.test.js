import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditProfile from "../../Components/Profile/EditProfile";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import { MemoryRouter } from "react-router-dom";
import { useUser } from "../../UserContext";

// Mock `useNavigate`
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

// Mock `useUser`
jest.mock("../../UserContext", () => ({
    useUser: jest.fn(),
}));

// Mock API
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

        useUser.mockReturnValue({ user: mockUser, dispatch: mockDispatch });
        jest.clearAllMocks();
    });

    test("redirects to login if no user is logged in", () => {
        useUser.mockReturnValue({ user: null, dispatch: mockDispatch });
        
        render(
            <MemoryRouter>
                <EditProfile />
            </MemoryRouter>
        );

        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    test("pre-fills form fields with existing user data", () => {
        render(
            <MemoryRouter>
                <EditProfile />
            </MemoryRouter>
        );

        expect(screen.getByLabelText(/Username:/i)).toHaveValue("testuser");
        expect(screen.getByLabelText(/Email:/i)).toHaveValue("test@example.com");
        expect(screen.getByLabelText(/New Password/i)).toHaveValue("");
    });

    test("updates state when input fields change", () => {
        render(
            <MemoryRouter>
                <EditProfile />
            </MemoryRouter>
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
            <MemoryRouter>
                <EditProfile />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/username:/i), { target: { value: "updateduser" } });
        fireEvent.change(screen.getByLabelText(/email:/i), { target: { value: "updated@example.com" } });
        fireEvent.click(screen.getByRole("button", { name: /update profile/i }));
        
        await screen.findByText(/profile updated successfully!/i);
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/profile");
        }, { timeout: 2000 });
    });

    test("handles API error correctly", async () => {
        FantasyBookHubApi.updateUser.mockRejectedValueOnce(["Something went wrong"]);

        render(
            <MemoryRouter>
                <EditProfile />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText(/Update Profile/i));
        
        await waitFor(() => expect(screen.getByText("Something went wrong")).toBeInTheDocument());
    });
});
