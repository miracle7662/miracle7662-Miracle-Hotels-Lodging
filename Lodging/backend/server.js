const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require('path');
const { db, testConnection, initDatabase } = require("./config/database");

// Import routes
const countryRoutes = require('./routes/countryRoutes');
const stateRoutes = require('./routes/stateRoutes');
const districtRoutes = require('./routes/districtRoutes');
const zoneRoutes = require('./routes/zoneRoutes');
const superadminRoutes = require('./routes/superadminRoutes');
const agentRoutes = require('./routes/agentRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const hotelTypeRoutes = require('./routes/hotelTypeRoutes');
const marketRoutes = require('./routes/marketRoutes');
const hotelMasterRoutes = require('./routes/hotelMasterRoutes');
const blockMasterRoutes = require('./routes/blockMasterRoutes');
const floorMasterRoutes = require('./routes/floorMasterRoutes');
const guestTypeRoutes = require('./routes/guestTypeRoutes');
const nationalityRoutes = require('./routes/nationalityRoutes');
const newspaperRoutes = require('./routes/newspaperRoutes');
const featureRoutes = require('./routes/featureRoutes');
const fragmentRoutes = require('./routes/fragmentRoutes');
const cityMasterRoutes = require('./routes/cityMasterRoutes');
const companyMasterRoutes = require('./routes/companyMasterRoutes');
const guestMasterRoutes = require('./routes/guestMasterRoutes');




const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize database
initDatabase();
testConnection();

// Routes
app.use('/api/countries', countryRoutes);
app.use('/api/states', stateRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/hotel-types', hotelTypeRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/hotel-masters', hotelMasterRoutes);
app.use('/api/blocks', blockMasterRoutes);
app.use('/api/floors', floorMasterRoutes);
app.use('/api/guest-types', guestTypeRoutes);
app.use('/api/nationalities', nationalityRoutes);
app.use('/api/newspapers', newspaperRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/fragments', fragmentRoutes);
app.use('/api/city-masters', cityMasterRoutes);
app.use('/api/company-masters', companyMasterRoutes);
app.use('/api/guest-masters', guestMasterRoutes);




// Basic route
app.get("/", (req, res) => {
    res.json({ 
        message: "Lodging Management API is running!",
        status: "Database connected successfully",
        endpoints: {
            countries: "/api/countries",
            states: "/api/states",
            districts: "/api/districts",
            zones: "/api/zones",
            superadmin: "/api/superadmin",
            agents: "/api/agents",
            hotels: "/api/hotels",
            hotelTypes: "/api/hotel-types",
            markets: "/api/markets",
            hotelMasters: "/api/hotel-masters",
                    blocks: "/api/blocks",
                                floors: "/api/floors",
                                guestTypes: "/api/guest-types",
            nationalities: "/api/nationalities",
            newspapers: "/api/newspapers",
            features: "/api/features",
            fragments: "/api/fragments",
            cityMasters: "/api/city-masters",
            guestMasters: "/api/guest-masters",



        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📊 Database initialized and ready!`);
});