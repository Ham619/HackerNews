import React, { useState, useEffect, useReducer } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import './NewsCard.css'; // Make sure to create an appropriate CSS file to style pagination

const NewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [isLoading, dispatchLoading] = useReducer(loadingReducer, { count: 0, isLoading: false });
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState([]);
  const articlesPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      dispatchLoading({ type: 'LOADING_START' });
      try {
        const { data } = await axios.get("https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty");
        const articlePromises = data.slice(0, 100).map(async (id) => {
          const { data: articleData } = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`);
          return articleData;
        });
        const fetchedArticles = await Promise.all(articlePromises);
        setArticles(fetchedArticles);
        setFilteredArticles(fetchedArticles);
        setPageCount(Math.ceil(fetchedArticles.length / articlesPerPage));
      } catch (err) {
        console.error(err);
      } finally {
        dispatchLoading({ type: 'LOADING_FINISH' });
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 500); // debounce search by 500ms
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    const filtered = articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredArticles(filtered);
    setPageCount(Math.ceil(filtered.length / articlesPerPage));
    setCurrentPage(0); // Reset to the first page when search is performed
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const startIndex = currentPage * articlesPerPage;
  const displayedArticles = filteredArticles.slice(startIndex, startIndex + articlesPerPage);

  return (
    <div className="container">
      <h1 className="heading">Hacker News Articles</h1>
      <div className="search-container">
        <input
          type="text"
          className="search-bar"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
      </div>
      {isLoading.isLoading && <div className="loading">Loading...</div>}
      {!isLoading.isLoading && (
        <>
          <ul className="article-list">
            {displayedArticles.map(article => (
              <li key={article.id} className="article-list-item">
                <span className="article-title">{article.title}</span>
                <a href={article.url} className="read-more" target="_blank" rel="noopener noreferrer">
                  Read more
                </a>
              </li>
            ))}
          </ul>
          <ReactPaginate
            previousLabel={"Previous"}
            nextLabel={"Next"}
            breakLabel={"..."}
            breakClassName={"break-me"}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            subContainerClassName={"pages pagination"}
            activeClassName={"active"}
          />
        </>
      )}
    </div>
  );
};

const loadingReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING_START':
      return { count: state.count + 1, isLoading: true };
    case 'LOADING_FINISH':
      return { count: state.count - 1, isLoading: state.count - 1 > 0 };
    default:
      return state;
  }
};
export default NewsPage;
