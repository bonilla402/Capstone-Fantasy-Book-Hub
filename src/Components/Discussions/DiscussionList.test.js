import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DiscussionList from "../../Components/Discussions/DiscussionList";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";

// Mock the API call
jest.mock("../../Api/FantasyBookHubApi");

describe("DiscussionList Component", () => {
    const mockDiscussions = [
        {
            id: 1,
            title: "Best Fantasy Books",
            content: "Let's discuss the best fantasy books.",
            created_by: "User1",
            created_at: "2024-02-25T12:00:00Z",
            message_count: 5,
            book: {
                id: 101,
                title: "The Hobbit",
                cover_image: "https://example.com/hobbit.jpg",
                authors: ["J.R.R. Tolkien"],
            },
        },
        {
            id: 2,
            title: "Sci-Fi Classics",
            content: "What are the must-read sci-fi books?",
            created_by: "User2",
            created_at: "2024-02-26T15:30:00Z",
            message_count: 8,
            book: {
                id: 102,
                title: "Dune",
                cover_image: "https://example.com/dune.jpg",
                authors: ["Frank Herbert"],
            },
        },
    ];

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("renders loading message initially", () => {
        render(<DiscussionList groupId={1} />);
        expect(screen.getByText("Loading discussions...")).toBeInTheDocument();
    });

    test("renders discussions when data is available", async () => {
        FantasyBookHubApi.getDiscussions.mockResolvedValueOnce(mockDiscussions);

        render(
            <MemoryRouter>
                <DiscussionList groupId={1} />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText("Best Fantasy Books")).toBeInTheDocument());
        expect(screen.getByText("Sci-Fi Classics")).toBeInTheDocument();
    });

    test("displays error message on API failure", async () => {
        FantasyBookHubApi.getDiscussions.mockRejectedValueOnce(new Error("Failed to fetch"));

        render(<DiscussionList groupId={1} />);

        await waitFor(() => expect(screen.getByText("Failed to load discussions. Please try again later.")).toBeInTheDocument());
    });

    test("shows 'No discussions found' when API returns empty list", async () => {
        FantasyBookHubApi.getDiscussions.mockResolvedValueOnce([]);

        render(<DiscussionList groupId={1} />);

        await waitFor(() => expect(screen.getByText("No discussions found.")).toBeInTheDocument());
    });

    test("does not fetch discussions if groupId is missing", () => {
        render(<DiscussionList groupId={null} />);
        expect(FantasyBookHubApi.getDiscussions).not.toHaveBeenCalled();
    });
});
