
const User = require("../models/User");
const parseVErr = require("../utils/parseValidationErrs");

const registerShow = (req, res) => {
    res.render("register");
};

const registerDo = async (req, res, next) => {
    if (req.body.password != req.body.password1) {
        req.flash("error", "The passwords entered do not match.");
        return res.render("register", { errors: req.flash("error") });
    }
    try {
        const { password1, ...userData } = req.body;
        await User.create(userData);
        console.log("After User.create");
        console.log("Redirecting after registration");
        res.redirect("/");
        console.log("After res.redirect");
    } catch (e) {
        console.log("Error during registration:", e);
        if (e.constructor.name === "ValidationError") {
            parseVErr(e, req);
        } else if (e.name === "MongoServerError" && e.code === 11000) {
            req.flash("error", "That email address is already registered.");
        } else {
            console.error("Error registering user:", e);
            req.flash("error", "An error occurred during registration.");
            return res.render("register", { errors: req.flash("error") });
        }
        return res.render("register", { errors: req.flash("error") });
    }
};

const logoff = (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect("/");
    });
};

const logonShow = (req, res) => {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("logon");
};

module.exports = {
    registerShow,
    registerDo,
    logoff,
    logonShow,
};
