import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import ReviewForm from "../../Components/Reviews/ReviewForm";
import { UserProvider } from "../../UserContext";

describe("ReviewForm Component", () => {
    let mockOnSubmit, mockOnDelete, mockUserReview;

    beforeEach(() => {
        mockOnSubmit = jest.fn();
        mockOnDelete = jest.fn();
        mockUserReview = {
            id: 1,
            rating: 5,
            reviewText: "This is a great book!",
        };
    });

    test("renders correctly when no review exists", () => {
        render(
            <UserProvider>
                <ReviewForm userReview={null} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />
            </UserProvider>
        );

        expect(screen.getByRole("button", { name: /submit review/i })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
    });

    test("renders delete button when a user has already submitted a review", () => {
        render(
            <UserProvider>
                <ReviewForm userReview={mockUserReview} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />
            </UserProvider>
        );

        expect(screen.getByRole("button", { name: /update review/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /delete review/i })).toBeInTheDocument();
    });

    test("pre-fills form fields when editing an existing review", async () => {
        render(
            <UserProvider>
                <ReviewForm userReview={mockUserReview} onSubmit={mockOnSubmit} onDelete={mockOnDelete}/>
            </UserProvider>
        );

        await waitFor(() => {
            expect(screen.getByLabelText(/rating/i)).toHaveValue(5);
            expect(screen.getByLabelText(/review/i)).toHaveValue("This is a great book!");
        });

    });

    test("calls onSubmit when submitting a new review", () => {
        render(
            <UserProvider>
                <ReviewForm userReview={null} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />
            </UserProvider>
        );

        fireEvent.change(screen.getByLabelText(/rating/i), { target: { value: "4" } });
        fireEvent.change(screen.getByLabelText(/review/i), { target: { value: "Amazing book!" } });
        fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        expect(mockOnSubmit).toHaveBeenCalledWith({ rating: "4", reviewText: "Amazing book!" });
    });

    test("calls onSubmit when updating an existing review", () => {
        render(
            <UserProvider>
                <ReviewForm userReview={mockUserReview} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />
            </UserProvider>
        );

        fireEvent.change(screen.getByLabelText(/rating/i), { target: { value: "3" } });
        fireEvent.change(screen.getByLabelText(/review/i), { target: { value: "It was okay." } });
        fireEvent.click(screen.getByRole("button", { name: /update review/i }));

        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        expect(mockOnSubmit).toHaveBeenCalledWith({ rating: "3", reviewText: "It was okay." });
    });

    test("calls onDelete when delete button is clicked", () => {
        render(
            <UserProvider>
                <ReviewForm userReview={mockUserReview} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />
            </UserProvider>
        );

        fireEvent.click(screen.getByRole("button", { name: /delete review/i }));
        expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
});
