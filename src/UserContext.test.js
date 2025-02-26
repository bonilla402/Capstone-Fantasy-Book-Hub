import { render, screen, fireEvent } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react-hooks";
import { UserProvider, useUser } from "./UserContext";
import FantasyBookHubApi from "./Api/FantasyBookHubApi";

// Mock API
jest.mock("./Api/FantasyBookHubApi", () => ({
    token: null,
    logout: jest.fn(),
}));

/**
 * A test component to interact with UserContext inside tests.
 */
const TestComponent = () => {
    const { user, dispatch } = useUser();

    return (
        <div>
            <p data-testid="username">{user ? user.username : "No User"}</p>
            <button onClick={() => dispatch({ type: "LOGOUT" })} data-testid="logout-btn">
                Logout
            </button>
        </div>
    );
};

describe("UserContext", () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test("initializes with user from localStorage", () => {
        localStorage.setItem("user", JSON.stringify({ username: "StoredUser" }));
        localStorage.setItem("token", "stored-token");

        render(
            <UserProvider>
                <TestComponent />
            </UserProvider>
        );

        expect(screen.getByTestId("username")).toHaveTextContent("StoredUser");
        expect(FantasyBookHubApi.token).toBe("stored-token");
    });

    test("handles LOGIN action correctly", () => {
        const { result } = renderHook(() => useUser(), { wrapper: UserProvider });

        act(() => {
            result.current.dispatch({
                type: "LOGIN",
                payload: { user: { username: "NewUser" }, token: "new-token" },
            });
        });
        
        expect(result.current.user.username).toBe("NewUser");
        expect(localStorage.getItem("user")).toEqual(JSON.stringify({ username: "NewUser" }));
        expect(localStorage.getItem("token")).toBe("new-token");
        expect(FantasyBookHubApi.token).toBe("new-token");
    });

    test("handles LOGOUT action correctly", () => {
        localStorage.setItem("user", JSON.stringify({ username: "TestUser" }));
        localStorage.setItem("token", "test-token");

        render(
            <UserProvider>
                <TestComponent />
            </UserProvider>
        );

        const logoutButton = screen.getByTestId("logout-btn");

        act(() => {
            fireEvent.click(logoutButton);
        });
        
        expect(screen.getByTestId("username")).toHaveTextContent("No User");
        expect(localStorage.getItem("user")).toBeNull();
        expect(localStorage.getItem("token")).toBeNull();
        expect(FantasyBookHubApi.logout).toHaveBeenCalled();
    });

    test("handles UPDATE_PROFILE action correctly", () => {
        const { result } = renderHook(() => useUser(), { wrapper: UserProvider });

        act(() => {
            result.current.dispatch({
                type: "LOGIN",
                payload: { user: { username: "OldUser", email: "old@example.com" }, token: "valid-token" },
            });
        });

        act(() => {
            result.current.dispatch({
                type: "UPDATE_PROFILE",
                payload: { username: "UpdatedUser" },
            });
        });
        
        expect(result.current.user.username).toBe("UpdatedUser");
        expect(JSON.parse(localStorage.getItem("user")).username).toBe("UpdatedUser");
    });
});
