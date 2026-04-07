import React from 'react';
import './Header.css';

const Header = ({ onViewChange, currentView, favoritesCount, onSearch }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={() => onViewChange('list')}>
          <span>Кулинарная</span> книга
        </div>
        <div className="nav-buttons">
          <button 
            className={`nav-btn ${currentView === 'list' ? 'active' : ''}`}
            onClick={() => onViewChange('list')}
          >
            Все рецепты
          </button>
          <button 
            className={`nav-btn ${currentView === 'favorites' ? 'active' : ''}`}
            onClick={() => onViewChange('favorites')}
          >
            Избранное ({favoritesCount})
          </button>
          <button 
            className="nav-btn add-recipe-btn"
            onClick={() => onViewChange('add')}
          >
            Добавить рецепт
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