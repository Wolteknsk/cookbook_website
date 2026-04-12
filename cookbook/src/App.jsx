import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import RecipeList from './components/RecipeList/RecipeList';
import Footer from './components/Footer/Footer';
import RecipeDetail from './components/RecipeDetail/RecipeDetail';
import RecipeForm from './components/RecipeForm/RecipeForm';
import { authService, recipeService } from './services/auth';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('list');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

const loadRecipes = async () => {
  try {
    const data = await recipeService.getAllRecipes();
    if (data && Array.isArray(data)) {
      setRecipes(data);
    } else {
      setRecipes([]);
    }
  } catch (error) {
    console.error('Ошибка загрузки рецептов:', error);
    setRecipes([]);
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
      alert('Войдите в систему, чтобы добавить в избранное');
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
    alert('Войдите в систему, чтобы добавить рецепт');
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
      setCurrentView('list');
    } catch (error) {
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
    return <div style={{ textAlign: 'center', padding: '50px' }}>Загрузка...</div>;
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
      />
      <div className="container">
        {currentView === 'list' && (
          <RecipeList
            recipes={recipes}
            favorites={favorites}
            onRecipeSelect={handleRecipeSelect}
            onAddToFavorites={handleAddToFavorites}
            onRemoveFromFavorites={handleRemoveFromFavorites}
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