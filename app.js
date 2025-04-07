const path = require('path');
const express = require('express');
const OS = require('os');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));
app.use(cors());

// MongoDB connection using async/await
const DB_URI = process.env.MONGO_URI;
async function connectDB() {
    try {
        await mongoose.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
    }
}

connectDB(); // Connect to DB

// Define schema and model only if connected
let planetModel;
const dataSchema = new mongoose.Schema({
    name: String,
    id: Number,
    description: String,
    image: String,
    velocity: String,
    distance: String
});
planetModel = mongoose.model('planets', dataSchema);

// Planet POST API
app.post('/planet', async function (req, res) {
    try {
        const planetData = await planetModel.findOne({ id: req.body.id });
        if (!planetData) {
            return res.status(404).send("Planet not found.");
        }
        res.send(planetData);
    } catch (err) {
        console.error("❌ Error fetching planet:", err.message);
        res.status(500).send("Server error");
    }
});

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/', 'index.html'));
});

// Health checks
app.get('/os', (req, res) => {
    res.json({
        os: OS.hostname(),
        env: process.env.NODE_ENV
    });
});

app.get('/live', (req, res) => {
    res.json({ status: "live" });
});

app.get('/ready', (req, res) => {
    res.json({ status: "ready" });
});

app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});

module.exports = app;
