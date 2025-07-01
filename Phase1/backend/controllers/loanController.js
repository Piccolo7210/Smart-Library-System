import Loan from '../models/Loan.js';
import { findBookById, updateBookAvailability, getBookDetails, getBooksOverview } from './bookController.js';
import { getUserDetails, getUsersOverview } from './userController.js';

export const issueLoan = async (req, res) => {
    try {
        const { book_id, user_id, due_date } = req.body;
        
        const book = await findBookById(book_id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        
        if (book.available_copies <= 0) {
            return res.status(400).json({ message: 'No copies available' });
        }

        const existingLoan = await Loan.findOne({
            user_id,
            book_id,
            status: 'ACTIVE'
        });

        if (existingLoan) {
            return res.status(400).json({ message: 'You already have an active loan for this book' });
        }

        const loan = new Loan({
            user_id,
            book_id,
            due_date,
            issue_date: new Date(),
            status: 'ACTIVE'
        });

        await updateBookAvailability(book_id, -1);
        await loan.save();

        res.status(201).json({
            id: loan._id,
            user_id: loan.user_id,
            book_id: loan.book_id,
            issue_date: loan.issue_date,
            due_date: loan.due_date,
            status: loan.status
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
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

        await updateBookAvailability(loan.book_id, 1);
        await loan.save();

        res.json({
            id: loan._id,
            user_id: loan.user_id,
            book_id: loan.book_id,
            issue_date: loan.issue_date,
            due_date: loan.due_date,
            return_date: loan.return_date,
            status: loan.status
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getUserLoans = async (req, res) => {
    try {
        const loans = await Loan.find({ user_id: req.params.user_id })
            .sort({ createdAt: -1 });

        const formattedLoans = await Promise.all(loans.map(async loan => ({
            id: loan._id,
            book: await getBookDetails(loan.book_id),
            issue_date: loan.issue_date,
            due_date: loan.due_date,
            return_date: loan.return_date || null,
            status: loan.status
        })));

        res.json(formattedLoans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOverdueLoans = async (req, res) => {
    try {
        const loans = await Loan.find({
            status: 'ACTIVE',
            due_date: { $lt: new Date() }
        });
        if (loans.length === 0) {
            return res.status(201).json({ message: 'No overdue loans found' });
        }
        const overdueLoans = await Promise.all(loans.map(async loan => ({
            id: loan._id,
            user: await getUserDetails(loan.user_id),
            book: await getBookDetails(loan.book_id),
            issue_date: loan.issue_date,
            due_date: loan.due_date,
            days_overdue: Math.ceil((Date.now() - loan.due_date) / (1000 * 60 * 60 * 24))
        })));

        res.json(overdueLoans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const extendLoan = async (req, res) => {
    try {
        const { extension_days } = req.body;
        const loan = await Loan.findById(req.params.id);

        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        if (loan.status !== 'ACTIVE') {
            return res.status(400).json({ message: 'Can only extend active loans' });
        }

        if (loan.extensions_count >= 2) {
            return res.status(400).json({ message: 'Maximum extensions reached' });
        }

        const original_due_date = loan.due_date;
        loan.due_date = new Date(loan.due_date.getTime() + extension_days * 24 * 60 * 60 * 1000);
        loan.extensions_count += 1;

        await loan.save();

        res.json({
            ...loan.toObject(),
            original_due_date,
            extended_due_date: loan.due_date
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getLoansOverview = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            activeLoans,
            overdueLoans,
            loansToday,
            returnsToday,
            booksStats,
            usersStats
        ] = await Promise.all([
            Loan.countDocuments({ status: 'ACTIVE' }),
            Loan.countDocuments({ status: 'ACTIVE', due_date: { $lt: new Date() } }),
            Loan.countDocuments({ issue_date: { $gte: today } }),
            Loan.countDocuments({ return_date: { $gte: today } }),
            getBooksOverview(),
            getUsersOverview()
        ]);

        res.json({
            ...booksStats,
            ...usersStats,
            books_borrowed: activeLoans,
            overdue_loans: overdueLoans,
            loans_today: loansToday,
            returns_today: returnsToday
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMostActiveUsers = async () => {
    try {
        const activeLoans = await Loan.aggregate([
            {
                $group: {
                    _id: '$user_id',
                    books_borrowed: { $sum: 1 },
                    current_borrows: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0]
                        }
                    }
                }
            },
            { $sort: { books_borrowed: -1 } },
            { $limit: 10 }
        ]);

        return activeLoans;
    } catch (error) {
        throw new Error('Error getting active users: ' + error.message);
    }
};