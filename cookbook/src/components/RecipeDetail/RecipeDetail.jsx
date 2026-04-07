import React from 'react';
import './RecipeDetail.css';

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

const RecipeDetail = ({ recipe, isFavorite, onBack, onAddToFavorites, onRemoveFromFavorites, onDeleteRecipe }) => {
  const handleFavoriteClick = () => {
    if (isFavorite) {
      onRemoveFromFavorites(recipe.id);
    } else {
      onAddToFavorites(recipe);
    }
  };

  const handleDeleteClick = () => {
    if (window.confirm('Вы уверены, что хотите удалить этот рецепт?')) {
      onDeleteRecipe(recipe.id);
    }
  };

  const favoriteIcon = isFavorite ? "♥" : "♡";

  return (
    <div className="recipe-detail">
      <div className="detail-header">
        <img src={recipe.image} alt={recipe.name} className="detail-image" />
        <div className="detail-header-buttons">
          <button className="detail-back" onClick={onBack}>
            ← Назад
          </button>
          {recipe.isUserRecipe && (
            <button className="delete-btn" onClick={handleDeleteClick}>
              Удалить
            </button>
          )}
        </div>
      </div>
      
      <div className="detail-content">
        <div className="detail-title-row">
          <div>
            <h1 className="detail-title">{recipe.name}</h1>
            {recipe.isUserRecipe && (
              <span className="user-recipe-badge">Ваш рецепт</span>
            )}
          </div>
          <button 
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
          >
            {favoriteIcon}
          </button>
        </div>
        
        <div className="detail-meta">
          <span>Время: {recipe.cookTime} минут</span>
          <span>Сложность: {difficulties[recipe.difficulty]}</span>
          <span>Категория: {categories[recipe.category]}</span>
          <span>Кухня: {cuisines[recipe.cuisine]}</span>
        </div>
        
        {recipe.description && (
          <p className="detail-description">
            {recipe.description}
          </p>
        )}
        
        <div className="detail-section">
          <h2 className="section-title">Ингредиенты</h2>
          <ul className="ingredients-list">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
        
        <div className="detail-section">
          <h2 className="section-title">Способ приготовления</h2>
          <div className="instructions-container">
            {recipe.instructions.map((instruction, index) => (
              <div key={index} className="instruction-step">
                <div className="step-number-large">{index + 1}</div>
                <div className="step-content">
                  <p className="step-text">{instruction.text}</p>
                  {instruction.image && (
                    <div className="step-image">
                      <img src={instruction.image} alt={`Шаг ${index + 1}`} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;