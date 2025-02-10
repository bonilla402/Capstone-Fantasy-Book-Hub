import React, { useState } from "react";
import "./SearchBar.css";

const SearchBar = ({ onSearch }) => {
    const [filters, setFilters] = useState({
        author: "",
        title: "",
        topic: "",
        groupTitle: "",
        groupDescription: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
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

    return (
        <form onSubmit={handleSubmit} className="search-form">
            <div className="search-fields">
                <label>
                    Author:
                    <input type="text" name="author" value={filters.author} onChange={handleChange} />
                </label>
                <label>
                    Book Title:
                    <input type="text" name="title" value={filters.title} onChange={handleChange} />
                </label>
                <label>
                    Book Topic:
                    <input type="text" name="topic" value={filters.topic} onChange={handleChange} />
                </label>
                <label>
                    Group Title:
                    <input type="text" name="groupTitle" value={filters.groupTitle} onChange={handleChange} />
                </label>
                <label>
                    Group Description:
                    <input type="text" name="groupDescription" value={filters.groupDescription} onChange={handleChange} />
                </label>
            </div>
            <button type="submit" className="search-button">Search</button>
        </form>
    );
};

export default SearchBar;
