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

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Подключение к базе данных
const db = new sqlite3.Database('./server/cookbook.db');

// Создание таблиц
db.serialize(() => {
  // Таблица пользователей
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL
  )`);

  // Таблица рецептов
  db.run(`CREATE TABLE IF NOT EXISTS recipes (
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
  )`);

  // Таблица избранного
  db.run(`CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    recipe_id INTEGER NOT NULL,
    UNIQUE(user_id, recipe_id)
  )`);

  // Тестовый пользователь
  db.get("SELECT * FROM users WHERE email = 'test@test.com'", (err, row) => {
    if (!row) {
      const hash = bcrypt.hashSync('123456', 10);
      db.run("INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
        ['test@test.com', hash, 'Тестовый пользователь']);
      console.log('Test user: test@test.com / 123456');
    }
  });
});

// ========== АВТОРИЗАЦИЯ ==========
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (user) return res.status(400).json({ error: 'User already exists' });

    const hash = bcrypt.hashSync(password, 10);
    const userName = name || email.split('@')[0];

    db.run('INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hash, userName],
      function(err) {
        if (err) return res.status(500).json({ error: 'Server error' });
        res.json({ user: { id: this.lastID, email, name: userName }, token: 'token_' + this.lastID });
      });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid email or password' });
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token: 'token_' + user.id });
  });
});

// ========== РЕЦЕПТЫ ==========
app.get('/api/recipes', (req, res) => {
  db.all('SELECT * FROM recipes ORDER BY id DESC', (err, recipes) => {
    if (err) return res.status(500).json({ error: 'Database error' });
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
    if (err || !recipe) return res.status(404).json({ error: 'Recipe not found' });
    recipe.ingredients = JSON.parse(recipe.ingredients || '[]');
    recipe.instructions = JSON.parse(recipe.instructions || '[]');
    recipe.step_images = JSON.parse(recipe.step_images || '[]');
    res.json(recipe);
  });
});

app.post('/api/recipes', upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'stepImages', maxCount: 20 }
]), (req, res) => {
  const { user_id, name, description, category, cuisine, cook_time, difficulty, ingredients, instructions } = req.body;

  if (!user_id || !name) return res.status(400).json({ error: 'Name and author required' });

  // Путь к главному изображению
  let mainImagePath = null;
  if (req.files['mainImage']) {
    mainImagePath = '/uploads/' + req.files['mainImage'][0].filename;
  }

  // Пути к изображениям шагов
  let stepImagesPaths = [];
  if (req.files['stepImages']) {
    stepImagesPaths = req.files['stepImages'].map(file => '/uploads/' + file.filename);
  }

  // Парсим ингредиенты и инструкции
  let ingredientsArray = [];
  try {
    ingredientsArray = typeof ingredients === 'string' ? JSON.parse(ingredients) : (ingredients || []);
  } catch(e) { ingredientsArray = []; }

  let instructionsArray = [];
  try {
    instructionsArray = typeof instructions === 'string' ? JSON.parse(instructions) : (instructions || []);
  } catch(e) { instructionsArray = []; }

  db.run(`INSERT INTO recipes (user_id, name, description, image, category, cuisine, cook_time, difficulty, ingredients, instructions, step_images)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id, name, description || '', mainImagePath, category || 'dinner', cuisine || 'russian',
     cook_time || 30, difficulty || 'medium',
     JSON.stringify(ingredientsArray), JSON.stringify(instructionsArray),
     JSON.stringify(stepImagesPaths)],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to create recipe' });
      res.status(201).json({ id: this.lastID, message: 'Recipe created' });
    });
});

// Удаление рецепта вместе с файлами
app.delete('/api/recipes/:id', (req, res) => {
  const { user_id } = req.body;
  
  console.log('DELETE recipe:', req.params.id, 'user:', user_id);
  
  if (!user_id) {
    return res.status(400).json({ error: 'User ID required' });
  }
  
  // Получаем пути к файлам
  db.get('SELECT image, step_images FROM recipes WHERE id = ? AND user_id = ?', 
    [req.params.id, user_id], 
    (err, recipe) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Если рецепт не найден, всё равно возвращаем успех (он уже удалён)
      if (!recipe) {
        return res.json({ message: 'Recipe already deleted' });
      }
      
      // Удаляем файлы
      const deleteFile = (filePath) => {
        if (!filePath) return;
        const fullPath = path.join(__dirname, filePath);
        fs.unlink(fullPath, (err) => {});
      };
      
      if (recipe.image) deleteFile(recipe.image);
      if (recipe.step_images) {
        try {
          JSON.parse(recipe.step_images).forEach(deleteFile);
        } catch(e) {}
      }
      
      // Удаляем из БД
      db.run('DELETE FROM recipes WHERE id = ?', [req.params.id]);
      db.run('DELETE FROM favorites WHERE recipe_id = ?', [req.params.id]);
      
      res.json({ message: 'Recipe deleted' });
    });
});

// ========== ИЗБРАННОЕ ==========
app.post('/api/favorites/:recipeId', (req, res) => {
  const { user_id } = req.body;
  db.run('INSERT OR IGNORE INTO favorites (user_id, recipe_id) VALUES (?, ?)',
    [user_id, req.params.recipeId],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to add' });
      res.json({ message: 'Added to favorites' });
    });
});

app.delete('/api/favorites/:recipeId', (req, res) => {
  const { user_id } = req.body;
  db.run('DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?',
    [user_id, req.params.recipeId],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to remove' });
      res.json({ message: 'Removed from favorites' });
    });
});

app.get('/api/favorites/:userId', (req, res) => {
  db.all(`
    SELECT r.* FROM recipes r 
    INNER JOIN favorites f ON r.id = f.recipe_id 
    WHERE f.user_id = ?
  `, [req.params.userId], (err, favorites) => {
    if (err) return res.status(500).json({ error: 'Failed to get favorites' });
    const result = favorites.map(r => ({
      ...r,
      ingredients: JSON.parse(r.ingredients || '[]'),
      instructions: JSON.parse(r.instructions || '[]'),
      step_images: JSON.parse(r.step_images || '[]')
    }));
    res.json(result);
  });
});

// Проверка работы сервера
app.get('/', (req, res) => {
  res.json({ message: 'Server is running', status: 'ok' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
  console.log('Test account: test@test.com / 123456');
});