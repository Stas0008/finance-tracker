const request = require('supertest');
const express = require('express');
const categoryController = require('../controllers/categories.controller');
const Category = require('../models/category.model');
const Expense = require('../models/expense.model');

jest.mock('../models/category.model');
jest.mock('../models/expense.model');

const app = express();
app.use(express.json());

// Routes
app.get('/api/categories', categoryController.getCategories);
app.post('/api/categories', categoryController.createCategory);
app.delete('/api/categories/:id', categoryController.deleteCategory);
app.put('/api/categories/:id', categoryController.updateCategory);

describe('Category Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/categories', () => {
    it('should return a list of categories', async () => {
      const mockCategories = [{ name: 'Food' }, { name: 'Transport' }];
      Category.find.mockResolvedValue(mockCategories);

      const res = await request(app).get('/api/categories');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockCategories);
      expect(Category.find).toHaveBeenCalled();
    });
  });

  describe('POST /api/categories', () => {
    it('should create a new category', async () => {
      const categoryData = { name: 'Health', description: 'Medical expenses' };
      Category.create.mockResolvedValue(categoryData);

      const res = await request(app).post('/api/categories').send(categoryData);
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(categoryData);
      expect(Category.create).toHaveBeenCalledWith(categoryData);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should prevent deletion if category has expenses', async () => {
      Expense.findOne.mockResolvedValue({ _id: 'some-expense-id' });

      const res = await request(app).delete('/api/categories/123');
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Cannot delete category/i);
    });

    it('should delete category if no related expenses', async () => {
      Expense.findOne.mockResolvedValue(null);
      Category.findByIdAndDelete.mockResolvedValue({ _id: '123' });

      const res = await request(app).delete('/api/categories/123');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/deleted successfully/i);
    });

    it('should return 404 if category not found', async () => {
      Expense.findOne.mockResolvedValue(null);
      Category.findByIdAndDelete.mockResolvedValue(null);

      const res = await request(app).delete('/api/categories/999');
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('should update the category', async () => {
      const updateData = { name: 'Updated', description: 'Updated desc' };
      Category.findByIdAndUpdate.mockResolvedValue({ _id: '123', ...updateData });

      const res = await request(app).put('/api/categories/123').send(updateData);
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Updated');
      expect(Category.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        updateData,
        { new: true, runValidators: true }
      );
    });

    it('should return 404 if category not found', async () => {
      Category.findByIdAndUpdate.mockResolvedValue(null);

      const res = await request(app).put('/api/categories/unknown').send({
        name: 'Test',
        description: 'No match',
      });
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });
  });
});
