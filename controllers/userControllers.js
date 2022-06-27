const User = require("../models/users");

const getRegisterForm = (req, res) => {
    res.render("user/register", { webpageheading: "Register - YelpCamp.com" });
};

const registerNewUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to Yelp Camp");
            res.redirect("/campgrounds");
        });
    } catch (e) {
        req.flash(
            "error",
            "A user with the given username or email is already registered"
        );
        res.redirect("/yelp/register");
    }
};

const getLoginForm = (req, res) => {
    res.render("user/login", { webpageheading: "Login - YelpCamp.com" });
};

const postLoginForm = (req, res) => {
    const username = req.user.username;
    const redirectUrl = req.session.returnTo || "/campgrounds";
    req.flash("success", `Welcome back, ${username}!`);
    res.redirect(redirectUrl);
};

const logoutUser = (req, res) => {
    const username = req.user.username;
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash("info", `See you soon, ${username}!`);
        res.redirect("/campgrounds");
    });
};

module.exports = {
    getRegisterForm,
    registerNewUser,
    getLoginForm,
    postLoginForm,
    logoutUser,
};
