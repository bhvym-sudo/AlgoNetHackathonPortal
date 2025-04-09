// scripts/seed.js
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Check if MONGODB_URI is defined
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is not defined!');
  console.log('Make sure you have a .env file in your project root with MONGODB_URI defined.');
  console.log('Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB...');

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "hackathon"
}).then(() => {
  console.log('Connected to MongoDB successfully');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
  process.exit(1);
});

// Define schemas
const ProblemSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String
});

const TeamSchema = new mongoose.Schema({
  teamId: String,
  members: [
    {
      name: String,
      email: String,
      present: Boolean
    }
  ],
  problemStatement: String,
  submitted: { type: Boolean, default: false }
});

// Create models
const Problem = mongoose.models.Problem || mongoose.model('Problem', ProblemSchema);
const Team = mongoose.models.Team || mongoose.model('Team', TeamSchema);

// Sample data
const problemStatements = [
  {
    title: "AI for Social Good",
    description: "Develop an AI solution that addresses a pressing social issue such as poverty, education, or healthcare accessibility.",
    category: "Artificial Intelligence"
  },
  {
    title: "Blockchain Solutions for Supply Chain",
    description: "Create a blockchain-based application that improves transparency and efficiency in supply chain management.",
    category: "Blockchain"
  },
  {
    title: "Healthcare Innovation",
    description: "Build a technology solution that improves patient care, medical diagnosis, or healthcare administration.",
    category: "Healthcare"
  },
  {
    title: "Sustainable Energy Platforms",
    description: "Develop an application that promotes or facilitates the use of renewable energy sources.",
    category: "Environmental"
  },
  {
    title: "EdTech Revolution",
    description: "Create an innovative educational technology solution to enhance learning experiences or accessibility.",
    category: "Education"
  },
  {
    title: "Smart City Infrastructure",
    description: "Design a solution that makes urban environments more efficient, sustainable, or livable.",
    category: "Urban Planning"
  }
];

const sampleTeams = [
  {
    teamId: "TEAM003",
    members: [
      { name: "Alice Johnson", email: "alice@example.com", present: false },
      { name: "Bob Smith", email: "bob@example.com", present: false }
    ],
    problemStatement: "",
    submitted: false
  },
  {
    teamId: "TEAM004",
    members: [
      { name: "Charlie Brown", email: "charlie@example.com", present: false },
      { name: "Diana Prince", email: "diana@example.com", present: false },
      { name: "Ethan Hunt", email: "ethan@example.com", present: false }
    ],
    problemStatement: "",
    submitted: false
  }
];

// Seed the database
async function seedDatabase() {
  try {
    // Clear existing data
    await Problem.deleteMany({});
    console.log('Cleared existing problem statements');
    
    // Add problem statements
    await Problem.insertMany(problemStatements);
    console.log('Added problem statements');
    
    // Only add sample teams if they don't exist
    for (const team of sampleTeams) {
      const existingTeam = await Team.findOne({ teamId: team.teamId });
      if (!existingTeam) {
        await Team.create(team);
        console.log(`Created team ${team.teamId}`);
      } else {
        console.log(`Team ${team.teamId} already exists`);
      }
    }
    
    console.log('Database seeded successfully');
    
    // Close the connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();