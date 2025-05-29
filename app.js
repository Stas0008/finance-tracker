const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const connectToDb = require("./config/db.config");

const indexRouter = require("./routes/index");
const categoriesRouter = require("./routes/categories");
const expensesRouter = require("./routes/expenses");

const port = 3001;
const app = express();

// Завантаження Swagger документації
const swaggerDocument = YAML.load("swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/expenses", expensesRouter);
app.use("/trigger-error", (req, res, next) => {
    next(new Error("Test error"));
});

app.get("/", (req, res) => res.send("Finance Tracker API"));

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// Глобальний обробник помилок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!", error: err.message });
    next();
});

connectToDb().then(() => {
    app.listen(port, () => console.log(`Server running on port ${port}`));
});

module.exports = app;
