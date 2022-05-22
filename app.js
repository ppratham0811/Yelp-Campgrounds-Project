const express = require("express");
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const {Schema, model} = mongoose;
const port = 3000;
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground')

app.engine('ejs',ejsMate);
app.set('views',path.join(__dirname, 'views'));
app.set('view engine','ejs');

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));

mongoose.connect('mongodb://localhost:27017/yelp-camp')
.then(() => {
    console.log("database connected, connection open");
})
.catch(err => {
    console.log("connection failed");
})


app.get('/',(req,res) => {
    res.render('index',{webpageheading: "Welcome to Yelp Camp"})
});

app.get('/campgrounds',async (req,res) => {
    const campgrounds = await Campground.find({});
    const total = await Campground.count();
    res.render('campgrounds/campgrounds',{campgrounds, total, webpageheading: "All Campgrounds Page"});
})

app.get('/campgrounds/new',(req,res) => {
    res.render('campgrounds/new',{webpageheading: "Make a new Campground"});
})

app.post('/campgrounds',async (req,res) => {
    const camp = new Campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
})

app.get('/campgrounds/:id',async (req,res) => {
    const {id} = req.params;
    const camp = await Campground.findById(id);
    res.render('campgrounds/show',{camp,webpageheading:`${camp.title}`});
})

app.get('/campgrounds/:id/edit', async (req,res) => {
    const camp = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {camp, webpageheading: `Edit ${camp.title}`});
})

app.put('/campgrounds/:id',async (req,res) => {
    await Campground.findByIdAndUpdate(req.params.id,req.body.campground,{new: true, runValidators: true});
    res.redirect(`/campgrounds/${req.params.id}`);
})

app.delete('/campgrounds/:id', async (req,res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds');
})

app.listen(port,() => {
    console.log("app listening on port",port);
})