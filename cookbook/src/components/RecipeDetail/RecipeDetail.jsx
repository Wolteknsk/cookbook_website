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

const RecipeDetail = ({ recipe, isFavorite, onBack, onAddToFavorites, onRemoveFromFavorites, onDeleteRecipe, user }) => {
  const handleFavoriteClick = () => {
    if (isFavorite) {
      onRemoveFromFavorites(recipe.id);
    } else {
      onAddToFavorites(recipe);
    }
  };

  const handleDeleteClick = async () => {
  if (window.confirm('Вы уверены, что хотите удалить этот рецепт?')) {
    try {
      const response = await fetch(`http://localhost:3002/api/recipes/${recipe.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Рецепт удален');
        onDeleteRecipe(recipe.id);
      } else {
        alert(data.error || 'Ошибка при удалении');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка соединения с сервером');
    }
  }
};

  const favoriteIcon = isFavorite ? "♥" : "♡";
  const canDelete = recipe.user_id === user?.id;

  // Получаем изображения шагов
  const stepImages = recipe.step_images || [];

  return (
    <div className="recipe-detail">
      <div className="detail-header">
        <img 
          src={recipe.image ? `http://localhost:3002${recipe.image}` : 'https://via.placeholder.com/800x400?text=No+Image'} 
          alt={recipe.name} 
          className="detail-image" 
        />
        <div className="detail-header-buttons">
          <button className="detail-back" onClick={onBack}>
            ← Назад
          </button>
          {canDelete && (
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
            <span className="author-name">Автор: {recipe.author_name || 'Пользователь'}</span>
          </div>
          <button 
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
          >
            {favoriteIcon}
          </button>
        </div>
        
        <div className="detail-meta">
          <span>Время: {recipe.cook_time} минут</span>
          <span>Сложность: {difficulties[recipe.difficulty]}</span>
          <span>Категория: {categories[recipe.category]}</span>
          <span>Кухня: {cuisines[recipe.cuisine]}</span>
        </div>
        
        {recipe.description && (
          <p className="detail-description">{recipe.description}</p>
        )}
        
        <div className="detail-section">
          <h2 className="section-title">Ингредиенты</h2>
          <ul className="ingredients-list">
            {recipe.ingredients?.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
        
        <div className="detail-section">
          <h2 className="section-title">Способ приготовления</h2>
          <div className="instructions-container">
            {recipe.instructions?.map((instruction, index) => (
              <div key={index} className="instruction-step">
                <div className="step-number-large">{index + 1}</div>
                <div className="step-content">
                  <p className="step-text">{instruction}</p>
                  {stepImages[index] && (
                    <div className="step-image">
                      <img src={`http://localhost:3002${stepImages[index]}`} alt={`Шаг ${index + 1}`} />
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