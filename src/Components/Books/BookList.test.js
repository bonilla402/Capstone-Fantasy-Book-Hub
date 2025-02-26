import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookList from "./BookList";
import FantasyBookHubApi from "../../Api/FantasyBookHubApi";
import { MemoryRouter } from "react-router-dom";

// Mock API
jest.mock("../../Api/FantasyBookHubApi");

describe("BookList Component", () => {
    const mockBooks = [
        { id: 1, title: "The Hobbit", authors: ["J.R.R. Tolkien"] },
        { id: 2, title: "Dune", authors: ["Frank Herbert"] },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renders without crashing and displays books", async () => {
        FantasyBookHubApi.searchBooks.mockResolvedValueOnce({
            books: mockBooks,
            totalBooks: 2,
        });

        render(
            <MemoryRouter>
                <BookList />
            </MemoryRouter>
        );

        expect(screen.getByText("No books available.")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText("The Hobbit")).toBeInTheDocument();
            expect(screen.getByText("Dune")).toBeInTheDocument();
        });

        expect(FantasyBookHubApi.searchBooks).toHaveBeenCalledTimes(1);
    });

    test("displays message when no books are found", async () => {
        FantasyBookHubApi.searchBooks.mockResolvedValueOnce({
            books: [],
            totalBooks: 0,
        });

        render(
            <MemoryRouter>
                <BookList />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("No books available.")).toBeInTheDocument();
        });

        expect(FantasyBookHubApi.searchBooks).toHaveBeenCalledTimes(1);
    });

    test("search updates book list", async () => {
        FantasyBookHubApi.searchBooks.mockResolvedValueOnce({
            books: mockBooks,
            totalBooks: 2,
        });

        render(
            <MemoryRouter>
                <BookList />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText("The Hobbit")).toBeInTheDocument());

        FantasyBookHubApi.searchBooks.mockResolvedValueOnce({
            books: [{ id: 3, title: "Harry Potter", authors: ["J.K. Rowling"] }],
            totalBooks: 1,
        });

        fireEvent.change(screen.getByPlaceholderText("Book Title"), {
            target: { value: "Harry" },
        });
        fireEvent.click(screen.getByText("Search"));

        await waitFor(() => {
            expect(screen.getByText("Harry Potter")).toBeInTheDocument();
            expect(screen.queryByText("The Hobbit")).not.toBeInTheDocument();
        });

        expect(FantasyBookHubApi.searchBooks).toHaveBeenCalledTimes(2);
    });
    
});
