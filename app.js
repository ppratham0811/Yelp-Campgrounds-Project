const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Joi = require("joi");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

mongoose
    .connect("mongodb://localhost:27017/yelp-camp")
    .then(() => {
        console.log("database connected, connection open");
    })
    .catch((err) => {
        console.log("connection failed", err);
    });

const AppError = require("./utils/AppError");
const User = require("./models/users");
const campgroundRoutes = require("./routes/campgroundRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const userRoutes = require("./routes/userRoutes");

app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
const sessionConfig = {
    name: "yelp-campgrounds-session",
    secret: "yelpcampgroundsprojectprathamesh",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    res.locals.infoMsg = req.flash("info");
    next();
});

app.get("/", (req, res) => {
    res.render("index");
});
app.use("/yelp",userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.all("*", (req, res, next) => {
    next(new AppError("Page not found", 404));
});

app.use((err, req, res, next) => {
    const { message = "Something went wrong", status = 500 } = err;
    res.status(status).render("errorpage", {
        err,
        webpageheading: `Error (${status})`,
    });
});

app.listen(port, () => {
    console.log("app listening on port", port);
});
