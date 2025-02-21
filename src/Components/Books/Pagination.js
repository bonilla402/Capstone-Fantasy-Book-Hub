import React from "react";
import "./Pagination.css";

const Pagination = ({ currentPage, totalPages, setPage }) => {
    if (totalPages <= 1) return null; // ✅ Hide pagination if only 1 page

    return (
        <div className="pagination">
            <button
                onClick={() => setPage(currentPage - 1)}
                className="pagination-btn"
                disabled={currentPage === 1}
            >
                Previous
            </button>
            <span className="pagination-info">Page {currentPage} of {totalPages}</span>
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
