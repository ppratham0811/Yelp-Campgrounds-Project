const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const userControllers = require("../controllers/userControllers");

router
    .route("/register")
    .get(userControllers.getRegisterForm)
    .post(catchAsync(userControllers.registerNewUser));

router
    .route("/login")
    .get(userControllers.getLoginForm)
    .post(
        passport.authenticate("local", {
            failureFlash: true,
            failureRedirect: "/yelp/login",
            keepSessionInfo: true,
        }),
        userControllers.postLoginForm
    );

router.get("/logout", userControllers.logoutUser);

module.exports = router;
