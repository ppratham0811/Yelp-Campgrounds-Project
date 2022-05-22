const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const campgroundSchema = new Schema({
    title: String,
    image: String,
    price: String,
    description: String, 
    location: String
});

const Campground = model("Campground",campgroundSchema);

module.exports = Campground;