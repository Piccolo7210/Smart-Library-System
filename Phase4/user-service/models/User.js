import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    role: {
        type: String,
        enum: ['student', 'faculty', 'admin'],
        default: 'student'
    },
}, {
    timestamps: true
});

// Drop any existing indexes before creating new ones
userSchema.pre('save', async function(next) {
    try {
        await this.collection.dropIndexes();
        next();
    } catch (error) {
        next();
    }
});

// Create new indexes
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

// Ensure indexes are created properly
User.init().then(() => {
    // console.log('User model indexes have been created');
});

export default User;