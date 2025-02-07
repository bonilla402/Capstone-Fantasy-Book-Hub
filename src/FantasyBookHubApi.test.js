import axios from "axios";
import FantasyBookHubApi from "./FantasyBookHubApi";

jest.mock("axios");

describe("FantasyBookHubApi", () => {
    const mockToken = "test-token";

    beforeEach(() => {
        localStorage.setItem("token", mockToken);
    });

    afterEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test("login should call API and store token", async () => {
        const mockResponse = { data: { token: "new-token" } };
        axios.mockResolvedValue(mockResponse);

        const token = await FantasyBookHubApi.login("testuser", "password");

        expect(axios).toHaveBeenCalledWith(expect.objectContaining({
            url: expect.stringContaining("auth/login"),
            method: "post",
            data: { username: "testuser", password: "password" }
        }));

        expect(localStorage.getItem("token")).toBe("new-token");
        expect(token).toBe("new-token");
    });

    test("logout should remove token from localStorage", () => {
        FantasyBookHubApi.logout();
        expect(localStorage.getItem("token")).toBeNull();
    });

    test("getGroups should fetch groups data", async () => {
        const mockGroups = { data: [{ id: 1, name: "Fantasy Lovers" }] };
        axios.mockResolvedValue(mockGroups);

        const groups = await FantasyBookHubApi.getGroups();
        expect(axios).toHaveBeenCalledWith(expect.objectContaining({
            url: expect.stringContaining("groups"),
            method: "get"
        }));

        expect(groups).toEqual(mockGroups.data);
    });

    test("getMessages should fetch messages for a discussion", async () => {
        const mockMessages = { data: [{ id: 1, content: "Hello world!" }] };
        axios.mockResolvedValue(mockMessages);

        const messages = await FantasyBookHubApi.getMessages(1);
        expect(axios).toHaveBeenCalledWith(expect.objectContaining({
            url: expect.stringContaining("discussions/1/messages"),
            method: "get"
        }));

        expect(messages).toEqual(mockMessages.data);
    });

    test("addMessage should post a new message", async () => {
        const mockResponse = { data: { id: 2, content: "New message" } };
        axios.mockResolvedValue(mockResponse);

        const message = await FantasyBookHubApi.addMessage(1, { content: "New message" });
        expect(axios).toHaveBeenCalledWith(expect.objectContaining({
            url: expect.stringContaining("discussions/1/messages"),
            method: "post",
            data: { content: "New message" }
        }));

        expect(message).toEqual(mockResponse.data);
    });
});
