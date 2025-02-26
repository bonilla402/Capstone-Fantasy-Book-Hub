import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { UserContext } from "../../UserContext";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import Login from "./Login";

jest.mock("../../Api/FantasyBookHubApi");

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

describe("Login Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renders login form correctly", () => {
        render(
            <MemoryRouter>
                <UserContext.Provider value={{ user: null, dispatch: mockDispatch }}>
                    <Login />
                </UserContext.Provider>
            </MemoryRouter>
        );

        expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    });

    test("allows user to type into input fields", () => {
        render(
            <MemoryRouter>
                <UserContext.Provider value={{ user: null, dispatch: mockDispatch }}>
                    <Login />
                </UserContext.Provider>
            </MemoryRouter>
        );

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);

        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });

        expect(emailInput.value).toBe("test@example.com");
        expect(passwordInput.value).toBe("password123");
    });

    test("calls FantasyBookHubApi.login and redirects on successful login", async () => {
        FantasyBookHubApi.login.mockResolvedValue({
            token: "fake-token",
            user: { id: 1, username: "testuser" },
        });

        render(
            <MemoryRouter>
                <UserContext.Provider value={{ user: null, dispatch: mockDispatch }}>
                    <Login />
                </UserContext.Provider>
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
        fireEvent.click(screen.getByRole("button", { name: /login/i }));

        await waitFor(() => {
            expect(FantasyBookHubApi.login).toHaveBeenCalledWith("test@example.com", "password123");
            expect(mockDispatch).toHaveBeenCalledWith({
                type: "LOGIN",
                payload: { user: { id: 1, username: "testuser" }, token: "fake-token" },
            });
            expect(mockNavigate).toHaveBeenCalledWith("/");
        });
    });

    test("displays error message on failed login", async () => {
        FantasyBookHubApi.login.mockRejectedValue(["Invalid credentials"]);

        render(
            <MemoryRouter>
                <UserContext.Provider value={{ user: null, dispatch: mockDispatch }}>
                    <Login />
                </UserContext.Provider>
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "wrong@example.com" } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrongpassword" } });
        fireEvent.click(screen.getByRole("button", { name: /login/i }));

        await waitFor(() => {
            expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
        });
    });
    
});
