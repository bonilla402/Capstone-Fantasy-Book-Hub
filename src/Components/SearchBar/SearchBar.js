import React, { useState } from "react";
import "./SearchBar.css";

const SearchBar = ({ onSearch, hideGroupFilters = false }) => {
    const initialFilters = {
        author: "",
        title: "",
        topic: "",
        groupTitle: "",
        groupDescription: ""
    };

    const [filters, setFilters] = useState(initialFilters);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(filters);
        }
    };

    const handleReset = () => {
        setFilters(initialFilters);
        if (onSearch) {
            onSearch(initialFilters);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="search-form">
            <div className="search-fields">
                <input type="text" name="author" placeholder="Author" value={filters.author} onChange={handleChange}
                       className="search-input"/>
                <input type="text" name="title" placeholder="Book Title" value={filters.title} onChange={handleChange}
                       className="search-input"/>
                <input type="text" name="topic" placeholder="Book Topic" value={filters.topic} onChange={handleChange}
                       className="search-input"/>
                {!hideGroupFilters && (
                    <>
                        <input type="text" name="groupTitle" placeholder="Group Title" value={filters.groupTitle}
                               onChange={handleChange} className="search-input"/>
                        <input type="text" name="groupDescription" placeholder="Group Description"
                               value={filters.groupDescription} onChange={handleChange} className="search-input"/>
                    </>
                )}
            </div>
            <div className="search-buttons">
                <button type="submit" className="search-button">Search</button>
                <button type="button" className="reset-button" onClick={handleReset}>Reset</button>
            </div>
        </form>
    );
};

export default SearchBar;
