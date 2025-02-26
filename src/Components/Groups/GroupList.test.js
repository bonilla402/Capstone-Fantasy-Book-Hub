import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GroupList from "../../Components/Groups/GroupList";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";

// Mock API calls
jest.mock("../../Api/FantasyBookHubApi");

describe("GroupList Component", () => {
    const mockGroups = [
        {
            id: 1,
            group_name: "Fantasy Readers",
            description: "A group for fantasy book lovers.",
            created_by: "User1",
            member_count: 10,
            discussion_count: 5,
        },
        {
            id: 2,
            group_name: "Sci-Fi Enthusiasts",
            description: "A group for science fiction fans.",
            created_by: "User2",
            member_count: 15,
            discussion_count: 8,
        },
    ];

    test("renders loading message initially", () => {
        FantasyBookHubApi.getGroups.mockResolvedValueOnce([]);

        render(
            <MemoryRouter>
                <GroupList />
            </MemoryRouter>
        );

        expect(screen.getByText("Loading groups...")).toBeInTheDocument();
    });

    test("renders groups properly", async () => {
        FantasyBookHubApi.getGroups.mockResolvedValueOnce(mockGroups);

        render(
            <MemoryRouter>
                <GroupList />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText("Fantasy Readers")).toBeInTheDocument());
        expect(screen.getByText("Sci-Fi Enthusiasts")).toBeInTheDocument();
    });

    test("renders error message if API fails", async () => {
        FantasyBookHubApi.getGroups.mockRejectedValueOnce(new Error("API Error"));

        render(
            <MemoryRouter>
                <GroupList />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText("Failed to load groups. Please try again later.")).toBeInTheDocument());
    });

    test("renders no groups message when no groups exist", async () => {
        FantasyBookHubApi.getGroups.mockResolvedValueOnce([]);

        render(
            <MemoryRouter>
                <GroupList />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText("No groups found.")).toBeInTheDocument());
    });
});

