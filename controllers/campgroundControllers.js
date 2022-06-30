const { s3Upload, s3Delete } = require("../aws");
const Campground = require("../models/campground");
const AppError = require("../utils/AppError");
const mapboxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mapboxGeocoding({ accessToken: mapboxToken });

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
    try {
        const geoData = await geocoder
            .forwardGeocode({
                query: req.body.campground.location,
                limit: 1,
            })
            .send();
        const result = await s3Upload(req.files);
        const camp = new Campground(req.body.campground);
        camp.geometry = geoData.body.features[0].geometry;
        camp.author = req.user._id;
        const ans = result.map((file) => ({
            url: file.Location,
            filename: file.Key.split("/")[1],
        }));
        camp.images = ans;
        await camp.save();
        req.flash("success", "Successfully made a new campground");
        res.redirect(`/campgrounds/${camp._id}`);
    } catch (e) {
        console.log(e);
        req.flash("error", "Something went wrong, try again");
        res.redirect("/campgrounds");
    }
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

//! images are not getting pushed to the camp.images array
const putEditCampground = async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    const result = await s3Upload(req.files);
    const ans = result.map((file) => ({
        url: file.Location,
        filename: file.Key.split("/")[1],
    }));
    for (let a of ans) {
        camp.images.push(a);
    }
    const geoData = await geocoder
        .forwardGeocode({
            query: req.body.campground.location,
            limit: 1,
        })
        .send();
    camp.geometry = geoData.body.features[0].geometry;
    await camp.save();
    await Campground.findByIdAndUpdate(id, req.body.campground, {
        new: true,
        runValidators: true,
    });
    req.flash("success", "Successfully updated campground");
    res.redirect(`/campgrounds/${id}`);
};

const deleteOneCampground = async (req, res, next) => {
    const result = await Campground.findByIdAndDelete(req.params.id);
    if (result) {
        req.flash("info", "Deleted Campground successfully");
        res.redirect("/campgrounds");
    } else {
        req.flash("error", "Couldn't find that campground");
        return res.redirect("/campgrounds");
    }
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
