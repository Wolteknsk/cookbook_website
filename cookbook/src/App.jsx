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
  const [filters, setFilters] = useState({
    category: '',
    cuisine: '',
    maxCookTime: '',
    difficulty: ''
  });

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

  // Фильтрация рецептов
  useEffect(() => {
    let result = [...recipes];

    // Поиск по названию
    if (searchTerm) {
      result = result.filter(recipe =>
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Фильтр по категории
    if (filters.category) {
      result = result.filter(recipe => recipe.category === filters.category);
    }

    // Фильтр по кухне
    if (filters.cuisine) {
      result = result.filter(recipe => recipe.cuisine === filters.cuisine);
    }

    // Фильтр по времени
    if (filters.maxCookTime) {
      result = result.filter(recipe => {
        const time = recipe.cook_time || recipe.cookTime || 0;
        return time <= parseInt(filters.maxCookTime);
      });
    }

    // Фильтр по сложности
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
    }
  };

  const handleAddToFavorites = async (recipe) => {
    if (!user) {
      alert('Войдите в систему');
      return;
    }
    try {
      await recipeService.addToFavorites(recipe.id);
      await loadFavorites();
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const handleRemoveFromFavorites = async (recipeId) => {
    try {
      await recipeService.removeFromFavorites(recipeId);
      await loadFavorites();
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const handleAddRecipe = async (newRecipe) => {
    if (!user) {
      alert('Войдите в систему');
      return;
    }
    try {
      await recipeService.createRecipe(newRecipe);
      await loadRecipes();
      setCurrentView('list');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при создании рецепта');
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    try {
      await recipeService.deleteRecipe(recipeId);
      await loadRecipes();
      await loadFavorites();
      if (selectedRecipe && selectedRecipe.id === recipeId) {
        setCurrentView('list');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при удалении');
    }
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    loadFavorites();
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setFavorites([]);
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="app">
      <Header
        onViewChange={setCurrentView}
        currentView={currentView}
        favoritesCount={favorites.length}
        user={user}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onSearch={handleSearch}
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
          />
        )}
      </div>

      <Footer />
    </div>
  );
}

export default App;