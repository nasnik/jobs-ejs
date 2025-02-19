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
router
    .route("/logon")
    .get(logonShow)
    .post(
         passport.authenticate("local", {
           successRedirect: "/",
           failureRedirect: "/sessions/logon",
           failureFlash: true,
         }),
        (req, res) => {
            console.log('req.user=',req.user); // Check if user data is populated after login
        }
    );
router.route("/logoff").post(logoff);

module.exports = router;