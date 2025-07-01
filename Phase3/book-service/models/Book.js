import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    isbn: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    copies: {
        type: Number,
        required: true,
        min: 0,
        default: 1
    },
    available_copies: {
        type: Number,
        min: 0,
        default: function() {
            return this.copies;
        }
    },
    genre: {
        type: String,
        trim: true
    },
    borrowCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export default mongoose.model('Book', bookSchema);