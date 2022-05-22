const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require("./cities");
const {places,descriptors} = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
.then(() => {
    console.log("connected to db");
})
.catch(err => {
    console.log(err);
});

const seedDB = async() => {
    await Campground.deleteMany({});
    for (let i = 0; i<50;i++) {
        const price = Math.floor(Math.random()*5000 + 1000);
        const random1000 = Math.floor(Math.random()*1000);
        const lenPlaces = places.length;
        const lenDescriptors = descriptors.length;
        const pickRandomPlace = Math.floor(Math.random()*lenPlaces);
        const pickRandomDesc = Math.floor(Math.random()*lenDescriptors);
        const c = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            price,
            description: `Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eos, ut! Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptas, molestias.`,
            title: `${descriptors[pickRandomDesc]} ${places[pickRandomPlace]}`,
            image: "https://source.unsplash.com/collection/483251"
        });
        await c.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
    // will exit after the file runs, the connection establishes, and the data saved.
});


