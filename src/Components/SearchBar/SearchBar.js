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
                <input type="text" name="author" placeholder="Author" value={filters.author} onChange={handleChange} className="search-input" />
                <input type="text" name="title" placeholder="Book Title" value={filters.title} onChange={handleChange} className="search-input" />
                <input type="text" name="topic" placeholder="Book Topic" value={filters.topic} onChange={handleChange} className="search-input" />
                <input type="text" name="groupTitle" placeholder="Group Title" value={filters.groupTitle} onChange={handleChange} className="search-input" />
                <input type="text" name="groupDescription" placeholder="Group Description" value={filters.groupDescription} onChange={handleChange} className="search-input" />
            </div>
            <button type="submit" className="search-button">Search</button>
        </form>
    );
};

export default SearchBar;
