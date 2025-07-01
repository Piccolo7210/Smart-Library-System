import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};
MONGODB_URI=mongodb+srv://bsse1405:YRJDa6XUXZG3PrZp@cluster0.sntvef1.mongodb.net/library_system
PORT=3100
JWT_SECRET=your_jwt_secret_key_here

export default connectDB;
