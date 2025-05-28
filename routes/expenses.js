const express = require('express');

const router = express.Router();
const expensesController = require('../controllers/expenses.controller');

router.post('/', expensesController.createExpense);
router.get('/', expensesController.getAllExpenses);
router.put('/:id', expensesController.updateExpense);
router.delete('/:id', expensesController.deleteExpense);
router.delete('/category/:id', expensesController.deleteExpenses);
router.get('/statistics', expensesController.getStatistics);
router.get('/export', expensesController.exportExpenses);

module.exports = router;
