import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import RecipeList from './components/RecipeList/RecipeList';
import RecipeDetail from './components/RecipeDetail/RecipeDetail';
import RecipeForm from './components/RecipeForm/RecipeForm';
import { recipes as initialRecipes } from './data/recipes';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('list');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    cuisine: '',
    maxCookTime: '',
    difficulty: ''
  });

  useEffect(() => {
    const savedRecipes = localStorage.getItem('userRecipes');
    const savedFavorites = localStorage.getItem('recipeFavorites');
    
    if (savedRecipes) {
      const userRecipes = JSON.parse(savedRecipes);
      setAllRecipes([...initialRecipes, ...userRecipes]);
    } else {
      setAllRecipes(initialRecipes);
    }
    
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    const userRecipes = allRecipes.filter(recipe => recipe.isUserRecipe);
    localStorage.setItem('userRecipes', JSON.stringify(userRecipes));
    localStorage.setItem('recipeFavorites', JSON.stringify(favorites));
  }, [allRecipes, favorites]);

  useEffect(() => {
    let result = allRecipes;

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
      result = result.filter(recipe => recipe.cookTime <= parseInt(filters.maxCookTime));
    }

    if (filters.difficulty) {
      result = result.filter(recipe => recipe.difficulty === filters.difficulty);
    }

    setFilteredRecipes(result);
  }, [searchTerm, filters, allRecipes]);

  const handleRecipeSelect = (recipe) => {
    setSelectedRecipe(recipe);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedRecipe(null);
  };

  const handleAddToFavorites = (recipe) => {
    if (!favorites.find(fav => fav.id === recipe.id)) {
      setFavorites([...favorites, recipe]);
    }
  };

  const handleRemoveFromFavorites = (recipeId) => {
    setFavorites(favorites.filter(fav => fav.id !== recipeId));
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleAddRecipe = (newRecipe) => {
    const recipeWithId = {
      ...newRecipe,
      id: Date.now(),
      isUserRecipe: true
    };
    setAllRecipes([...allRecipes, recipeWithId]);
    setCurrentView('list');
  };

  const handleDeleteRecipe = (recipeId) => {
    setAllRecipes(allRecipes.filter(recipe => recipe.id !== recipeId));
    setFavorites(favorites.filter(fav => fav.id !== recipeId));
    if (selectedRecipe && selectedRecipe.id === recipeId) {
      setCurrentView('list');
      setSelectedRecipe(null);
    }
  };

  return (
    <div className="app">
      <Header 
        onViewChange={setCurrentView}
        currentView={currentView}
        favoritesCount={favorites.length}
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
          />
        )}
        
        {currentView === 'detail' && selectedRecipe && (
          <RecipeDetail
            recipe={selectedRecipe}
            isFavorite={favorites.some(fav => fav.id === selectedRecipe.id)}
            onBack={handleBackToList}
            onAddToFavorites={handleAddToFavorites}
            onRemoveFromFavorites={handleRemoveFromFavorites}
            onDeleteRecipe={handleDeleteRecipe}
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
          />
        )}
        
        {currentView === 'add' && (
          <RecipeForm
            onSubmit={handleAddRecipe}
            onCancel={() => setCurrentView('list')}
          />
        )}
      </div>
    </div>
  );
}

export default App;