const Category = require('../models/category.model');
const Expense = require('../models/expense.model');

// Отримання списку категорій
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

// Створення нової категорії
exports.createCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const category = await Category.create({ name, description });
        res.status(201).json(category);
    } catch (error) {
        next(error);
    }
};

// Видалення категорій
exports.deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        const relatedExpenses = await Expense.findOne({ category: id });
        if (relatedExpenses) {
            return res.status(400).json({
                message: 'Cannot delete category: it is assigned to one or more expenses.',
            });
        }

        const deleted = await Category.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Category not found' });
        }

        return res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        return next(error);
    }
};

// Оновлення існуючої категорії
exports.updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name, description },
            { new: true, runValidators: true },
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        return res.json(updatedCategory);
    } catch (error) {
        return next(error);
    }
};
