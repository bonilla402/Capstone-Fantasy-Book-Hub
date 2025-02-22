import React, { useState } from "react";
import "./SearchBar.css";

/**
 * SearchBar
 *
 * A flexible search form that collects filters for searching books (author, title, topic)
 * and optionally groups (groupTitle, groupDescription).
 * When the user submits the form, the `onSearch` callback is invoked with the current filter values.
 *
 * @component
 * @param {Object} props
 * @param {Function} props.onSearch - A callback function that receives the filter object upon form submission.
 * @param {boolean} [props.hideGroupFilters=false] - If true, hides the groupTitle and groupDescription inputs.
 * @returns {JSX.Element} A styled search form with inputs for author, title, topic, and (optionally) group filters.
 */
const SearchBar = ({ onSearch, hideGroupFilters = false }) => {
    const initialFilters = {
        author: "",
        title: "",
        topic: "",
        groupTitle: "",
        groupDescription: ""
    };

    const [filters, setFilters] = useState(initialFilters);

    /**
     * Handles changes to each input field, updating local filter state accordingly.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value
        }));
    };

    /**
     * Submits the current filters to the `onSearch` callback if provided.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(filters);
        }
    };

    /**
     * Resets all filters to their initial values, optionally calling `onSearch` with empty filters.
     */
    const handleReset = () => {
        setFilters(initialFilters);
        if (onSearch) {
            onSearch(initialFilters);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="search-form">
            <div className="search-fields">
                <input
                    type="text"
                    name="author"
                    placeholder="Author"
                    value={filters.author}
                    onChange={handleChange}
                    className="search-input"
                />
                <input
                    type="text"
                    name="title"
                    placeholder="Book Title"
                    value={filters.title}
                    onChange={handleChange}
                    className="search-input"
                />
                <input
                    type="text"
                    name="topic"
                    placeholder="Book Topic"
                    value={filters.topic}
                    onChange={handleChange}
                    className="search-input"
                />
                {!hideGroupFilters && (
                    <>
                        <input
                            type="text"
                            name="groupTitle"
                            placeholder="Group Title"
                            value={filters.groupTitle}
                            onChange={handleChange}
                            className="search-input"
                        />
                        <input
                            type="text"
                            name="groupDescription"
                            placeholder="Group Description"
                            value={filters.groupDescription}
                            onChange={handleChange}
                            className="search-input"
                        />
                    </>
                )}
            </div>
            <div className="search-buttons">
                <button type="submit" className="search-button">
                    Search
                </button>
                <button type="button" className="reset-button" onClick={handleReset}>
                    Reset
                </button>
            </div>
        </form>
    );
};

export default SearchBar;
