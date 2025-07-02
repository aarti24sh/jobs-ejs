require("dotenv").config();

const express = require("express");
const csrf = require("host-csrf");
const cookieParser = require("cookie-parser");
require("express-async-errors");

const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const passport = require("passport");
const passportInit = require("./passport/passportInit");

const app = express();

app.set("view engine", "ejs");

// Middleware setup
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(require("body-parser").urlencoded({ extended: true }));

// Session setup
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "mySessions",
});
store.on("error", function (error) {
  console.log(error);
});

const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1);
  sessionParms.cookie.secure = true;
}

app.use(session(sessionParms));

// Passport init
passportInit();
app.use(passport.initialize());
app.use(passport.session());

// Flash and CSRF
app.use(require("connect-flash")());
app.use(
  csrf({
    methods: ["POST", "PUT", "PATCH", "DELETE"], // protect these
  })
);

// Store user/flash/csrf info in res.locals
app.use(require("./middleware/storeLocals"));

// Routes
app.get("/", (req, res) => {
  res.render("index");
});
app.use("/sessions", require("./routes/sessionRoutes"));
app.use("/jobs", require("./routes/jobsRoutes"));

// Auth-protected secretWord routes
const auth = require("./middleware/auth");
const secretWordRouter = require("./routes/secretWord");
app.use("/secretWord", auth, secretWordRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

// CSRF error handler
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).send("CSRF token validation failed.");
  }
  next(err);
});

// General error handler
app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  console.log(err);
});

// Start server
const port = process.env.PORT || 3000;
const start = async () => {
  try {
    await require("./db/connect")(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();