const { db } = require('../config/database');

// Sample states data for India (countryid: 1)
const sampleStates = [
  { statename: 'Maharashtra', statecode: 'MH', statecapital: 'Mumbai', countryid: 1 },
  { statename: 'Delhi', statecode: 'DL', statecapital: 'New Delhi', countryid: 1 },
  { statename: 'Karnataka', statecode: 'KA', statecapital: 'Bangalore', countryid: 1 },
  { statename: 'Tamil Nadu', statecode: 'TN', statecapital: 'Chennai', countryid: 1 },
  { statename: 'Gujarat', statecode: 'GJ', statecapital: 'Gandhinagar', countryid: 1 },
  { statename: 'Rajasthan', statecode: 'RJ', statecapital: 'Jaipur', countryid: 1 },
  { statename: 'Uttar Pradesh', statecode: 'UP', statecapital: 'Lucknow', countryid: 1 },
  { statename: 'West Bengal', statecode: 'WB', statecapital: 'Kolkata', countryid: 1 },
  { statename: 'Telangana', statecode: 'TS', statecapital: 'Hyderabad', countryid: 1 },
  { statename: 'Andhra Pradesh', statecode: 'AP', statecapital: 'Amaravati', countryid: 1 },
  { statename: 'Kerala', statecode: 'KL', statecapital: 'Thiruvananthapuram', countryid: 1 },
  { statename: 'Punjab', statecode: 'PB', statecapital: 'Chandigarh', countryid: 1 },
  { statename: 'Haryana', statecode: 'HR', statecapital: 'Chandigarh', countryid: 1 },
  { statename: 'Madhya Pradesh', statecode: 'MP', statecapital: 'Bhopal', countryid: 1 },
  { statename: 'Bihar', statecode: 'BR', statecapital: 'Patna', countryid: 1 },
  { statename: 'Odisha', statecode: 'OD', statecapital: 'Bhubaneswar', countryid: 1 },
  { statename: 'Jharkhand', statecode: 'JH', statecapital: 'Ranchi', countryid: 1 }
];

// Function to seed states
const seedStates = () => {
  try {
    console.log('🌱 Seeding states...');
    const existingCount = db.prepare('SELECT COUNT(*) as count FROM ldg_states').get();
    if (existingCount.count > 0) {
      console.log(`✅ States already exist (${existingCount.count} states found)`);
      return;
    }
    const stmt = db.prepare('INSERT INTO ldg_states (statename, statecode, statecapital, countryid) VALUES (?, ?, ?, ?)');
    for (const state of sampleStates) {
      stmt.run(state.statename, state.statecode, state.statecapital, state.countryid);
      console.log(`✅ Added: ${state.statename} (${state.statecode})`);
    }
    console.log(`🎉 Successfully seeded ${sampleStates.length} states!`);
  } catch (error) {
    console.error('❌ Error seeding states:', error);
  }
};

seedStates(); 