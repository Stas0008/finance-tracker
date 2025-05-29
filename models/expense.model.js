const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const expenseSchema = new Schema(
    {
        amount: { type: Number, required: true, min: 0 },
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        date: { type: Date, default: Date.now },
        description: { type: String },
    },
    { timestamps: true },
);

module.exports = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
