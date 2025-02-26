import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useUser } from "../../UserContext";
import NavBar from "./NavBar";

jest.mock("../../UserContext");

describe("NavBar Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renders logo and navigation links when user is logged out", () => {
        useUser.mockReturnValue({ user: null, dispatch: jest.fn() });

        render(
            <MemoryRouter>
                <NavBar />
            </MemoryRouter>
        );


        expect(screen.getByAltText("Fantasy Book Hub Logo")).toBeInTheDocument();


        expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /register/i })).toBeInTheDocument();

        expect(screen.queryByRole("link", { name: /books/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: /logout/i })).not.toBeInTheDocument();
    });

    test("renders navigation links when user is logged in", () => {
        useUser.mockReturnValue({
            user: { username: "TestUser" },
            dispatch: jest.fn(),
        });

        render(
            <MemoryRouter>
                <NavBar />
            </MemoryRouter>
        );

        // ✅ Search by visible text
        expect(screen.getByText("Books")).toBeInTheDocument();
        expect(screen.getByText("TestUser")).toBeInTheDocument();
        expect(screen.getByText("Logout")).toBeInTheDocument();

        // ✅ Ensure guest links are NOT visible
        expect(screen.queryByText("Login")).not.toBeInTheDocument();
        expect(screen.queryByText("Register")).not.toBeInTheDocument();
    });

    test("clicking logout calls dispatch with 'LOGOUT'", () => {
        const mockDispatch = jest.fn();
        useUser.mockReturnValue({
            user: { username: "TestUser" },
            dispatch: mockDispatch,
        });

        render(
            <MemoryRouter>
                <NavBar />
            </MemoryRouter>
        );

        const logoutButton = screen.getByRole("link", { name: /logout/i });

        fireEvent.click(logoutButton);

        expect(mockDispatch).toHaveBeenCalledWith({ type: "LOGOUT" });
    });
});
