import React from "react";
import "./Pagination.css";

/**
 * Pagination
 *
 * A lightweight pagination component that includes:
 *  - Previous/Next buttons
 *  - Current page and total pages display
 *  - Hides itself if totalPages <= 1
 *
 * @component
 * @param {Object} props
 * @param {number} props.currentPage - The current page number.
 * @param {number} props.totalPages - The total number of pages available.
 * @param {Function} props.setPage - A setter function to change the page number.
 * @returns {JSX.Element|null} The pagination control, or null if only 1 page.
 */
const Pagination = ({ currentPage, totalPages, setPage }) => {
    if (totalPages <= 1) return null; // Hide pagination if only 1 page

    return (
        <div className="pagination">
            <button
                onClick={() => setPage(currentPage - 1)}
                className="pagination-btn"
                disabled={currentPage === 1}
            >
                Previous
            </button>
            <span className="pagination-info">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => setPage(currentPage + 1)}
                className="pagination-btn"
                disabled={currentPage === totalPages}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
