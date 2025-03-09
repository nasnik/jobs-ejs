const express = require("express");
const passport = require("passport");
const router = express.Router();

const {
    logonShow,
    registerShow,
    registerDo,
    logoff,
} = require("../controllers/sessionController");

router.route("/register").get(registerShow).post(registerDo);

router.route("/logon").get(logonShow).post((req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err); // Handle errors
        }
        if (!user) {
            // Authentication failed
            return res.redirect("/sessions/logon"); // Redirect back to logon
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            // Authentication successful
            return res.redirect("/"); // Redirect to home page
        });
    })(req, res, next);
});

router.route("/logoff").post(logoff);

module.exports = router;
