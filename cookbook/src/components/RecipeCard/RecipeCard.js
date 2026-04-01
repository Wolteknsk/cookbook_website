import React from 'react';
import { FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import './RecipeCard.css';

const categories = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  dessert: "Десерт"
};

const difficulties = {
  easy: "Легко",
  medium: "Средне",
  hard: "Сложно"
};

const RecipeCard = ({ recipe, isFavorite, onSelect, onAddToFavorites, onRemoveFromFavorites }) => {
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (isFavorite) {
      onRemoveFromFavorites(recipe.id);
    } else {
      onAddToFavorites(recipe);
    }
  };

  return (
    <div className="recipe-card" onClick={() => onSelect(recipe)}>
      <img src={recipe.image} alt={recipe.name} className="recipe-image" />
      {recipe.isUserRecipe && (
        <div className="user-badge">Ваш рецепт</div>
      )}
      <div className="recipe-content">
        <div className="recipe-header">
          <h3 className="recipe-title">{recipe.name}</h3>
          <button 
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
          >
            {isFavorite ? <FaHeart /> : <FiHeart />}
          </button>
        </div>
        
        <div className="recipe-meta">
          <span className="meta-item">
            <span className="meta-icon">⏱️</span> {recipe.cookTime} мин
          </span>
          <span className="meta-item">
            <span className="meta-icon">📊</span> {difficulties[recipe.difficulty]}
          </span>
          <span className="meta-item">
            <span className="meta-icon">🏷️</span> {categories[recipe.category]}
          </span>
        </div>
        
        <p className="recipe-description">{recipe.description}</p>
      </div>
    </div>
  );
};

export default RecipeCard;