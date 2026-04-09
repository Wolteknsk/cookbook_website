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

const RecipeForm = ({ onSubmit, onCancel, user }) => {
  const [recipe, setRecipe] = useState({
    name: '',
    description: '',
    category: 'dinner',
    cuisine: 'russian',
    cook_time: 30,
    difficulty: 'medium',
    ingredients: [''],
    instructions: ['']
  });

  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [mainImageName, setMainImageName] = useState('');
  const [stepImages, setStepImages] = useState([]);
  const [stepImagesPreviews, setStepImagesPreviews] = useState([]);
  const [stepImagesNames, setStepImagesNames] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe({
      ...recipe,
      [name]: name === 'cook_time' ? parseInt(value) : value
    });
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
      setMainImageName(file.name);
    }
  };

  const handleStepImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newStepImages = [...stepImages];
      const newPreviews = [...stepImagesPreviews];
      const newNames = [...stepImagesNames];
      newStepImages[index] = file;
      newPreviews[index] = URL.createObjectURL(file);
      newNames[index] = file.name;
      setStepImages(newStepImages);
      setStepImagesPreviews(newPreviews);
      setStepImagesNames(newNames);
    }
  };

  const removeStepImage = (index) => {
    const newStepImages = [...stepImages];
    const newPreviews = [...stepImagesPreviews];
    const newNames = [...stepImagesNames];
    newStepImages[index] = null;
    newPreviews[index] = '';
    newNames[index] = '';
    setStepImages(newStepImages);
    setStepImagesPreviews(newPreviews);
    setStepImagesNames(newNames);
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
    setStepImages([...stepImages, null]);
    setStepImagesPreviews([...stepImagesPreviews, '']);
    setStepImagesNames([...stepImagesNames, '']);
  };

  const removeInstruction = (index) => {
    const newInstructions = recipe.instructions.filter((_, i) => i !== index);
    const newStepImages = stepImages.filter((_, i) => i !== index);
    const newPreviews = stepImagesPreviews.filter((_, i) => i !== index);
    const newNames = stepImagesNames.filter((_, i) => i !== index);
    setRecipe({ ...recipe, instructions: newInstructions });
    setStepImages(newStepImages);
    setStepImagesPreviews(newPreviews);
    setStepImagesNames(newNames);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Пожалуйста, войдите в систему');
      return;
    }

    if (!recipe.name.trim()) {
      alert('Введите название рецепта');
      return;
    }

    const validIngredients = recipe.ingredients.filter(ing => ing.trim() !== '');
    const validInstructions = recipe.instructions.filter(step => step.trim() !== '');

    if (validIngredients.length === 0) {
      alert('Добавьте хотя бы один ингредиент');
      return;
    }

    if (validInstructions.length === 0) {
      alert('Добавьте хотя бы один шаг приготовления');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('user_id', user.id);
    formData.append('name', recipe.name);
    formData.append('description', recipe.description);
    formData.append('category', recipe.category);
    formData.append('cuisine', recipe.cuisine);
    formData.append('cook_time', recipe.cook_time);
    formData.append('difficulty', recipe.difficulty);
    formData.append('ingredients', JSON.stringify(validIngredients));
    formData.append('instructions', JSON.stringify(validInstructions));

    if (mainImage) {
      formData.append('mainImage', mainImage);
    }

    validInstructions.forEach((_, index) => {
      if (stepImages[index]) {
        formData.append('stepImages', stepImages[index]);
      }
    });

    try {
      const response = await fetch('http://localhost:3002/api/recipes', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Рецепт успешно добавлен!');
        onSubmit(result);
      } else {
        alert(result.error || 'Ошибка при создании рецепта');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при создании рецепта');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="recipe-form">
        <h1>Добавить рецепт</h1>
        <div className="auth-required">
          <p>Пожалуйста, войдите в систему, чтобы добавлять рецепты</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recipe-form">
      <h1>Новый рецепт</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <label>Название рецепта *</label>
          <input
            type="text"
            name="name"
            value={recipe.name}
            onChange={handleChange}
            placeholder="Введите название"
            required
          />
        </div>

        <div className="form-section">
          <label>Описание</label>
          <textarea
            name="description"
            value={recipe.description}
            onChange={handleChange}
            placeholder="Краткое описание блюда"
            rows="3"
          />
        </div>

        <div className="form-section">
          <label>Главное фото блюда</label>
          <div className="file-upload-wrapper">
            <input
              type="file"
              id="mainImage"
              accept="image/*"
              onChange={handleMainImageChange}
              className="file-upload-input"
            />
            <label htmlFor="mainImage" className="file-upload-btn">
              📷 Выберите фото
            </label>
            {mainImageName && (
              <div className="file-name">
                📄 {mainImageName}
              </div>
            )}
          </div>
          {mainImagePreview && (
            <div className="image-preview">
              <img src={mainImagePreview} alt="Главное фото" />
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-section">
            <label>Категория</label>
            <select name="category" value={recipe.category} onChange={handleChange}>
              {Object.entries(categories).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <label>Кухня</label>
            <select name="cuisine" value={recipe.cuisine} onChange={handleChange}>
              {Object.entries(cuisines).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-section">
            <label>Время приготовления (мин)</label>
            <input
              type="number"
              name="cook_time"
              value={recipe.cook_time}
              onChange={handleChange}
              min="1"
              max="300"
            />
          </div>

          <div className="form-section">
            <label>Сложность</label>
            <select name="difficulty" value={recipe.difficulty} onChange={handleChange}>
              {Object.entries(difficulties).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section">
          <label>Ингредиенты *</label>
          {recipe.ingredients.map((ingredient, index) => (
            <div key={index} className="dynamic-row">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                placeholder={`Ингредиент ${index + 1}`}
              />
              {recipe.ingredients.length > 1 && (
                <button type="button" className="remove-btn" onClick={() => removeIngredient(index)}>
                  ✕
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
            <div key={index} className="instruction-block">
              <div className="instruction-header">
                <span className="step-number">Шаг {index + 1}</span>
                {recipe.instructions.length > 1 && (
                  <button type="button" className="remove-btn" onClick={() => removeInstruction(index)}>
                    ✕
                  </button>
                )}
              </div>
              <textarea
                value={instruction}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
                placeholder={`Опишите шаг ${index + 1}`}
                rows="3"
              />
              <div className="step-image-upload">
                <div className="step-image-label">Фото для этого шага</div>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    id={`stepImage_${index}`}
                    accept="image/*"
                    onChange={(e) => handleStepImageChange(index, e)}
                    className="file-upload-input"
                  />
                  <label htmlFor={`stepImage_${index}`} className="step-image-btn">
                    📷 Выбрать фото
                  </label>
                  {stepImagesNames[index] && (
                    <div className="file-name" style={{ marginTop: '8px' }}>
                      📄 {stepImagesNames[index]}
                    </div>
                  )}
                </div>
                {stepImagesPreviews[index] && (
                  <div className="image-preview-small">
                    <img src={stepImagesPreviews[index]} alt={`Шаг ${index + 1}`} />
                    <button 
                      type="button" 
                      className="remove-image-btn"
                      onClick={() => removeStepImage(index)}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <button type="button" className="add-btn" onClick={addInstruction}>
            + Добавить шаг
          </button>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Отмена
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Сохранение...' : 'Опубликовать рецепт'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm;