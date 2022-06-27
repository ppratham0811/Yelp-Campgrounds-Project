const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middlewares");
const catchAsync = require("../utils/catchAsync");
const reviewControllers = require("../controllers/reviewControllers");

router.post(
    "/",
    isLoggedIn,
    validateReview,
    catchAsync(reviewControllers.postReview)
);

router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    catchAsync(reviewControllers.deleteReview)
);

module.exports = router;
