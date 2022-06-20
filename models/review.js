const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const reviewSchema = new Schema({
    body: String,
    rating: Number
})

const Review = model("Review",reviewSchema);
module.exports = Review;