const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const {
    validateCampground,
    isLoggedIn,
    isCampgroundAuthor,
} = require("../middlewares");
const campgroundControllers = require("../controllers/campgroundControllers");
// const multer = require('multer');
// const { storage } = require('../cloudinary');
// const upload = multer({ storage });

router
    .route("/")
    .get(catchAsync(campgroundControllers.getAllCampgrounds))
    .post(
        isLoggedIn,
        validateCampground,
        catchAsync(campgroundControllers.makeNewCampground)
    );

router.get("/new", isLoggedIn, campgroundControllers.getNewCampground);

router
    .route("/:id")
    .get(catchAsync(campgroundControllers.getOneCampground))
    .put(
        isLoggedIn,
        isCampgroundAuthor,
        validateCampground,
        catchAsync(campgroundControllers.putEditCampground)
    )
    .delete(
        isLoggedIn,
        isCampgroundAuthor,
        catchAsync(campgroundControllers.deleteOneCampground)
    );

router.get(
    "/:id/edit",
    isLoggedIn,
    isCampgroundAuthor,
    catchAsync(campgroundControllers.getEditCampground)
);

module.exports = router;
