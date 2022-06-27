const Campground = require("../models/campground");

const getAllCampgrounds = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    const total = await Campground.count();
    res.render("campgrounds/campgrounds", {
        campgrounds,
        total,
        webpageheading: "All Campgrounds Page",
    });
};

const getNewCampground = (req, res) => {
    res.render("campgrounds/new", { webpageheading: "Make a new Campground" });
};

const makeNewCampground = async (req, res, next) => {
    const camp = new Campground(req.body.campground);
    camp.author = req.user._id;
    await camp.save();
    req.flash("success", "Successfully made a new campground");
    res.redirect(`/campgrounds/${camp._id}`);
};

const getOneCampground = async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("author");
    if (!camp) {
        req.flash("error", "Couldn't find that campground");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", {
        camp,
        webpageheading: `${camp.title}`,
    });
};

const getEditCampground = async (req, res, next) => {
    const camp = await Campground.findById(req.params.id);
    if (!camp) {
        req.flash("error", "Couldn't find that campground");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", {
        camp,
        webpageheading: `Edit ${camp.title}`,
    });
};

const putEditCampground = async (req, res, next) => {
    await Campground.findByIdAndUpdate(req.params.id, req.body.campground, {
        new: true,
        runValidators: true,
    });
    req.flash("success", "Successfully updated campground");
    res.redirect(`/campgrounds/${req.params.id}`);
};

const deleteOneCampground = async (req, res, next) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash("info", "Deleted Campground successfully");
    res.redirect("/campgrounds");
};

module.exports = {
    getAllCampgrounds,
    getNewCampground,
    makeNewCampground,
    getOneCampground,
    getEditCampground,
    putEditCampground,
    deleteOneCampground,
};
