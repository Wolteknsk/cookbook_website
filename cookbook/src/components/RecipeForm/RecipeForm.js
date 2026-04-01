import React, { useState } from 'react';
import './RecipeForm.css';

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

const RecipeForm = ({ onSubmit, onCancel }) => {
  const [recipe, setRecipe] = useState({
    name: '',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    description: '',
    category: 'dinner',
    cuisine: 'russian',
    cookTime: 30,
    difficulty: 'medium',
    ingredients: [''],
    instructions: ['']
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe({
      ...recipe,
      [name]: name === 'cookTime' ? parseInt(value) : value
    });
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = value;
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...recipe.instructions];
    newInstructions[index] = value;
    setRecipe({ ...recipe, instructions: newInstructions });
  };

  const addIngredient = () => {
    setRecipe({ ...recipe, ingredients: [...recipe.ingredients, ''] });
  };

  const removeIngredient = (index) => {
    const newIngredients = recipe.ingredients.filter((_, i) => i !== index);
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const addInstruction = () => {
    setRecipe({ ...recipe, instructions: [...recipe.instructions, ''] });
  };

  const removeInstruction = (index) => {
    const newInstructions = recipe.instructions.filter((_, i) => i !== index);
    setRecipe({ ...recipe, instructions: newInstructions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const filteredRecipe = {
      ...recipe,
      ingredients: recipe.ingredients.filter(ing => ing.trim() !== ''),
      instructions: recipe.instructions.filter(step => step.trim() !== '')
    };
    
    onSubmit(filteredRecipe);
  };

  return (
    <div className="recipe-form">
      <h1>Добавить новый рецепт</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <label>
            Название рецепта *
            <input
              type="text"
              name="name"
              value={recipe.name}
              onChange={handleChange}
              required
              placeholder="Введите название рецепта"
            />
          </label>
        </div>

        <div className="form-section">
          <label>
            Описание рецепта
            <textarea
              name="description"
              value={recipe.description}
              onChange={handleChange}
              placeholder="Краткое описание рецепта"
              rows="3"
            />
          </label>
        </div>

        <div className="form-row">
          <div className="form-section">
            <label>
              Категория
              <select name="category" value={recipe.category} onChange={handleChange}>
                {Object.entries(categories).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-section">
            <label>
              Кухня
              <select name="cuisine" value={recipe.cuisine} onChange={handleChange}>
                {Object.entries(cuisines).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="form-row">
          <div className="form-section">
            <label>
              Время приготовления (минут) *
              <input
                type="number"
                name="cookTime"
                value={recipe.cookTime}
                onChange={handleChange}
                min="1"
                max="300"
                required
              />
            </label>
          </div>

          <div className="form-section">
            <label>
              Сложность
              <select name="difficulty" value={recipe.difficulty} onChange={handleChange}>
                {Object.entries(difficulties).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="form-section">
          <label>Ингредиенты *</label>
          {recipe.ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-row">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                placeholder={`Ингредиент ${index + 1}`}
                required={index === 0}
              />
              {recipe.ingredients.length > 1 && (
                <button 
                  type="button" 
                  className="remove-btn"
                  onClick={() => removeIngredient(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" className="add-btn" onClick={addIngredient}>
            + Добавить ингредиент
          </button>
        </div>

        <div className="form-section">
          <label>Шаги приготовления *</label>
          {recipe.instructions.map((instruction, index) => (
            <div key={index} className="instruction-row">
              <div className="step-number">{index + 1}</div>
              <textarea
                value={instruction}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
                placeholder={`Шаг ${index + 1}`}
                rows="2"
                required={index === 0}
              />
              {recipe.instructions.length > 1 && (
                <button 
                  type="button" 
                  className="remove-btn"
                  onClick={() => removeInstruction(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" className="add-btn" onClick={addInstruction}>
            + Добавить шаг
          </button>
        </div>

        <div className="form-section">
          <label>
            Ссылка на изображение (необязательно)
            <input
              type="url"
              name="image"
              value={recipe.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Отмена
          </button>
          <button type="submit" className="submit-btn">
            Опубликовать рецепт
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm;