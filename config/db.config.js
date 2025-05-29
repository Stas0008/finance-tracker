const mongoose = require('mongoose');

const connectToDb = async () => {
    try {
        await mongoose.connect(
            'mongodb+srv://Stas:PpB5wVPrIu9P7BQD@cluster0.7vk7sm9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
            {
                tls: true,
                serverSelectionTimeoutMS: 5000,
                heartbeatFrequencyMS: 10000,
            },
        );
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

module.exports = connectToDb;
