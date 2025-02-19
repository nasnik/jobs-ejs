const express = require('express');
require('express-async-errors');
const app = express();
const flash = require('connect-flash');
app.use(flash());
// Load environment variables
require('dotenv').config();

// Set EJS as the view engine
app.set('view engine', 'ejs'); // Ensure this line is present
app.set('views', './views');   // Specify the views directory

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: true }));

// Session management
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const url = process.env.MONGO_URI;
const store = new MongoDBStore({
    uri: url,
    collection: 'mySessions',
});
store.on('error', function (error) {
    console.log(error);
});

const sessionParams = {
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: { secure: false, sameSite: 'strict' },
};

if (app.get('env') === 'production') {
    app.set('trust proxy', 1); // Trust first proxy
    sessionParams.cookie.secure = true; // Serve secure cookies
}

app.use(session(sessionParams));

// Flash messages
app.use(require('connect-flash')());

// Attach flash messages to locals using express-messages
app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Passport.js initialization
const passport = require('passport');
require('./passport/passportInit')();
app.use(passport.initialize());
app.use(passport.session());
app.use(require('./middleware/storeLocals'));
// Routes
app.use('/sessions', require('./routes/sessionRoutes'));
app.use('/secretWord', require('./middleware/auth'), require('./routes/secretWord'));

// Default route
app.get('/', (req, res) => {
    res.render('index'); // Render the EJS template
});

// Error handling
app.use((req, res) => {
    res.status(404).send(`That page (${req.url}) was not found.`);
});
app.use((err, req, res, next) => {
    res.status(500).send(err.message);
    console.error(err);
});

// Start server
const port = process.env.PORT || 3000;
const start = async () => {
    try {
        await require('./db/connect')(process.env.MONGO_URI);
        app.listen(port, () => console.log(`Server is listening on port ${port}...`));
    } catch (error) {
        console.error(error);
    }
};
start();