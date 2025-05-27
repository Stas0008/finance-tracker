Finance Tracker API
API для ведення особистого бюджету з функціями створення, редагування, видалення витрат, перегляду статистики та експорту даних у CSV.
Встановлення

Клонуйте репозиторій:
git clone <repository-url>
cd finance-tracker

Встановіть залежності:
npm install

Налаштуйте підключення до MongoDB у config/db.config.js:

Замініть <username>, <password> і cluster0.mongodb.net на ваші дані.

Запустіть додаток:
npm start

API Ендпоінти

POST /api/expenses - Створити нову витрату
GET /api/expenses - Отримати всі витрати
PUT /api/expenses/:id - Оновити витрату
DELETE /api/expenses/:id - Видалити витрату
GET /api/expenses/statistics - Отримати статистику (додайте ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD)
GET /api/expenses/export - Експортувати витрати у CSV

Тестування
Запустіть тести:
npm test
