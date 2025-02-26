import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import MessagesList from "../../Components/Messages/MessagesList";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import "@testing-library/jest-dom";

// Mock API calls
jest.mock("../../Api/FantasyBookHubApi");

describe("MessagesList Component", () => {
    const discussionId = 1;
    const mockMessages = [
        {
            id: 101,
            username: "Alice",
            content: "This is a test message.",
            created_at: "2024-02-26T15:30:00Z",
        },
        {
            id: 102,
            username: "Bob",
            content: "Hello, everyone!",
            created_at: "2024-02-26T16:45:00Z",
        },
    ];

    test("renders messages correctly", async () => {
        FantasyBookHubApi.getMessages.mockResolvedValueOnce(mockMessages);

        render(<MessagesList discussionId={discussionId} refreshMessages={0} />);

        expect(screen.getByText("Messages")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText("Alice")).toBeInTheDocument();
            expect(screen.getByText("This is a test message.")).toBeInTheDocument();
            expect(screen.getByText("Bob")).toBeInTheDocument();
            expect(screen.getByText("Hello, everyone!")).toBeInTheDocument();
        });
    });

    test("displays loading state initially", async () => {
        FantasyBookHubApi.getMessages.mockResolvedValueOnce([]);

        render(<MessagesList discussionId={discussionId} refreshMessages={0} />);

        expect(screen.getByText("Messages")).toBeInTheDocument();
        await waitFor(() => expect(screen.getByText("No messages yet. Start the discussion!")).toBeInTheDocument());
    });

    test("handles API error correctly", async () => {
        FantasyBookHubApi.getMessages.mockRejectedValueOnce(new Error("API Error"));

        render(<MessagesList discussionId={discussionId} refreshMessages={0} />);

        await waitFor(() => expect(screen.getByText("Failed to load messages.")).toBeInTheDocument());
    });

    test("updates messages when refreshMessages prop changes", async () => {
        FantasyBookHubApi.getMessages.mockResolvedValueOnce(mockMessages);

        const { rerender } = render(<MessagesList discussionId={discussionId} refreshMessages={0} />);

        await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());

        const newMessages = [
            {
                id: 103,
                username: "Charlie",
                content: "Another message!",
                created_at: "2024-02-27T10:00:00Z",
            },
        ];

        FantasyBookHubApi.getMessages.mockResolvedValueOnce(newMessages);

        rerender(<MessagesList discussionId={discussionId} refreshMessages={1} />);

        await waitFor(() => expect(screen.getByText("Charlie")).toBeInTheDocument());
    });
});
