/**
 * FantasyBookHubApi.test.js
 *
 * Updated test suite for the FantasyBookHubApi class.
 * Ensures each static method calls the correct endpoint, method, and data shape,
 * and handles responses / localStorage usage appropriately.
 */

import axios from "axios";
import FantasyBookHubApi from "./FantasyBookHubApi";

// Mock axios for all tests
jest.mock("axios");

describe("FantasyBookHubApi", () => {
    // Example token used for testing
    const mockToken = "test-token";

    beforeEach(() => {
        // Clear localStorage and mock calls before each test
        localStorage.clear();
        jest.clearAllMocks();
    });

    // ======================
    // Authentication Tests
    // ======================
    describe("login", () => {
        test("calls the correct endpoint with email/password and returns response data", async () => {
            const mockResponse = {
                token: "fake-jwt",
                user: { id: 1, email: "test@example.com" },
            };
            axios.mockResolvedValueOnce({ data: mockResponse });

            const result = await FantasyBookHubApi.login("test@example.com", "password123");

            // Expect axios to be called with a matching config
            expect(axios).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: expect.stringContaining("/auth/login"),
                    method: "post",
                    data: { email: "test@example.com", password: "password123" },
                })
            );

            // login() does NOT set localStorage in the current implementation
            expect(result).toEqual(mockResponse);
            expect(localStorage.getItem("token")).toBeNull();
        });
    });

    describe("register", () => {
        test("calls /auth/register, sets token in localStorage, and returns response data", async () => {
            const mockResponse = {
                token: "new-token",
                user: { id: 2, username: "testuser", email: "demo@example.com" },
            };
            axios.mockResolvedValueOnce({ data: mockResponse });

            const result = await FantasyBookHubApi.register("testuser", "demo@example.com", "password456");

            expect(axios).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: expect.stringContaining("/auth/register"),
                    method: "post",
                    data: {
                        username: "testuser",
                        email: "demo@example.com",
                        password: "password456",
                    },
                })
            );

            // The register method DOES store the token in localStorage
            expect(localStorage.getItem("token")).toBe("new-token");
            expect(result).toEqual(mockResponse);
        });
    });

    describe("logout", () => {
        test("removes token from localStorage", () => {
            localStorage.setItem("token", mockToken);
            FantasyBookHubApi.logout();
            expect(localStorage.getItem("token")).toBeNull();
        });
    });

    // ======================
    // Groups Tests
    // ======================
    describe("getGroups", () => {
        test("calls /groups with GET params and returns data", async () => {
            const mockGroups = [{ id: 1, group_name: "Fantasy Readers" }];
            axios.mockResolvedValueOnce({ data: mockGroups });

            const result = await FantasyBookHubApi.getGroups({ author: "Tolkien" });

            expect(axios).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: expect.stringContaining("/groups"),
                    method: "get",
                    params: { author: "Tolkien" },
                })
            );
            expect(result).toEqual(mockGroups);
        });
    });

    describe("createGroup", () => {
        test("calls POST /groups with the provided data and returns created group", async () => {
            const mockNewGroup = { id: 10, group_name: "Sci-Fi Enthusiasts" };
            axios.mockResolvedValueOnce({ data: mockNewGroup });

            const data = { groupName: "Sci-Fi Enthusiasts", description: "A group for Sci-Fi fans" };
            const result = await FantasyBookHubApi.createGroup(data);

            expect(axios).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: expect.stringContaining("/groups"),
                    method: "post",
                    data,
                })
            );
            expect(result).toEqual(mockNewGroup);
        });
    });

    // ======================
    // Discussions Tests
    // ======================
    describe("getDiscussions", () => {
        test("calls /discussions/:groupId and returns an array of discussions", async () => {
            const mockDiscussions = [{ id: 50, title: "Favorite Dragon Characters" }];
            axios.mockResolvedValueOnce({ data: mockDiscussions });

            const result = await FantasyBookHubApi.getDiscussions(2);

            expect(axios).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: expect.stringContaining("/discussions/2"),
                    method: "get",
                })
            );
            expect(result).toEqual(mockDiscussions);
        });
    });

    // ======================
    // Books Tests
    // ======================
    describe("searchBooksDynamic", () => {
        test("calls GET /books/search/dynamic with query params and returns an array", async () => {
            const mockBooks = [{ id: 101, title: "The Hobbit", authors: ["J.R.R. Tolkien"] }];
            axios.get.mockResolvedValueOnce({ data: mockBooks });

            const result = await FantasyBookHubApi.searchBooksDynamic("hob");
            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining("/books/search/dynamic"),
                { params: { query: "hob" } }
            );
            expect(result).toEqual(mockBooks);
        });
    });

    describe("getBook", () => {
        test("fetches book details for a given bookId", async () => {
            const mockBook = { id: 200, title: "Dune", authors: ["Frank Herbert"] };
            axios.mockResolvedValueOnce({ data: mockBook });

            const result = await FantasyBookHubApi.getBook(200);
            expect(axios).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: expect.stringContaining("/books/200"),
                    method: "get",
                })
            );
            expect(result).toEqual(mockBook);
        });
    });

    // ======================
    // Reviews Tests
    // ======================
    describe("addReview", () => {
        test("calls POST /reviews to add a new review", async () => {
            const mockReview = { id: 300, rating: 5, reviewText: "Fantastic read!" };
            axios.mockResolvedValueOnce({ data: mockReview });

            const result = await FantasyBookHubApi.addReview(10, 5, "Fantastic read!");

            expect(axios).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: expect.stringContaining("/reviews"),
                    method: "post",
                    data: { bookId: 10, rating: 5, reviewText: "Fantastic read!" },
                })
            );
            expect(result).toEqual(mockReview);
        });
    });
});
