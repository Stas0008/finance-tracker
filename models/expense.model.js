const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const expenseSchema = new Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    date: { type: Date, default: Date.now },
    description: { type: String },
  },
  { timestamps: true }
);

const Expense = model('Expense', expenseSchema);
module.exports = Expense;
