const { string } = require('joi');
const mongoose = require('mongoose');
const {Schema} = mongoose;

const reviewSchema = new Schema({
    body: String,  // It's like review comment
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Review', reviewSchema);