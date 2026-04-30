import React from 'react';
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

const RecipeCard = ({ recipe, isFavorite, onSelect, onAddToFavorites, onRemoveFromFavorites, user }) => {
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (isFavorite) {
      onRemoveFromFavorites(recipe.id);
    } else {
      onAddToFavorites(recipe);
    }
  };
  const isUserRecipe = user && recipe.user_id === user.id;
  const favoriteIcon = isFavorite ? "♥" : "♡";

  return (
    <div className="recipe-card" onClick={() => onSelect(recipe)}>
      <img 
        src={recipe.image ? `http://localhost:3002${recipe.image}` : 'https://via.placeholder.com/300x200?text=No+Image'} 
        alt={recipe.name} 
        className="recipe-image" 
      />
      {isUserRecipe && (
        <div className="user-badge">
          Ваш рецепт
        </div>
      )}
      <div className="recipe-content">
        <div className="recipe-header">
          <h3 className="recipe-title">{recipe.name}</h3>
          <button 
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
          >
            {favoriteIcon}
          </button>
        </div>
        
        <div className="recipe-meta">
          <span className="meta-item">{recipe.cook_time || recipe.cookTime || '?'} мин</span>
          <span className="meta-item">{difficulties[recipe.difficulty]}</span>
          <span className="meta-item">{categories[recipe.category]}</span>
        </div>
        
        <p className="recipe-description">{recipe.description}</p>
      </div>
    </div>
  );
};

export default RecipeCard;