const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const app = express();

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // Serve static files like CSS
app.use(methodOverride("_method"));

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/assignment3", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Mongoose Schema and Model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
});

const User = mongoose.model("User", userSchema);

// Routes
// Display All Users
app.get("/", async (req, res) => {
  const users = await User.find();
  res.render("index", { users });
});

// Display Add User Page
app.get("/add", (req, res) => {
  res.render("add");
});

// Add New User
app.post("/users", async (req, res) => {
  const { name, email, age } = req.body;
  await new User({ name, email, age }).save();
  res.redirect("/");
});

// Display Edit User Page
app.get("/edit/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render("edit", { user });
});

// Update User
app.put("/users/:id", async (req, res) => {
  const { name, email, age } = req.body;
  await User.findByIdAndUpdate(req.params.id, { name, email, age });
  res.redirect("/"); // Redirect to user list after update
});

// Delete User
app.post("/delete/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect("/");
});

// Search Users
// Search Users Route
app.get("/users/search", async (req, res) => {
  try {
    const { query } = req.query; // Get the query from the URL

    // Search users by name or email (case-insensitive)
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } }, // Match name (case insensitive)
        { email: { $regex: query, $options: "i" } }, // Match email (case insensitive)
      ],
    });

    // Render the search results page (search.ejs)
    res.render("search", { users, query });
  } catch (err) {
    res.status(500).send("Error fetching users");
  }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
