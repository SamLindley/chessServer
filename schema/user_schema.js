import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    email: {
        type: String
    },
    rating: {
        type: Number
    },
    password: {
        type: String
    },
    gamesWon: {
        type: Number
    },
    gamesLost: {
        type: Number
    }
});

const User = module.exports = mongoose.model('User', userSchema);