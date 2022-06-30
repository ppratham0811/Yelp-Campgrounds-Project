const { campgroundSchema, reviewSchema } = require("./JoiSchemas.js");
const AppError = require("./utils/AppError");
const Campground = require("./models/campground");
const Review = require("./models/review");
const { s3Delete } = require("./aws");

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
        // console.log(req.session.returnTo);
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

const deleteEditPageImages = async (req, res, next) => {
    // deleting images which have been checked (on the edit page):
    const id = req.params.id;
    const camp = await Campground.findById(id);
    const deleteImages = req.body.deleteImages;
    if (
        deleteImages &&
        deleteImages.length === camp.images.length &&
        req.files.length === 0
    ) {
        req.flash("error", "Campground should have atleast one image");
        return res.redirect(`/campgrounds/${id}/edit`);
    } else if (deleteImages) {
        await camp.updateOne({
            $pull: { images: { filename: { $in: deleteImages } } },
        });
        for (let imgName of deleteImages) {
            await s3Delete(imgName);
        }
        next();
    }
};

const checkImagesLength = async (req, res, next) => {
    const id = req.params.id;
    const camp = await Campground.findById(id);
    if (camp) {
        if (camp.images.length + req.files.length > 5) {
            req.flash("error", "Max no. of images allowed is 5");
            return res.redirect(`/campgrounds/${id}/edit`);
        } else {
            next();
        }
    } else {
        req.flash("error", "Campground doesnt exist");
        res.redirect("/campgrounds");
    }
};

const deleteImages = async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if (camp) {
        for (let img of camp.images) {
            await s3Delete(img.filename);
        }
        next();
    } else {
        req.flash("error", "Couldn't find that campground");
        return res.redirect("/campgrounds");
    }
};

module.exports = {
    validateCampground,
    validateReview,
    isLoggedIn,
    isCampgroundAuthor,
    isReviewAuthor,
    deleteEditPageImages,
    checkImagesLength,
    deleteImages,
};
