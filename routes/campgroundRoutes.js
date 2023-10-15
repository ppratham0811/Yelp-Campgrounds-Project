const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const {
    validateCampground,
    isLoggedIn,
    isCampgroundAuthor,
    deleteImages,
    checkImagesLength,
    deleteEditPageImages,
} = require("../middlewares");
const campgroundControllers = require("../controllers/campgroundControllers");
const multer = require("multer");
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[0] === "image") {
        cb(null, true);
    } else {
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
    }
};
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1050000000, files: 5 },
});

router
    .route("/")
    .get(catchAsync(campgroundControllers.getAllCampgrounds))
    .post(
        isLoggedIn,
        upload.array("image"),
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
        upload.array("image"),
        deleteEditPageImages,
        checkImagesLength,
        validateCampground,
        catchAsync(campgroundControllers.putEditCampground)
    )
    .delete(
        isLoggedIn,
        isCampgroundAuthor,
        deleteImages,
        catchAsync(campgroundControllers.deleteOneCampground)
    );

router.get(
    "/:id/edit",
    isLoggedIn,
    isCampgroundAuthor,
    catchAsync(campgroundControllers.getEditCampground)
);

module.exports = router;
