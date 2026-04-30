const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3002;

// Папка для загрузок
const uploadDir = './server/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer настройки
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// База данных
const db = new sqlite3.Database('./server/cookbook.db');

// СОЗДАНИЕ ТАБЛИЦ
db.serialize(() => {
  // Пользователи
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL
    )
  `);

  // Рецепты
  db.run(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      image TEXT,
      category TEXT,
      cuisine TEXT,
      cook_time INTEGER,
      difficulty TEXT,
      ingredients TEXT,
      instructions TEXT,
      step_images TEXT
    )
  `);

  // Избранное (упрощенная версия)
  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      recipe_id INTEGER NOT NULL,
      UNIQUE(user_id, recipe_id)
    )
  `);

  // Тестовый пользователь
  db.get("SELECT * FROM users WHERE email = 'test@test.com'", (err, row) => {
    if (!row) {
      const hash = bcrypt.hashSync('123456', 10);
      db.run("INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
        ['test@test.com', hash, 'Тестовый пользователь']);
      console.log('Тестовый пользователь: test@test.com / 123456');
    }
  });
});

// ========== АВТОРИЗАЦИЯ ==========
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email и пароль обязательны' });

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (user) return res.status(400).json({ error: 'Пользователь уже существует' });

    const hash = bcrypt.hashSync(password, 10);
    const userName = name || email.split('@')[0];

    db.run('INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hash, userName],
      function(err) {
        if (err) return res.status(500).json({ error: 'Ошибка сервера' });
        res.json({ user: { id: this.lastID, email, name: userName }, token: 'token_' + this.lastID });
      });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email и пароль обязательны' });

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (!user) return res.status(401).json({ error: 'Неверный email или пароль' });
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Неверный email или пароль' });
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token: 'token_' + user.id });
  });
});

// ========== РЕЦЕПТЫ ==========
app.get('/api/recipes', (req, res) => {
  db.all('SELECT * FROM recipes ORDER BY id DESC', (err, recipes) => {
    if (err) return res.status(500).json({ error: 'Ошибка' });
    const result = recipes.map(r => ({
      ...r,
      ingredients: JSON.parse(r.ingredients || '[]'),
      instructions: JSON.parse(r.instructions || '[]'),
      step_images: JSON.parse(r.step_images || '[]')
    }));
    res.json(result);
  });
});

app.get('/api/recipes/:id', (req, res) => {
  db.get('SELECT * FROM recipes WHERE id = ?', [req.params.id], (err, recipe) => {
    if (err || !recipe) return res.status(404).json({ error: 'Рецепт не найден' });
    recipe.ingredients = JSON.parse(recipe.ingredients || '[]');
    recipe.instructions = JSON.parse(recipe.instructions || '[]');
    recipe.step_images = JSON.parse(recipe.step_images || '[]');
    res.json(recipe);
  });
});

app.post('/api/recipes', upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'stepImages', maxCount: 20 }]), (req, res) => {
  const { user_id, name, description, category, cuisine, cook_time, difficulty, ingredients, instructions } = req.body;
  if (!user_id || !name) return res.status(400).json({ error: 'Название и автор обязательны' });

  let mainImagePath = req.files['mainImage'] ? '/uploads/' + req.files['mainImage'][0].filename : null;
  let stepImagesPaths = req.files['stepImages'] ? req.files['stepImages'].map(f => '/uploads/' + f.filename) : [];

  db.run(`INSERT INTO recipes (user_id, name, description, image, category, cuisine, cook_time, difficulty, ingredients, instructions, step_images)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id, name, description || '', mainImagePath, category || 'dinner', cuisine || 'russian',
     cook_time || 30, difficulty || 'medium', JSON.stringify(ingredients || []), JSON.stringify(instructions || []), JSON.stringify(stepImagesPaths)],
    function(err) {
      if (err) return res.status(500).json({ error: 'Ошибка создания' });
      res.status(201).json({ id: this.lastID });
    });
});

app.delete('/api/recipes/:id', (req, res) => {
  const { user_id } = req.body;
  db.run('DELETE FROM recipes WHERE id = ? AND user_id = ?', [req.params.id, user_id], function(err) {
    if (err) return res.status(500).json({ error: 'Ошибка удаления' });
    res.json({ message: 'Удалено' });
  });
});

// ========== ИЗБРАННОЕ (ИСПРАВЛЕНО) ==========
app.post('/api/favorites/:recipeId', (req, res) => {
  const { user_id } = req.body;
  db.run('INSERT OR IGNORE INTO favorites (user_id, recipe_id) VALUES (?, ?)', [user_id, req.params.recipeId], (err) => {
    if (err) return res.status(500).json({ error: 'Ошибка добавления' });
    res.json({ message: 'Добавлено в избранное' });
  });
});

app.delete('/api/favorites/:recipeId', (req, res) => {
  const { user_id } = req.body;
  db.run('DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?', [user_id, req.params.recipeId], (err) => {
    if (err) return res.status(500).json({ error: 'Ошибка удаления' });
    res.json({ message: 'Удалено из избранного' });
  });
});

app.get('/api/favorites/:userId', (req, res) => {
  const userId = req.params.userId;
  
  db.all(`
    SELECT r.* 
    FROM recipes r 
    INNER JOIN favorites f ON r.id = f.recipe_id 
    WHERE f.user_id = ?
  `, [userId], (err, favorites) => {
    if (err) {
      console.error('Ошибка:', err);
      return res.status(500).json({ error: 'Ошибка получения избранного' });
    }
    
    const result = favorites.map(r => ({
      ...r,
      ingredients: JSON.parse(r.ingredients || '[]'),
      instructions: JSON.parse(r.instructions || '[]'),
      step_images: JSON.parse(r.step_images || '[]')
    }));
    
    res.json(result);
  });
});

// Проверка
app.get('/', (req, res) => {
  res.json({ message: 'Сервер работает!' });
});

// Запуск
app.listen(PORT, () => {
  console.log(`Сервер: http://localhost:${PORT}`);
  console.log(`test@test.com / 123456`);
});