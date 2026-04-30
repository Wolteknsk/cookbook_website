import React from 'react';
import './RecipeDetail.css';

const categories = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  dessert: 'Десерт'
};

const cuisines = {
  italian: 'Итальянская',
  russian: 'Русская',
  european: 'Европейская',
  american: 'Американская',
  international: 'Международная'
};

const difficulties = {
  easy: 'Легко',
  medium: 'Средне',
  hard: 'Сложно'
};

const RecipeDetail = ({ recipe, isFavorite, onBack, onAddToFavorites, onRemoveFromFavorites, onDeleteRecipe, user , showAlert }) => {
  const handleFavoriteClick = () => {
    if (isFavorite) {
      onRemoveFromFavorites(recipe.id);
    } else {
      onAddToFavorites(recipe);
    }
  };

  const handleDeleteClick = async () => {
    if (window.confirm('Вы уверены, что хотите удалить этот рецепт?')) {
      console.log('Deleting recipe:', recipe.id);
      console.log('User ID:', user?.id);
    
    try {
      const response = await fetch('http://localhost:3002/api/recipes/' + recipe.id, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: user?.id })
      });
      
      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', data);
      
      if (response.ok) {
        showAlert('Рецепт удален', 'success');
        onDeleteRecipe(recipe.id);
      } else if (response.status === 404) {
        // Рецепт уже удалён или не найден
        showAlert('Рецепт уже удален', 'info');
        onDeleteRecipe(recipe.id);
      } else {
        showAlert(data.error || 'Ошибка при удалении рецепта', 'error');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      showAlert('Ошибка при соединении с сервером', 'error');
    }
  }
};

  const favoriteIcon = isFavorite ? '♥' : '♡';
  
  const canDelete = user && recipe.user_id === user.id;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return 'http://localhost:3002' + imagePath;
  };

  const mainImageUrl = getImageUrl(recipe.image);

  let ingredientsArray = [];
  if (Array.isArray(recipe.ingredients)) {
    ingredientsArray = recipe.ingredients;
  } else if (typeof recipe.ingredients === 'string') {
    try {
      ingredientsArray = JSON.parse(recipe.ingredients);
    } catch(e) {
      ingredientsArray = [];
    }
  }

  let instructionsArray = [];
  if (Array.isArray(recipe.instructions)) {
    instructionsArray = recipe.instructions;
  } else if (typeof recipe.instructions === 'string') {
    try {
      instructionsArray = JSON.parse(recipe.instructions);
    } catch(e) {
      instructionsArray = [];
    }
  }

  let stepImagesArray = [];
  if (Array.isArray(recipe.step_images)) {
    stepImagesArray = recipe.step_images;
  } else if (typeof recipe.step_images === 'string') {
    try {
      stepImagesArray = JSON.parse(recipe.step_images);
    } catch(e) {
      stepImagesArray = [];
    }
  }

  return (
    <div className="recipe-detail">
      <div className="detail-header">
        {mainImageUrl ? (
          <img src={mainImageUrl} alt={recipe.name} className="detail-image" />
        ) : (
          <div className="detail-image-placeholder">Нет изображения</div>
        )}
        <div className="detail-header-buttons">
          <button className="detail-back" onClick={onBack}>
            Назад
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
            {user && recipe.user_id === user.id && (
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
          <span>Время: {recipe.cook_time || recipe.cookTime || 30} минут</span>
          <span>Сложность: {difficulties[recipe.difficulty] || recipe.difficulty || 'Средне'}</span>
          <span>Категория: {categories[recipe.category] || recipe.category || 'Обед'}</span>
          <span>Кухня: {cuisines[recipe.cuisine] || recipe.cuisine || 'Русская'}</span>
        </div>
        
        {recipe.description && (
          <p className="detail-description">{recipe.description}</p>
        )}
        
        <div className="detail-section">
          <h2 className="section-title">Ингредиенты</h2>
          <ul className="ingredients-list">
            {ingredientsArray.length > 0 ? (
              ingredientsArray.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))
            ) : (
              <li>Ингредиенты не указаны</li>
            )}
          </ul>
        </div>
        
        <div className="detail-section">
          <h2 className="section-title">Приготовление</h2>
          <div className="instructions-container">
            {instructionsArray.length > 0 ? (
              instructionsArray.map((instruction, index) => (
                <div key={index} className="instruction-step">
                  <div className="step-number-large">{index + 1}</div>
                  <div className="step-content">
                    <p className="step-text">{typeof instruction === 'string' ? instruction : instruction.text}</p>
                    {stepImagesArray[index] && (
                      <div className="step-image">
                        <img src={'http://localhost:3002' + stepImagesArray[index]} alt={'Шаг ' + (index + 1)} />
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>Инструкции не указаны</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;