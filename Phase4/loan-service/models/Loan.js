import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    book_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    issue_date: {
        type: Date,
        default: Date.now
    },
    due_date: {
        type: Date,
        required: true
    },
    return_date: {
        type: Date
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'RETURNED', 'OVERDUE'],
        default: 'ACTIVE'
    },
    extensions_count: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Virtual for calculating days overdue
loanSchema.virtual('days_overdue').get(function() {
    if (this.status === 'RETURNED' || this.status !== 'OVERDUE') return 0;
    return Math.ceil((Date.now() - this.due_date) / (1000 * 60 * 60 * 24));
});
// Index for efficient queries
loanSchema.index({ userId: 1, status: 1 });
loanSchema.index({ bookId: 1, status: 1 });

export default mongoose.model('Loan', loanSchema);