const express = require("express");
const app = express();
const path = require('path');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log("database connected, connection open");
    })
    .catch(err => {
        console.log("connection failed", err);
    })

const port = 3000;
const methodOverride = require('method-override');
const Joi = require('joi');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');
const catchAsync = require('./utils/catchAsync');
const AppError = require('./utils/AppError');

const {campgroundSchema} = require('./JoiSchemas.js')

app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

function validateCampground(req,res,next) {
    const {error} = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(e => e.message).join(',');
        throw new AppError(msg,400);
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('index', { webpageheading: "Welcome to Yelp Camp" })
});

app.get('/campgrounds', catchAsync(async(req, res, next) => {
    const campgrounds = await Campground.find({});
    const total = await Campground.count();
    res.render('campgrounds/campgrounds', { campgrounds, total, webpageheading: "All Campgrounds Page" });
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new', { webpageheading: "Make a new Campground" });
})

app.post('/campgrounds', validateCampground, catchAsync(async(req, res, next) => {
    const camp = new Campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
}))

app.get('/campgrounds/:id', catchAsync(async(req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    res.render('campgrounds/show', { camp, webpageheading: `${camp.title}` });
}))

app.get('/campgrounds/:id/edit', catchAsync(async(req, res, next) => {
    const camp = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { camp, webpageheading: `Edit ${camp.title}` });
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async(req, res, next) => {
    await Campground.findByIdAndUpdate(req.params.id, req.body.campground, { new: true, runValidators: true });
    res.redirect(`/campgrounds/${req.params.id}`);
}))

app.delete('/campgrounds/:id', catchAsync(async(req, res, next) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds');
}))

app.all('*', (req, res, next) => {
    next(new AppError("Page not found", 404));
})

app.use((err, req, res, next) => {
    const { message = "Something went wrong", status = 500 } = err;
    res.status(status).render('errorpage',{err, webpageheading:`Error (${status})`});
})

app.listen(port, () => {
    console.log("app listening on port", port);
})