const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "hackathon",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
};

// Define Team Schema
const TeamSchema = new mongoose.Schema({
  teamId: {
    type: String,
    required: true,
    unique: true
  },
  leaderName: String,
  leaderEnrollment: String,
  leaderMobile: String,
  member2Name: String,
  member2Enrollment: String,
  member3Name: String,
  member3Enrollment: String,
  member4Name: String,
  member4Enrollment: String,
  problemStatement: String,
  submitted: {
    type: Boolean,
    default: false
  },
  marks: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  feedback: String,
  changes: {
    type: Array,
    default: null
  }
}, { timestamps: true });

const Team = mongoose.models.Team || mongoose.model('Team', TeamSchema);

// Import data
const importData = async () => {
  try {
    // Read the JSON file
    const jsonPath = path.join(__dirname, 'teams.json');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    
    console.log(`Found ${data.length} teams to import`);
    
    // Process each team
    const teams = data.map(item => {
      // Generate teamId with leading zeros
      const id = item.ID || 0;
      const teamId = `BTECH${id.toString().padStart(3, '0')}`;
      
      return {
        teamId,
        leaderName: item['Team Member 1(also the Team Lead)'] || '',
        leaderEnrollment: item['Enrolment ID of Team Member 1 (also the Team Lead)'] || '',
        leaderMobile: item['Contact Number of Team Member 1 (also the Team Lead)']?.toString() || '',
        member2Name: item['Team Member 2 Name'] || '',
        member2Enrollment: item['Enrolment ID of Team Member 2'] || '',
        member3Name: item['Team Member 3 Name'] || '',
        member3Enrollment: item['Enrolment ID of Team Member 3'] || '',
        member4Name: item['Team Member 4 Name'] || '',
        member4Enrollment: item['Enrolment ID of Team Member 4'] || '',
        problemStatement: '',
        submitted: false,
        marks: null,
        feedback: '',
        changes: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });
    
    // Clear existing data (optional)
    await Team.deleteMany({});
    console.log('Cleared existing teams');
    
    // Insert the new data
    await Team.insertMany(teams);
    console.log(`Successfully imported ${teams.length} teams`);
  } catch (error) {
    console.error('Error importing data:', error);
  }
};

// Run the script
const run = async () => {
  await connectToDB();
  await importData();
  console.log('Import complete');
  mongoose.connection.close();
};

run();