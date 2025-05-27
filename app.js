const express = require('express');
const connectToDb = require('./config/db.config');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const expensesRouter = require('./routes/expenses.routes');

const app = express();

// Завантаження Swagger документації
const swaggerDocument = YAML.load('swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => res.send('Finance Tracker API'));

app.use('/api/expenses', require('./routes/expenses'));

// Симуляція помилки для тестування
app.use((req, res, next) => {
  if (req.headers['x-force-error']) {
    return next(new Error('Forced error for testing'));
  }
  next();
});

app.use('/api/expenses', expensesRouter);

// Глобальний обробник помилок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

connectToDb().then(() => {
  app.listen(3000, () => console.log('Server running on port 3000'));
});

app.use((req, res, next) => {
  if (req.headers['x-force-error']) {
    return next(new Error('Forced error for testing'));
  }
  next();
});

module.exports = app;
