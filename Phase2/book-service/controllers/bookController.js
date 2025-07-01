import Book from '../models/Book.js';

// Get all books
export const searchBooks = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        
        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { author: { $regex: search, $options: 'i' } },
                    { isbn: { $regex: search, $options: 'i' } }
                ]
            };
        }
        
        const books = await Book.find(query);
        const formattedBooks = books.map(book => ({
            id: book._id,
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            copies: book.copies,
            available_copies: book.available_copies
        }));
        
        res.json({ books: formattedBooks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getBookbyID = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        const formattedBook = {
            id: book._id,
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            copies: book.copies,
            borrowCount: book.borrowCount,
            available_copies: book.available_copies,
            created_at: book.createdAt,
            updated_at: book.updatedAt
        };
        res.json(formattedBook);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a book
export const createBook = async (req, res) => {
    const book = new Book(req.body);
    try {
        const newBook = await book.save();
        const formattedResponse = {
            id: newBook._id,
            title: newBook.title,
            author: newBook.author,
            isbn: newBook.isbn,
            copies: newBook.copies,
            available_copies: newBook.available_copies,
            created_at: newBook.createdAt
        };
        res.status(201).json(formattedResponse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a book
export const updateBook = async (req, res) => {
    try {
        const { title, author, isbn, copies ,available_copies,borrowCount} = req.body;
        // console.log("borrowCount", borrowCount);
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            { title, author, isbn, copies: copies, available_copies: available_copies, borrowCount: borrowCount },
            { new: true }
        );
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        res.status(200).json({
            id: book._id,
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            copies: book.copies,
            available_copies: book.available_copies,
            borrowCount: book.borrowCount,
            createdAt: book.createdAt,
            updatedAt: book.updatedAt
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating book", error: error.message });
    }
};


export const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        await book.deleteOne();
        res.json({ message: 'Book deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const checkAvailability = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json({ available: book.available });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAvailability = async (req, res) => {
    try {
        const { operation } = req.body;
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        if (operation === "increment") {
            book.available_copies += 1;
        } else if (operation === "decrement") {
            if (book.available_copies <= 0) {
                return res.status(400).json({ message: "No available copies" });
            }
            book.available_copies -= 1;
        }
        await book.save();
        res.status(200).json({
            id: book._id,
            available_copies: book.available_copies,
            updatedAt: book.updatedAt
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating book availability", error: error.message });
    }
};

// Get most popular books based on borrow count
export const getPopularBooks = async (req, res) => {
    try {
        const books = await Book.find()
            .sort({ borrowCount: -1 })  // Sort by borrow count in descending order
            .limit(10);  // Limit to top 10 books
        
        const formattedBooks = books.map(book => ({
            book_id: book._id,
            title: book.title,
            author: book.author,
            borrow_count: book.borrowCount || 0
        }));
        
        res.json(formattedBooks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get book statistics
export const getBookStats = async (req, res) => {
    try {
        const [total, available] = await Promise.all([
            Book.countDocuments(),
            Book.countDocuments({ available_copies: { $gt: 0 } })
        ]);

        res.json({
            total,
            available
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};