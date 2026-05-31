const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(express.json());

// Database Connection Pool for Aiven
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 25060,
    ssl: { rejectUnauthorized: false } 
});

// Helper: Haversine Formula for Distance calculation
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

// --- API 1: Add School ---
app.post('/addSchool', async (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    if (!name || !address || isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: "Please provide valid name, address, and coordinates." });
    }

    try {
        await db.execute(
            'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
            [name, address, latitude, longitude]
        );
        res.status(201).json({ message: "School added successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Database error", details: err.message });
    }
});

// --- API 2: List Schools (Sorted by Proximity) ---
app.get('/listSchools', async (req, res) => {
    const userLat = parseFloat(req.query.latitude);
    const userLon = parseFloat(req.query.longitude);

    if (isNaN(userLat) || isNaN(userLon)) {
        return res.status(400).json({ error: "User latitude and longitude are required." });
    }

    try {
        const [schools] = await db.execute('SELECT * FROM schools');

        const sortedSchools = schools.map(school => ({
            ...school,
            distance: calculateDistance(userLat, userLon, school.latitude, school.longitude)
        })).sort((a, b) => a.distance - b.distance);

        res.json(sortedSchools);
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
});
// Add a simple home route to confirm the API is alive
app.get('/', (req, res) => {
    res.send('🏫 School Management API is Live and Running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API active at http://localhost:${PORT}`));