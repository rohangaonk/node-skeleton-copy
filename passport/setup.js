const bcrypt = require("bcrypt");
const User = require("../models/Users_passsport");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20");
const FacebookStrategy = require("passport-facebook");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// local Strategy
passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          return done(null, false, { message: "Invalid Credentials" });
        }
        bcrypt
          .compare(password, user.password)
          .then((isCorrect) => {
            if (isCorrect) return done(null, user);
            else {
              return done(null, false, {
                message: "Invalid Credentials",
              });
            }
          })
          .catch((err) => done(err));
      })
      .catch((err) => done(err));
  })
);

// facebook stretegy
passport.use(
  new FacebookStrategy(
    {
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_AUTH_CALLBACK,
      passReqToCallback: true,
    },
    (req, token, refreshToken, profile, done) => {
      // check if user logged in
      if (!req.user) {
        //find user based on facebook id
        User.findOne({ "facebook.id": profile.id }, (err, user) => {
          if (err) return done(err);

          // if user found log them
          if (user) return done(null, user);
          else {
            const newUser = new User({
              facebook: {
                id: profile.id,
                token: token,
                name: profile.name.givenName + " " + profile.name.familyName,
                email: profile.emails[0].value,
              },
            });
            newUser.save((err) => {
              if (err) throw err;

              return done(null, newUser);
            });
          }
        });
      } else {
        // user already exists and logged in, link accounts
        const user = req.user;

        user.facebook.id = profile.id;
        user.facebook.token = token;
        user.facebook.name =
          profile.name.givenName + " " + profile.name.familyName;
        user.facebook.email = profile.emails[0].value;

        // save user
        user.save((err) => {
          if (err) throw err;
          return done(null, user);
        });
      }
    }
  )
);
