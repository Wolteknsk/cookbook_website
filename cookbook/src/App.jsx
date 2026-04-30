import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import RecipeList from './components/RecipeList/RecipeList';
import RecipeDetail from './components/RecipeDetail/RecipeDetail';
import RecipeForm from './components/RecipeForm/RecipeForm';
import Footer from './components/Footer/Footer';
import { authService, recipeService } from './services/auth';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('list');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    cuisine: '',
    maxCookTime: '',
    difficulty: ''
  });

  const showAlert = (message, type = 'error') => {
    setAlertMessage({ text: message, type: type });
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    loadRecipes();
  }, []);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  useEffect(() => {
    let result = [...recipes];

    if (searchTerm) {
      result = result.filter(recipe =>
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.category) {
      result = result.filter(recipe => recipe.category === filters.category);
    }

    if (filters.cuisine) {
      result = result.filter(recipe => recipe.cuisine === filters.cuisine);
    }

    if (filters.maxCookTime) {
      result = result.filter(recipe => {
        const time = recipe.cook_time || recipe.cookTime || 0;
        return time <= parseInt(filters.maxCookTime);
      });
    }

    if (filters.difficulty) {
      result = result.filter(recipe => recipe.difficulty === filters.difficulty);
    }

    setFilteredRecipes(result);
  }, [searchTerm, filters, recipes]);

  const loadRecipes = async () => {
    try {
      const data = await recipeService.getAllRecipes();
      setRecipes(data);
    } catch (error) {
      console.error('Ошибка загрузки рецептов:', error);
      showAlert('Ошибка загрузки рецептов', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const data = await recipeService.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRecipeSelect = async (recipe) => {
    try {
      const fullRecipe = await recipeService.getRecipeById(recipe.id);
      setSelectedRecipe(fullRecipe);
      setCurrentView('detail');
    } catch (error) {
      console.error('Ошибка:', error);
      showAlert('Ошибка загрузки рецепта', 'error');
    }
  };

  const handleAddToFavorites = async (recipe) => {
    if (!user) {
      showAlert('Войдите в систему, чтобы добавить в избранное', 'warning');
      return;
    }
    try {
      await recipeService.addToFavorites(recipe.id);
      await loadFavorites();
      showAlert('Рецепт добавлен в избранное', 'success');
    } catch (error) {
      console.error('Ошибка:', error);
      showAlert('Ошибка при добавлении в избранное', 'error');
    }
  };

  const handleRemoveFromFavorites = async (recipeId) => {
    try {
      await recipeService.removeFromFavorites(recipeId);
      await loadFavorites();
      showAlert('Рецепт удален из избранного', 'success');
    } catch (error) {
      console.error('Ошибка:', error);
      showAlert('Ошибка при удалении из избранного', 'error');
    }
  };

  const handleAddRecipe = async (newRecipe) => {
    if (!user) {
      showAlert('Войдите в систему, чтобы добавить рецепт', 'warning');
      return;
    }
    try {
      await recipeService.createRecipe(newRecipe);
      await loadRecipes();
      setCurrentView('list');
      showAlert('Рецепт успешно добавлен', 'success');
    } catch (error) {
      console.error('Ошибка:', error);
      showAlert('Ошибка при создании рецепта', 'error');
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
  if (!user) {
    showAlert('Войдите в систему, чтобы удалить рецепт', 'warning');
    return;
  }
  try {
    const response = await fetch('http://localhost:3002/api/recipes/' + recipeId, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: user.id })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      await loadRecipes();
      await loadFavorites();
      if (selectedRecipe && selectedRecipe.id === recipeId) {
        setCurrentView('list');
      }
      showAlert('Рецепт удален', 'success');
    } else {
      showAlert(data.error || 'Ошибка при удалении рецепта', 'error');
    }
  } catch (error) {
    console.error('Ошибка:', error);
    showAlert('Ошибка соединения с сервером', 'error');
  }
};

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    loadFavorites();
    showAlert('Добро пожаловать, ' + loggedInUser.name, 'success');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setFavorites([]);
    showAlert('Вы вышли из системы', 'info');
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="app">
      {alertMessage && (
        <div className={`alert-message ${alertMessage.type === 'success' ? 'success' : alertMessage.type === 'warning' ? 'warning' : alertMessage.type === 'info' ? 'info' : ''}`}>
          {alertMessage.text}
        </div>
      )}
      
      <Header
        onViewChange={setCurrentView}
        currentView={currentView}
        favoritesCount={favorites.length}
        user={user}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onSearch={handleSearch}
        showAlert={showAlert}
      />

      <div className="container">
        {currentView === 'list' && (
          <RecipeList
            recipes={filteredRecipes}
            favorites={favorites}
            onRecipeSelect={handleRecipeSelect}
            onAddToFavorites={handleAddToFavorites}
            onRemoveFromFavorites={handleRemoveFromFavorites}
            filters={filters}
            onFilterChange={handleFilterChange}
            onAddNew={() => setCurrentView('add')}
            user={user}
          />
        )}

        {currentView === 'detail' && selectedRecipe && (
          <RecipeDetail
            recipe={selectedRecipe}
            isFavorite={favorites.some(fav => fav.id === selectedRecipe.id)}
            onBack={() => setCurrentView('list')}
            onAddToFavorites={handleAddToFavorites}
            onRemoveFromFavorites={handleRemoveFromFavorites}
            onDeleteRecipe={handleDeleteRecipe}
            user={user}
            showAlert={showAlert}
          />
        )}

        {currentView === 'favorites' && (
          <RecipeList
            recipes={favorites}
            favorites={favorites}
            onRecipeSelect={handleRecipeSelect}
            onAddToFavorites={handleAddToFavorites}
            onRemoveFromFavorites={handleRemoveFromFavorites}
            showFilters={false}
            title="Избранные рецепты"
            onAddNew={() => setCurrentView('add')}
            user={user}
          />
        )}

        {currentView === 'add' && (
          <RecipeForm
            onSubmit={handleAddRecipe}
            onCancel={() => setCurrentView('list')}
            user={user}
            showAlert={showAlert}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}

export default App;