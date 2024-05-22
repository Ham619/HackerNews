import React, { useState, useEffect, useReducer } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import './NewsCard.css';
import Header from './Header';
import click from '../Assets/click.mp3'

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
      article.title?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  useEffect(() => {
    const hoverSound = new Audio(click);

    const playSound = () => {
      hoverSound.currentTime = 0; // Reset sound to start
      hoverSound.play();
    };

    const items = document.querySelectorAll('.article-list-item');

    items.forEach(item => {
      item.addEventListener('mouseenter', playSound);
    });

    return () => {
      items.forEach(item => {
        item.removeEventListener('mouseover', playSound);
      });
    };
  }, [displayedArticles]);

  return (
    <div className="container">
      <Header 
        searchQuery={searchQuery} 
        handleSearchChange={handleSearchChange} 
      />
      {isLoading.isLoading && <div className="loading">Loading...</div>}
      {!isLoading.isLoading && (
        <>
          <div className="article-container">
          <ul className="article-list">
            {displayedArticles.map(article => (
              <li key={article.id} className="article-list-item">
                <span className="article-title">{article.title}</span>
                <div className="article-details">
                  <p>By: {`${article.by} |`}</p>
                  <p>Type: {`${article.type} |`}</p>
                  <p>Time: {formatDate(article.time)}</p>
                </div>
                <a href={article.url} className="read-more" target="_blank" rel="noopener noreferrer">
                  {article.url}
                </a>
              </li>
            ))}
          </ul>
          </div>
          <ReactPaginate
            previousLabel={"Previous"}
            nextLabel={"Next"}
            breakLabel={"..."}
            breakClassName={"break-me"}
            pageCount={pageCount}
            marginPagesDisplayed={0} // Display only one page before and after the current page
            pageRangeDisplayed={3} // Display only 3 page numbers
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            subContainerClassName={"pages pagination"}
            activeClassName={"active"}
            pageLinkClassName={"page-link"} // Add custom class for page links
            previousLinkClassName={"page-link"} // Add custom class for previous link
            nextLinkClassName={"page-link"} // Add custom class for next link
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
