const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const connectDB = require('../config/db.config');
const Expense = require('../models/expense.model');
const Category = require('../models/category.model');

describe('Expenses API', () => {
    let categoryId;

    beforeAll(async () => {
        await connectDB();
    });

    beforeEach(async () => {
        await Expense.deleteMany({});
        await Category.deleteMany({});
        const category = await Category.create({
            name: 'Food',
            description: 'Food expenses',
        });
        categoryId = category._id;
    });

    afterEach(async () => {
        jest.restoreAllMocks(); // Очищаємо всі мок-функції після кожного тесту
    });

    afterAll(async () => {
        await mongoose.connection.close(); // Закриваємо підключення до MongoDB
    });

    // Тест створення витрати
    it('should create a new expense', async () => {
        const res = await request(app).post('/api/expenses').send({
            amount: 50,
            category: categoryId,
            date: '2025-05-01',
            description: 'Lunch',
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.amount).toBe(50);
        expect(res.body.category).toEqual(categoryId.toString());
    });
    // Тест для невалідної категорії
    it('should return 400 when category is not found', async () => {
        const invalidCategoryId = new mongoose.Types.ObjectId();
        const res = await request(app).post('/api/expenses').send({
            amount: 50,
            category: invalidCategoryId,
            date: '2025-05-01',
            description: 'Lunch',
        });
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('Category not found');
    });
    // Тест для перевірки валідації
    it('should return 400 if required fields are missing', async () => {
        const res = await request(app).post('/api/expenses').send({});
        
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toMatch(/(name|amount|category|date)/i); // Перевіряє, що є повідомлення про відсутнє поле
    });


    // Тест отримання всіх витрат із деталями категорії
    it('should get all expenses with category details', async () => {
        await Expense.create({
            amount: 50,
            category: categoryId,
            date: '2025-05-01',
        });
        const res = await request(app).get('/api/expenses');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0]).toHaveProperty('category');
        expect(res.body[0].category.name).toBe('Food');
    });

    // Тест оновлення витрати
    it('should update an expense', async () => {
        const expense = await Expense.create({
            amount: 50,
            category: categoryId,
            date: '2025-05-01',
        });
        const res = await request(app)
            .put(`/api/expenses/${expense._id}`)
            .send({ amount: 75, category: categoryId });
        expect(res.statusCode).toEqual(200);
        expect(res.body.amount).toBe(75);
        expect(res.body.category).toEqual(categoryId.toString());
    });

    // Тест видалення витрати
    it('should delete an expense', async () => {
        const expense = await Expense.create({
            amount: 50,
            category: categoryId,
            date: '2025-05-01',
        });
        const res = await request(app).delete(`/api/expenses/${expense._id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Expense deleted successfully');
    });

    // Тест отримання статистики
    it('should get statistics', async () => {
        await Expense.create({
            amount: 50,
            category: categoryId,
            date: new Date('2025-05-01'),
        });
        await Expense.create({
            amount: 30,
            category: categoryId,
            date: new Date('2025-05-02'),
        });

        const res = await request(app).get(
            '/api/expenses/statistics?startDate=2025-05-01&endDate=2025-05-31',
        );


        expect(res.body.byCategory).toEqual(
          expect.arrayContaining([
            { _id: 'Food', totalAmount: 80 }
          ])
        );

        expect(res.statusCode).toEqual(200);
        expect(res.body.totalAmount).toBe(80);
        expect(res.body.byCategory).toEqual(
            expect.arrayContaining([{ _id: 'Food', totalAmount: 80 }]),
        );
        expect(res.body.averageAmount).toBeCloseTo(40, 5);
    });

    // Тест експорту витрат у CSV
    it('should export expenses to CSV', async () => {
        await Expense.create({
            amount: 50,
            category: categoryId,
            date: '2025-05-01',
            description: 'Lunch',
        });

        const res = await request(app).get('/api/expenses/export');
        expect(res.statusCode).toEqual(200);
        expect(res.header['content-type']).toContain('text/csv');
        expect(res.header['content-disposition']).toContain('attachment; filename="expenses.csv"');
        expect(res.text).toContain('"_id","amount","category.name","date","description","createdAt","updatedAt"');
        expect(res.text).toContain('50,"Food"');
    });

    // Тест обробки помилок API
    it('should handle errors in API', async () => {
        // Мокуємо Expense.find, але зберігаємо можливість виклику populate
        const mockExpenses = [];
        jest.spyOn(Expense, 'find').mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockExpenses),
        });

        const mockError = new Error('Database error');
        jest.spyOn(Expense, 'find').mockRejectedValueOnce(mockError);

        const res = await request(app).get('/api/expenses');

        expect(res.statusCode).toBe(500); // або 400, залежно від middleware
        expect(res.body.message).toBe('Something went wrong!');
        expect(res.body.error).toBeDefined();
    });

    // Тест для обробки помилки підключення до MongoDB
    describe('Database Connection', () => {
        it('should handle MongoDB connection error', async () => {
            jest.spyOn(mongoose, 'connect').mockRejectedValueOnce(new Error('Connection failed'));
            await expect(connectDB()).rejects.toThrow('Connection failed');
        });
    });



    // Тест для помилки агрегації в getStatistics
    it('should handle error in getStatistics', async () => {
        jest.spyOn(Expense, 'aggregate').mockRejectedValueOnce(new Error('Aggregation error'));
        const res = await request(app).get(
            '/api/expenses/statistics?startDate=2025-05-01&endDate=2025-05-31',
        );
        expect(res.statusCode).toEqual(500);
        expect(res.body.message).toBe('Something went wrong!');
    });

    // Тест для помилки в exportExpenses
    it('should handle error in exportExpenses', async () => {
        jest.spyOn(Expense, 'find').mockReturnValue({
            populate: jest.fn().mockRejectedValue(new Error('Export error')),
        });

        const res = await request(app).get('/api/expenses/export');
        expect(res.statusCode).toEqual(500);
        expect(res.body.message).toBe('Something went wrong!');
    });

    // Тест для оновлення неіснуючої витрати
    it('should return 404 when updating non-existent expense', async () => {
        const invalidId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .put(`/api/expenses/${invalidId}`)
            .send({ amount: 75, category: categoryId });
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toBe('Expense not found');
    });

    // Тест для видалення неіснуючої витрати
    it('should return 404 when deleting non-existent expense', async () => {
        const invalidId = new mongoose.Types.ObjectId();
        const res = await request(app).delete(`/api/expenses/${invalidId}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toBe('Expense not found');
    });

    // Тест для глобального обробника помилок
    it('should handle global error', async () => {
        const res = await request(app).get('/api/expenses').set('X-Force-Error', 'true');
        expect(res.statusCode).toEqual(500);
        expect(res.body.message).toBe('Something went wrong!');
        expect(res.body.error).toBe('Forced error for testing');
    });

    // Тест для невалідних даних
    it('should return 400 for invalid expense data', async () => {
        const res = await request(app)
            .post('/api/expenses')
            .send({ amount: -10, category: categoryId });
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBeDefined();
    });
});
