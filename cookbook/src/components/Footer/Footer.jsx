import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Кулинарная книга</h3>
          <p>Твои любимые рецепты всегда под рукой</p>
          <p>Делитесь своими кулинарными шедеврами с миром</p>
        </div>

        <div className="footer-section">
          <h3>Разделы</h3>
          <ul>
            <li><a href="#" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Главная</a></li>
            <li><a href="#" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'favorites' }))}>Избранное</a></li>
            <li><a href="#" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'add' }))}>Добавить рецепт</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Контакты</h3>
          <ul>
            <li>Email: info@cookbook.com</li>
            <li>Telegram: @cookbook_support</li>
            <li>Телефон: +7 (999) 123-45-67</li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Социальные сети</h3>
          <div className="social-links">
            <a href="#" target="_blank" rel="noopener noreferrer">VK</a>
            <a href="#" target="_blank" rel="noopener noreferrer">Telegram</a>
            <a href="#" target="_blank" rel="noopener noreferrer">YouTube</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Кулинарная книга. Все права защищены.</p>
        <p>Создано с любовью для любителей вкусно готовить</p>
      </div>
    </footer>
  );
};

export default Footer;