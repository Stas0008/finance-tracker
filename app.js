const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const connectToDb = require('./config/db.config');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const indexRouter = require('./routes/index');

const app = express();

// Завантаження Swagger документації
const swaggerDocument = YAML.load('swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/expenses', require('./routes/expenses'));

app.get('/', (req, res) => res.send('Finance Tracker API'));


// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// Симуляція помилки для тестування
app.use((req, res, next) => {
  if (req.headers['x-force-error']) {
    return next(new Error('Forced error for testing'));
  }
  next();
});


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
