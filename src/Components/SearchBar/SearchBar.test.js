import { render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "../../Components/SearchBar/SearchBar";

describe("SearchBar Component", () => {
    let mockOnSearch;

    beforeEach(() => {
        mockOnSearch = jest.fn();
    });

    test("renders all input fields and buttons", () => {
        render(<SearchBar onSearch={mockOnSearch} />);

        expect(screen.getByPlaceholderText("Author")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Book Title")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Book Topic")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Group Title")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Group Description")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
    });

    test("does not render group filters when hideGroupFilters is true", () => {
        render(<SearchBar onSearch={mockOnSearch} hideGroupFilters={true} />);

        expect(screen.getByPlaceholderText("Author")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Book Title")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Book Topic")).toBeInTheDocument();
        expect(screen.queryByPlaceholderText("Group Title")).not.toBeInTheDocument();
        expect(screen.queryByPlaceholderText("Group Description")).not.toBeInTheDocument();
    });

    test("updates state on input change", () => {
        render(<SearchBar onSearch={mockOnSearch} />);

        const authorInput = screen.getByPlaceholderText("Author");
        fireEvent.change(authorInput, { target: { value: "J.K. Rowling" } });

        expect(authorInput).toHaveValue("J.K. Rowling");
    });

    test("calls onSearch with filter values when submitted", () => {
        render(<SearchBar onSearch={mockOnSearch} />);

        fireEvent.change(screen.getByPlaceholderText("Author"), { target: { value: "J.K. Rowling" } });
        fireEvent.change(screen.getByPlaceholderText("Book Title"), { target: { value: "Harry Potter" } });
        fireEvent.click(screen.getByRole("button", { name: /search/i }));

        expect(mockOnSearch).toHaveBeenCalledWith({
            author: "J.K. Rowling",
            title: "Harry Potter",
            topic: "",
            groupTitle: "",
            groupDescription: "",
        });
    });

    test("calls onSearch with empty filters when reset", () => {
        render(<SearchBar onSearch={mockOnSearch} />);

        fireEvent.change(screen.getByPlaceholderText("Author"), { target: { value: "J.K. Rowling" } });
        fireEvent.click(screen.getByRole("button", { name: /reset/i }));

        expect(mockOnSearch).toHaveBeenCalledWith({
            author: "",
            title: "",
            topic: "",
            groupTitle: "",
            groupDescription: "",
        });
    });
});
