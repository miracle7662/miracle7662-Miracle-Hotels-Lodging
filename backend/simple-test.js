const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.json({ 
        message: "Simple test API is running!",
        status: "success"
    });
});

// Test floors endpoint
app.get("/api/floors", (req, res) => {
    res.json([
        { floorid: 1, floor_name: "Ground Floor", display_name: "GF", status: 1 },
        { floorid: 2, floor_name: "First Floor", display_name: "1F", status: 1 }
    ]);
});

app.get("/api/floors/my-floors", (req, res) => {
    res.json([
        { floorid: 1, floor_name: "Ground Floor", display_name: "GF", status: 1, Hotel_id: 4 }
    ]);
});

app.listen(PORT, () => {
    console.log(`🚀 Simple test server is running on port ${PORT}`);
    console.log(`📊 Ready to accept requests!`);
}); 