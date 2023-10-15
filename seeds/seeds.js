const mongoose = require("mongoose");
const Campground = require("../models/campground");
const Review = require("../models/review");
const User = require("../models/users");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const mapboxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = "pk.eyJ1IjoidGh1bmRlcmdvZDgxMSIsImEiOiJjbDR5OXFlbDIwODkxM2NwOGtldjJ0b2U3In0.frP2kjqNsRV78zEGBbofAw";
const geocoder = mapboxGeocoding({ accessToken: mapboxToken });

mongoose
    .connect("mongodb://localhost:27017/yelp-camp")
    .then(() => {
        console.log("connected to db");
    })
    .catch((err) => {
        console.log(err);
    });

const createNewUser = async (email, username, password) => {
    const user = new User({ email, username });
    await User.register(user, password);
    // no need to run newUser.save(); passport will auto save to the db
    console.log("New user created");
};
// createNewUser("prats@gmail.com","prats","prats123");
// createNewUser("sam@gmail.com", "sam", "sam123");

const seedDB = async () => {
    await Campground.deleteMany({});
    await Review.deleteMany({});
    for (let i = 0; i < 400; i++) {
        const price = Math.floor(Math.random() * 5000 + 1000);
        const random1000 = Math.floor(Math.random() * 1000);
        const lenPlaces = places.length;
        const lenDescriptors = descriptors.length;
        const pickRandomPlace = Math.floor(Math.random() * lenPlaces);
        const pickRandomDesc = Math.floor(Math.random() * lenDescriptors);
        const location = `${cities[random1000].city}, ${cities[random1000].state}`;
        const geoData = await geocoder
            .forwardGeocode({
                query: location,
                limit: 1,
            })
            .send();

        const url = "https://source.unsplash.com/collection/483251";
        const filename = "unsplash-images";
        const image = [{url, filename}];
        const c = new Campground({
            location,
            price,
            description: `Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eos, ut! Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptas, molestias.`,
            title: `${descriptors[pickRandomDesc]} ${places[pickRandomPlace]}`,
            images: image,
            author: await User.findOne({ username: "tim" }),
            geometry: geoData.body.features[0].geometry,
        });

        await c.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});
