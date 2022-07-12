const mongoose = require("mongoose");
const Review = require("./review");
const { Schema, model } = mongoose;

const opts = { toJSON: { virtuals: true } };

const campgroundSchema = new Schema(
    {
        title: String,
        images: [
            {
                url: String,
                filename: String,
            },
        ],
        price: Number,
        description: String,
        location: String,
        geometry: {
            type: {
                type: String,
                enum: ["Point"],
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
        reviews: [
            {
                type: Schema.Types.ObjectId,
                ref: "Review",
            },
        ],
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    opts
);

campgroundSchema.virtual("properties.popupText").get(function() {
    return `<a href="/campgrounds/${this._id}" target="_blank">${this.title}</a><br><small>${this.location}</small>`;
});

campgroundSchema.post("findOneAndDelete", async function (camp) {
    if (camp.reviews.length) {
        await Review.deleteMany({
            _id: {
                $in: camp.reviews,
            },
        });
    }
});

const Campground = model("Campground", campgroundSchema);

module.exports = Campground;
