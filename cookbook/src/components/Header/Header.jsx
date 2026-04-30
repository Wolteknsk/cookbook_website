import React, { useState } from 'react';
import Auth from '../Auth/Auth';
import './Header.css';

const Header = ({ onViewChange, currentView, favoritesCount, user, onLoginSuccess, onLogout, showAlert }) => {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="logo" onClick={() => onViewChange('list')}>
            <span>Кулинарная</span> книга
          </div>
          <div className="nav-buttons">
            <button className={`nav-btn ${currentView === 'list' ? 'active' : ''}`} onClick={() => onViewChange('list')}>
              Все рецепты
            </button>
            <button className={`nav-btn ${currentView === 'favorites' ? 'active' : ''}`} onClick={() => onViewChange('favorites')}>
              Избранное ({favoritesCount})
            </button>
            {user && (
              <button className="nav-btn add-recipe-btn" onClick={() => onViewChange('add')}>
                Добавить рецепт
              </button>
            )}
          </div>
          
          {user ? (
            <div className="user-menu">
              <span className="user-name">{user.name}</span>
              <button className="logout-btn" onClick={onLogout}>Выйти</button>
            </div>
          ) : (
            <button className="login-btn" onClick={() => setShowAuth(true)}>Войти</button>
          )}
        </div>
      </header>
      
      {showAuth && <Auth onClose={() => setShowAuth(false)} onLoginSuccess={onLoginSuccess} showAlert={showAlert} />}
    </>
  );
};

export default Header;