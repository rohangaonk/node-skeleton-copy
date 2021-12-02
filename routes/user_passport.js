const router = require("express").Router();
const passport = require("passport");

// send to facebook to do the authentication
router.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: "email" })
);

// handle after facebook has authenticated
router.get(
  "auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/profile",
    failureRedirect: "/",
  })
);

// authorize already logged in

// locally
router.get("/connect/local", (req, res) =>
  res.render("connect-local.ejs", { message: req.flash("loginMessage") })
);

router.post(
  "connect/local",
  passport.authenticate("local-signup", {
    successRedirect: "/profile",
    failureRedirect: "connect/local",
    failureFlash: true,
  })
);

// facebook
router.get(
  "/connect/facebook",
  passport.authorize("facebook", {
    scope: ["public_profile", "email"],
  })
);

router.get(
  "/connect/facebook/callback",
  passport.authorize("facebook", {
    successRedirect: "/profile",
    failureRedirect: "/",
  })
);

// google
app.get(
  "/connect/google",
  passport.authorize("google", { scope: ["profile", "email"] })
);

// the callback after google has authorized the user
app.get(
  "/connect/google/callback",
  passport.authorize("google", {
    successRedirect: "/profile",
    failureRedirect: "/",
  })
);
