import React from 'react';
import './header.css';

const Header = ({ searchQuery, handleSearchChange, handleSearchClick }) => {
  return (
    <div className="header-container">
      <img
        className="header-logo"
        src="https://hn.algolia.com/public/899d76bbc312122ee66aaaff7f933d13.png"
        alt="Hacker News Logo"
      />
      <div className="SearchHeader_label">
        Search<br />Hacker News
      </div>
      <div className="search-container">
        <span className="SearchIcon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>
        <input
          type="search"
          placeholder="Search stories by title, url or author"
          className="search-input"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        {/* <button className="search-button" onClick={handleSearchClick}>
          Search
        </button> */}
      </div>
    </div>
  );
};

export default Header;
