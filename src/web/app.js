const express = require("express");
const path = require("path");

const app = express();
const PORT = 4000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("HEdClass Web App Running");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});