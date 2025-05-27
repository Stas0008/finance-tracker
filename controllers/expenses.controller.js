const { Parser } = require('json2csv');
const Expense = require('../models/expense.model');
const Category = require('../models/category.model');

// Створення нової витрати
exports.createExpense = async (req, res, next) => {
    try {
        const { amount, category, date, description } = req.body;

        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(400).json({ message: 'Category not found' });
        }

        const expense = new Expense({ amount, category, date, description });
        await expense.save();
        res.status(201).json(expense);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

// Отримання всіх витрат з популяцією категорій
exports.getAllExpenses = async (req, res, next) => {
    try {
        const expenses = await Expense.find().populate('category', 'name description');
        res.status(200).json(expenses);
    } catch (error) {
        next(error);
    }
};

// Оновлення витрати
exports.updateExpense = async (req, res, next) => {
    try {
        const { category: categoryId, ...expenseData } = req.body;
        if (categoryId) {
            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(400).json({ message: 'Category not found' });
            }
        }
        const expense = await Expense.findByIdAndUpdate(
            req.params.id,
            { ...expenseData, category: categoryId },
            { new: true, runValidators: true },
        );
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json(expense);
    } catch (error) {
        next(error);
    }
};

// Видалення витрати
exports.deleteExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Статистика витрат
exports.getStatistics = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = {};
        if (startDate && endDate) {
            filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        // Загальна сума витрат
        const total = await Expense.aggregate([
            { $match: filter },
            { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
        ]);

        // Розподіл за категоріями з популяцією назв
        const byCategory = await Expense.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryDetails',
                },
            },
            { $unwind: '$categoryDetails' },
            {
                $group: {
                    _id: '$categoryDetails.name',
                    totalAmount: { $sum: '$amount' },
                },
            },
        ]);

        // Середня сума витрат
        const average = await Expense.aggregate([
            { $match: filter },
            { $group: { _id: null, averageAmount: { $avg: '$amount' } } },
        ]);

        res.status(200).json({
            totalAmount: total[0]?.totalAmount || 0,
            byCategory,
            averageAmount: average[0]?.averageAmount || 0,
        });
    } catch (error) {
        next(error);
    }
};

// Експорт витрат у CSV
exports.exportExpenses = async (req, res, next) => {
    try {
        const expenses = await Expense.find().populate('category', 'name');
        const fields = [
            '_id',
            'amount',
            'category.name',
            'date',
            'description',
            'createdAt',
            'updatedAt',
        ];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(expenses);

        res.header('Content-Type', 'text/csv');
        res.attachment('expenses.csv');
        res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
};
