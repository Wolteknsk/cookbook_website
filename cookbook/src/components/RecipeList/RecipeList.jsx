import React, { useState } from 'react';
import RecipeCard from '../RecipeCard/RecipeCard';
import './RecipeList.css';

const categories = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  dessert: "Десерт"
};

const cuisines = {
  italian: "Итальянская",
  russian: "Русская",
  european: "Европейская",
  american: "Американская",
  international: "Международная"
};

const difficulties = {
  easy: "Легко",
  medium: "Средне",
  hard: "Сложно"
};

const RecipeList = ({ 
  recipes = [], 
  favorites = [], 
  onRecipeSelect, 
  onAddToFavorites, 
  onRemoveFromFavorites,
  filters = {},
  onFilterChange,
  showFilters = true,
  title = "Все рецепты",
  onAddNew,
  user
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Фильтрация по поиску
  const filteredBySearch = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFilterChange = (filterType, value) => {
    if (onFilterChange) {
      onFilterChange({
        ...filters,
        [filterType]: value
      });
    }
  };

  return (
    <div className="recipe-list">
      <div className="list-header">
        <h1>{title} ({filteredBySearch.length})</h1>
        {user && (
          <button className="add-recipe-btn" onClick={onAddNew}>
            Добавить рецепт
          </button>
        )}
      </div>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Поиск рецептов по названию..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input-main"
        />
        {searchTerm && (
          <button 
            className="search-clear"
            onClick={() => setSearchTerm('')}
          >
            ✕
          </button>
        )}
      </div>
      
      {showFilters && (
        <div className="filters">
          <div className="filter-row">
            <select 
              className="filter-select"
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">Все категории</option>
              {Object.entries(categories).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>

            <select 
              className="filter-select"
              value={filters.cuisine || ''}
              onChange={(e) => handleFilterChange('cuisine', e.target.value)}
            >
              <option value="">Все кухни</option>
              {Object.entries(cuisines).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>

            <select 
              className="filter-select"
              value={filters.maxCookTime || ''}
              onChange={(e) => handleFilterChange('maxCookTime', e.target.value)}
            >
              <option value="">Любое время</option>
              <option value="15">До 15 мин</option>
              <option value="30">До 30 мин</option>
              <option value="60">До 60 мин</option>
            </select>

            <select 
              className="filter-select"
              value={filters.difficulty || ''}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            >
              <option value="">Любая сложность</option>
              {Object.entries(difficulties).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {filteredBySearch.length === 0 ? (
        <div className="no-recipes">
          <p>Рецепты не найдены.</p>
          {searchTerm && (
            <p>По запросу <strong>"{searchTerm}"</strong> ничего не найдено</p>
          )}
          {user && (
            <button className="text-btn" onClick={onAddNew}>
              Добавить свой первый рецепт
            </button>
          )}
        </div>
      ) : (
        <div className="recipes-grid">
          {filteredBySearch.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={favorites.some(fav => fav && fav.id === recipe.id)}
              onSelect={onRecipeSelect}
              onAddToFavorites={onAddToFavorites}
              onRemoveFromFavorites={onRemoveFromFavorites}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeList;