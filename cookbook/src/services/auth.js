const API_URL = 'http://localhost:3002/api';

export const authService = {
  async login(email, password) {
    try {
      console.log('Отправка запроса на:', `${API_URL}/auth/login`);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      console.log('Ответ сервера:', data);
      
      if (response.ok) {
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
      } else {
        throw { error: data.error || 'Ошибка входа' };
      }
    } catch (error) {
      console.error('Ошибка:', error);
      throw { error: 'Ошибка соединения с сервером' };
    }
  },

  async register(email, password, name) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
      } else {
        throw { error: data.error || 'Ошибка регистрации' };
      }
    } catch (error) {
      console.error('Ошибка:', error);
      throw { error: 'Ошибка соединения с сервером' };
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};

export const recipeService = {
  async getAllRecipes() {
    try {
      const response = await fetch(`${API_URL}/recipes`);
      return await response.json();
    } catch (error) {
      console.error('Ошибка:', error);
      return [];
    }
  },

  async getRecipeById(id) {
    try {
      const response = await fetch(`${API_URL}/recipes/${id}`);
      if (!response.ok) throw new Error('Рецепт не найден');
      return await response.json();
    } catch (error) {
      console.error('Ошибка получения рецепта:', error);
      throw error;
    }
  },

  async createRecipe(recipeData) {
    const user = authService.getCurrentUser();
    const response = await fetch(`${API_URL}/recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...recipeData, user_id: user?.id })
    });
    return response.json();
  },

  async getFavorites() {
    const user = authService.getCurrentUser();
    if (!user) return [];
    const response = await fetch(`${API_URL}/favorites/${user.id}`);
    return response.json();
  },

  async addToFavorites(recipeId) {
    const user = authService.getCurrentUser();
    const response = await fetch(`${API_URL}/favorites/${recipeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user?.id })
    });
    return response.json();
  },

  async removeFromFavorites(recipeId) {
    const user = authService.getCurrentUser();
    const response = await fetch(`${API_URL}/favorites/${recipeId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user?.id })
    });
    return response.json();
  }
};