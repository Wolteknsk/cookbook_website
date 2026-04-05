import React from 'react';
import { FiBookOpen, FiHeart, FiPlus } from 'react-icons/fi';
import './Header.css';

const Header = ({ onViewChange, currentView, favoritesCount, onSearch }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={() => onViewChange('list')}>
          <FiBookOpen className="logo-icon" />
          <span>Книга рецептов</span>
        </div>
        <div className="nav-buttons">
          <button 
            className={`nav-btn ${currentView === 'list' ? 'active' : ''}`}
            onClick={() => onViewChange('list')}
          >
            <FiBookOpen />
            <span>Все рецепты</span>
          </button>
          <button 
            className={`nav-btn ${currentView === 'favorites' ? 'active' : ''}`}
            onClick={() => onViewChange('favorites')}
          >
            <FiHeart />
            <span>Избранное ({favoritesCount})</span>
          </button>
          <button 
            className="nav-btn add-recipe-btn"
            onClick={() => onViewChange('add')}
          >
            <FiPlus />
            <span>Добавить рецепт</span>
          </button>
        </div>
      </div>
      {currentView === 'list' && (
        <div className="search-bar">
          <input
            type="text"
            placeholder="Поиск рецептов..."
            className="search-input"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      )}
    </header>
  );
};

export default Header;