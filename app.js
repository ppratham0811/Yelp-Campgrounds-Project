if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const multer = require("multer");
const secret = process.env.SECRET || "yelpcampsessionsecret";
const dbUrl = process.env.DB_URL;
const localDb = "mongodb://localhost:27017/yelp-camp";
const MongoStore = require("connect-mongo");

const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

mongoose
  // .connect(localDb)
  .connect(dbUrl)
  .then(() => {
    console.log("database connected, connection open");
  })
  .catch((err) => {
    console.log("connection failed", err);
  });

const AppError = require("./utils/AppError");
const User = require("./models/users");
const campgroundRoutes = require("./routes/campgroundRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const userRoutes = require("./routes/userRoutes");

app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 3600,
  crypto: {
    secret,
  },
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
  store,
  name: "__ycs",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [
  "https://fonts.gstatic.com",
  "https://fonts.googleapis.com",
];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://source.unsplash.com/",
        "https://yelpcampbucket.s3.ap-south-1.amazonaws.com/uploads/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
      // mediaSrc: ["https://yelpcampbucket.s3.ap-south-1.amazonaws.com/uploads/"],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  res.locals.infoMsg = req.flash("info");
  next();
});

app.get("/", (req, res) => {
  res.render("index", { req });
});
app.use("/yelp", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.all("*", (req, res, next) => {
  next(new AppError("Page not found", 404));
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      req.flash("error", "File size too large");
      return res.redirect(req.originalUrl);
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      req.flash("error", "Cannot upload more than 5 images");
      return res.redirect(req.originalUrl);
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      req.flash(
        "error",
        "Only jpeg, png, jpg and jfif file types are supported"
      );
      return res.redirect(req.originalUrl);
    }
  }

  const { message = "Something went wrong", status = 500 } = err;
  res.status(status).render("errorpage", {
    err,
    webpageheading: `Error (${status})`,
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("app listening on port", port);
});
