const { campgroundSchema, reviewSchema } = require("./JoiSchemas.js");
const AppError = require("./utils/AppError");

const Campground = require("./models/campground");
const User = require("./models/users");
const Review = require("./models/review");

function validateCampground(req, res, next) {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((e) => e.message).join(",");
        throw new AppError(msg, 400);
    } else {
        next();
    }
}

function validateReview(req, res, next) {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((e) => e.message).join(",");
        throw new AppError(msg, 400);
    } else {
        next();
    }
}

function isLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be logged in!");
        return res.redirect("/yelp/login");
    }
    next();
}

async function isCampgroundAuthor(req, res, next) {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if (!camp) {
        req.flash("error", "Couldn't find that campground");
        return res.redirect("/campgrounds");
    }
    if (camp.author.equals(req.user._id)) {
        return next();
    }
    req.flash(
        "error",
        "You are not allowed to do that, you are not the campground author"
    );
    res.redirect(`/campgrounds/${id}`);
}

async function isReviewAuthor(req, res, next) {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (review && review.author.equals(req.user._id)) {
        return next();
    }
    req.flash(
        "error",
        "You are not the author of this review, cannot delete it"
    );
    res.redirect(`/campgrounds/${id}`);
}

module.exports = {
    validateCampground,
    validateReview,
    isLoggedIn,
    isCampgroundAuthor,
    isReviewAuthor,
};
