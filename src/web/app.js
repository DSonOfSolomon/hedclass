const express = require("express");
const path = require("path");
const db = require("./models/db");
const session = require("express-session");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const degreeRoutes = require("./routes/degreeRoutes")
const studentRoutes = require("./routes/studentRoutes");



const app = express();
const PORT = 4000;


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "hedclass_secret_key", // secret used to sign the session cookie
    resave: false,                 
    saveUninitialized: false       // don't create sessions until something stored
}));

app.use("/", adminRoutes);
app.use("/", authRoutes);
app.use("/", degreeRoutes);
app.use("/", studentRoutes);

app.get("/", (req, res) => {
    res.render("index");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});