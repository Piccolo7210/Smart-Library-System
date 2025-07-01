import Book from '../models/Book.js';

export const addBook = async (req, res) => {
    try {
        const book = new Book(req.body);
        await book.save();
        res.status(201).json(book);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getBooks = async (req, res) => {
    try {
        const { search, genre } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { author: { $regex: search, $options: 'i' } }
                ]
            };
        }

        if (genre) {
            query.genre = genre;
        }

        const books = await Book.find(query);
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const updates = Object.keys(req.body);
        const allowedUpdates = [ 'copies', 'available_copies'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }

        updates.forEach(update => book[update] = req.body[update]);
        await book.save();
        res.json(book);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        await book.deleteOne();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const findBookById = async (bookId) => {
    try {
        return await Book.findById(bookId);
    } catch (error) {
        throw new Error('Error finding book: ' + error.message);
    }
};

export const updateBookAvailability = async (bookId, change) => {
    try {
        const book = await Book.findById(bookId);
        if (!book) {
            throw new Error('Book not found');
        }
        
        book.available_copies += change;
        if (change < 0) {
            book.borrowCount += 1;
        }
        
        return await book.save();
    } catch (error) {
        throw new Error('Error updating book availability: ' + error.message);
    }
};

export const getBookDetails = async (bookId) => {
    try {
        const book = await Book.findById(bookId);
        if (!book) {
            throw new Error('Book not found');
        }
        return {
            id: book._id,
            title: book.title,
            author: book.author
        };
    } catch (error) {
        throw new Error('Error getting book details: ' + error.message);
    }
};

export const getPopularBooks = async (req, res) => {
    try {
        const popularBooks = await Book.find()
            .sort({ borrowCount: -1 })
            .limit(10)
            .select('title author borrowCount');

        res.json(popularBooks.map(book => ({
            book_id: book._id,
            title: book.title,
            author: book.author,
            borrow_count: book.borrowCount
        })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getBooksOverview = async () => {
    try {
        const [totalBooks, booksAvailable] = await Promise.all([
            Book.countDocuments(),
            Book.aggregate([{ $group: { _id: null, total: { $sum: '$available_copies' } } }])
        ]);

        return {
            total_books: totalBooks,
            books_available: booksAvailable[0]?.total || 0
        };
    } catch (error) {
        throw new Error('Error getting books overview: ' + error.message);
    }
};
