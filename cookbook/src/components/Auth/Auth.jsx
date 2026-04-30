import React, { useState } from 'react';
import { authService } from '../../services/auth';
import './Auth.css';

const Auth = ({ onClose, onLoginSuccess, showAlert }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await authService.login(email, password);
        if (showAlert) showAlert('Добро пожаловать, ' + result.user.name, 'success');
        onLoginSuccess(result.user);
        onClose();
      } else {
        await authService.register(email, password, name);
        if (showAlert) showAlert('Регистрация успешна! Теперь войдите в систему', 'success');
        const result = await authService.login(email, password);
        onLoginSuccess(result.user);
        onClose();
      }
    } catch (err) {
      setError(err.error || 'Произошла ошибка');
      if (showAlert) showAlert(err.error || 'Ошибка при входе', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal">
      <div className="auth-container">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
        
        <div className="auth-tabs">
          <button className={isLogin ? 'active' : ''} onClick={() => setIsLogin(true)}>Вход</button>
          <button className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>Регистрация</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input type="text" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} required />
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}</button>
        </form>
        
      </div>
    </div>
  );
};

export default Auth;