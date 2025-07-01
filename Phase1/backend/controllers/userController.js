import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { getMostActiveUsers } from './loanController.js';

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const user = new User({ name, email, password, role });
        await user.save();

        const token = generateToken(user._id);
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user._id);
        res.json({ user, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        console.log('User ID:', user._id);
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ message: 'Invalid updates' });
    }

    try {
        const user = await User.findById(req.user._id);
        updates.forEach(update => user[update] = req.body[update]);
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserDetails = async (userId) => {
    try {
        const user = await User.findById(userId);
        return {
            id: user._id,
            name: user.name,
            email: user.email
        };
    } catch (error) {
        throw new Error('Error getting user details: ' + error.message);
    }
};

export const getActiveUsers = async (req, res) => {
    try {
        const activeLoans = await getMostActiveUsers();
        const userIds = activeLoans.map(loan => loan._id);
        const users = await User.find({ _id: { $in: userIds } });

        const activeUsersData = activeLoans.map(loan => {
            const user = users.find(u => u._id.equals(loan._id));
            return {
                user_id: loan._id,
                name: user.name,
                books_borrowed: loan.books_borrowed,
                current_borrows: loan.current_borrows
            };
        });

        res.json(activeUsersData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUsersOverview = async () => {
    try {
        const totalUsers = await User.countDocuments();
        return { total_users: totalUsers };
    } catch (error) {
        throw new Error('Error getting users overview: ' + error.message);
    }
};