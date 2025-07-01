import User from '../models/User.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const LOAN_SERVICE_URL = process.env.LOAN_SERVICE_URL;

export const getUser = async (req, res) => {
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


export const registerUser = async (req, res) => {
    try {
        const { name, email, role } = req.body;
        
      
        if (!name || !email) {
            return res.status(400).json({ 
                message: "Name and email are required fields" 
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                message: "A user with this email already exists" 
            });
        }

        const user = new User({ name, email, role });
        const savedUser = await user.save();
        
        res.status(201).json({
            id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
            role: savedUser.role,
            created_at: savedUser.createdAt
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a user
export const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        Object.assign(user, req.body);
        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a user
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.deleteOne();
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Check user status (active/membership)
export const checkUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            active: user.active,
            membershipStatus: user.membershipStatus
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get most active users based on borrowing history
export const getActiveUsers = async (req, res) => {
    try {
        const users = await User.find();
        
        // Fetch loan statistics for each user from loan service
        const usersWithStats = await Promise.all(users.map(async (user) => {
            try {
                const response = await fetch(`${LOAN_SERVICE_URL}/api/loans/user/${user._id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch loan data');
                }
                const { loans } = await response.json();
                
                // Calculate statistics
                const books_borrowed = loans.length;
                const current_borrows = loans.filter(loan => loan.status === 'ACTIVE').length;

                return {
                    user_id: user._id,
                    name: user.name,
                    books_borrowed,
                    current_borrows
                };
            } catch (error) {
                console.error(`Error fetching loans for user ${user._id}:`, error);
                return null;
            }
        }));

        // Filter out users with errors and sort by most books borrowed
        const activeUsers = usersWithStats
            .filter(user => user !== null && user.books_borrowed > 0)
            .sort((a, b) => b.books_borrowed - a.books_borrowed)
            .slice(0, 10);  // Get top 10 most active users

        res.json(activeUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get total user count
export const getUserCount = async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};