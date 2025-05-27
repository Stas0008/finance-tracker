const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    name: { type: String, required: true, min: 1 },
    description: { type: String },
});

module.exports = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
