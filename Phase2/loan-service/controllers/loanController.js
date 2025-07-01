import Loan from '../models/Loan.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();
const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

async function getBookDetails(bookId) {
    try {
        const response = await fetch(`${BOOK_SERVICE_URL}/${bookId}`);
        if (response.status === 404) {
            throw new Error('Book not found');
        }
        if (!response.ok) {
            throw new Error('Book service unavailable');
        }
        return await response.json();
    } catch (error) {
        if (error.message === 'Book not found') {
            throw error;
        }
        throw new Error('Book service unavailable');
    }
}

async function getUserDetails(userId) {
    try {
        const response = await fetch(`${USER_SERVICE_URL}/${userId}`);
        if (response.status === 404) {
            throw new Error('User not found');
        }
        if (!response.ok) {
            throw new Error('User service unavailable');
        }
        return await response.json();
    } catch (error) {
        if (error.message === 'User not found') {
            throw error;
        }
        throw new Error('User service unavailable');
    }
}

async function checkBookAvailability(bookId) {
    const book = await getBookDetails(bookId);
    return book.available_copies > 0;
}

async function updateBookAvailability(bookId, operation) {
    try {
        const book = await getBookDetails(bookId);
        
        // First update the borrow count
        const updateBorrowCountResponse = await fetch(`${BOOK_SERVICE_URL}/${bookId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                borrowCount: operation === 'decrement' ? (book.borrowCount || 0) + 1 : book.borrowCount - 1
            })
        });

        if (!updateBorrowCountResponse.ok) {
            const errorBorrowCount = await updateBorrowCountResponse.json();
            if (updateBorrowCountResponse.status === 404) {
                throw new Error('Book not found');
            } else {
                throw new Error(errorBorrowCount.message || 'Failed to update borrow count');
            }
        }

        // Then update the availability
        const updateAvailabilityResponse = await fetch(`${BOOK_SERVICE_URL}/${bookId}/availability`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operation })
        });

        if (!updateAvailabilityResponse.ok) {
            const errorData = await updateAvailabilityResponse.json();
            if (updateAvailabilityResponse.status === 404) {
                throw new Error('Book not found');
            } else if (updateAvailabilityResponse.status === 400) {
                throw new Error('No available copies');
            } else {
                throw new Error(errorData.message || 'Failed to update book availability');
            }
        }

        return await updateAvailabilityResponse.json();

    } catch (error) {
        console.error('Book availability update error:', error.message);
        throw new Error(error.message || 'Book service unavailable');
    }
}
export const createLoan = async (req, res) => {
    try {
        const { user_id, book_id, due_date } = req.body;
        
    
        try {
            await getUserDetails(user_id);
        } catch (error) {
            if (error.message === 'User not found') {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.status(503).json({ message: 'User service unavailable' });
        }

        
        try {
            const isAvailable = await checkBookAvailability(book_id);
            if (!isAvailable) {
                return res.status(400).json({ message: 'Book has no available copies' });
            }
        } catch (error) {
            if (error.message === 'Book not found') {
                return res.status(404).json({ message: 'Book not found' });
            }
            return res.status(503).json({ message: 'Book service unavailable' });
        }

        const loan = new Loan({
            user_id,
            book_id,
            issue_date: new Date(),
            due_date: new Date(due_date),
            status: 'ACTIVE'
        });

        try {
            await updateBookAvailability(book_id, 'decrement');
        } catch (error) {
            return res.status(503).json({ message: 'Failed to update book availability' });
        }

        const newLoan = await loan.save();
        res.status(201).json({
            id: newLoan._id,
            user_id: newLoan.user_id,
            book_id: newLoan.book_id,
            issue_date: newLoan.issue_date,
            due_date: newLoan.due_date,
            status: newLoan.status
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const returnBook = async (req, res) => {
    try {
        const { loan_id } = req.body;
        const loan = await Loan.findById(loan_id);
        
        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }
        if (loan.status === 'RETURNED') {
            return res.status(400).json({ message: 'Book already returned' });
        }

        loan.status = 'RETURNED';
        loan.return_date = new Date();

        try {
            await updateBookAvailability(loan.book_id, 'increment');
        } catch (error) {
            return res.status(503).json({ message: 'Book service unavailable' });
        }

        const updatedLoan = await loan.save();
        res.json({
            id: updatedLoan._id,
            user_id: updatedLoan.user_id,
            book_id: updatedLoan.book_id,
            issue_date: updatedLoan.issue_date,
            due_date: updatedLoan.due_date,
            return_date: updatedLoan.return_date,
            status: updatedLoan.status
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getUserLoanHistory = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const loans = await Loan.find({ user_id });

        
        const loansWithDetails = await Promise.all(loans.map(async (loan) => {
            try {
                const book = await getBookDetails(loan.book_id);
                return {
                    id: loan._id,
                    book: {
                        id: book.id,
                        title: book.title,
                        author: book.author
                    },
                    issue_date: loan.issue_date,
                    due_date: loan.due_date,
                    return_date: loan.return_date || null,
                    status: loan.status
                };
            } catch (error) {
                return null;
            }
        }));

        // Filter out any loans where we couldn't get book details
        const validLoans = loansWithDetails.filter(loan => loan !== null);

        res.json({
            loans: validLoans,
            total: validLoans.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getLoanDetails = async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);
        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        try {
            const [user, book] = await Promise.all([
                getUserDetails(loan.user_id),
                getBookDetails(loan.book_id)
            ]);

            res.json({
                id: loan._id,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                },
                book: {
                    id: book.id,
                    title: book.title,
                    author: book.author
                },
                issue_date: loan.issue_date,
                due_date: loan.due_date,
                return_date: loan.return_date || null,
                status: loan.status
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                return res.status(404).json({ message: error.message });
            }
            return res.status(503).json({ message: 'Service unavailable' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const checkOverdueLoans = async (req, res) => {
    try {
        const now = new Date();
        const overdueLoans = await Loan.find({
            status: 'ACTIVE',
            due_date: { $lt: now }
        });
        if (overdueLoans.length === 0) {
            return res.status(201).json({ message: 'No overdue loans found' });
        }

        
        const overdueLoansWithDetails = await Promise.all(overdueLoans.map(async (loan) => {
            try {
                const [user, book] = await Promise.all([
                    getUserDetails(loan.user_id),
                    getBookDetails(loan.book_id)
                ]);

               
                const daysOverdue = Math.ceil((now - loan.due_date) / (1000 * 60 * 60 * 24));

                loan.status = 'OVERDUE';
                await loan.save();

                return {
                    id: loan._id,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    },
                    book: {
                        id: book.id,
                        title: book.title,
                        author: book.author
                    },
                    issue_date: loan.issue_date,
                    due_date: loan.due_date,
                    days_overdue: daysOverdue,
                    status: 'OVERDUE'
                };
            } catch (error) {
                return null;
            }
        }));

        const validOverdueLoans = overdueLoansWithDetails.filter(loan => loan !== null);

        res.json(validOverdueLoans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const extendLoan = async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);
        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

      
        if (loan.status !== 'ACTIVE') {
            return res.status(400).json({ 
                message: `Cannot extend loan with status: ${loan.status}` 
            });
        }

        
        const MAX_EXTENSIONS = 2;
        if (loan.extensions_count >= MAX_EXTENSIONS) {
            return res.status(400).json({ 
                message: 'Maximum number of extensions reached' 
            });
        }

        const { extension_days } = req.body;
        if (!extension_days || extension_days <= 0) {
            return res.status(400).json({ 
                message: 'Invalid extension days' 
            });
        }

        
        const original_due_date = loan.due_date;

        
        const extended_due_date = new Date(original_due_date);
        extended_due_date.setDate(extended_due_date.getDate() + extension_days);
        
        
        loan.due_date = extended_due_date;
        loan.extensions_count += 1;
        
        const updatedLoan = await loan.save();

        res.json({
            id: updatedLoan._id,
            user_id: updatedLoan.user_id,
            book_id: updatedLoan.book_id,
            issue_date: updatedLoan.issue_date,
            original_due_date: original_due_date,
            extended_due_date: updatedLoan.due_date,
            status: updatedLoan.status,
            extensions_count: updatedLoan.extensions_count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getSystemStats = async (req, res) => {
    try {
       
        let bookStats;
        try {
            const bookResponse = await fetch(`${BOOK_SERVICE_URL}/stats`);
            if (!bookResponse.ok) {
                throw new Error('Book service unavailable');
            }
            bookStats = await bookResponse.json();
        } catch (error) {
            bookStats = { total: 0, available: 0 };
        }
        console.log(bookStats);
        
        let userCount;
        try {
            const userResponse = await fetch(`${USER_SERVICE_URL}/count`);
            if (!userResponse.ok) {
                throw new Error('User service unavailable');
            }
            const userData = await userResponse.json();
            userCount = userData.count;
        } catch (error) {
            userCount = 0;
        }

        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            activeLoanCount,
            overdueLoanCount,
            todayLoans,
            todayReturns
        ] = await Promise.all([
            Loan.countDocuments({ status: 'ACTIVE' }),
            Loan.countDocuments({
                status: 'ACTIVE',
                due_date: { $lt: new Date() }
            }),
            Loan.countDocuments({
                issue_date: {
                    $gte: today,
                    $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            }),
            Loan.countDocuments({
                return_date: {
                    $gte: today,
                    $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                },
                status: 'RETURNED'
            })
        ]);

        res.json({
            total_books: bookStats.total || 0,
            total_users: userCount,
            books_available: bookStats.available || 0,
            books_borrowed: activeLoanCount,
            overdue_loans: overdueLoanCount,
            loans_today: todayLoans,
            returns_today: todayReturns
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};