import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
  teamId: {
    type: String,
    required: true,
    unique: true
  },
  leaderName: String,
  leaderEnrollment: String,
  leaderMobile: String,
  leaderPresent: { type: Boolean, default: false },
  member2Name: String,
  member2Enrollment: String,
  member2Present: { type: Boolean, default: false },
  member3Name: String,
  member3Enrollment: String,
  member3Present: { type: Boolean, default: false },
  member4Name: String,
  member4Enrollment: String,
  member4Present: { type: Boolean, default: false },
  problemStatement: String,
  submitted: { type: Boolean, default: false },
  submittedBy: String,
  submittedAt: Date,
  
  // Add round 1 student attendance field
  // Make sure your Team model includes this field
  rnd1attstud: {
    leader: { type: Boolean, default: false },
    member2: { type: Boolean, default: false },
    member3: { type: Boolean, default: false },
    member4: { type: Boolean, default: false },
    markedBy: String,
    markedAt: Date
  },

  round1: {
    marks: Number,
    feedback: String,
    evaluatedAt: Date
  },
  round2: {
    marks: Number,
    feedback: String,
    evaluatedAt: Date
  },

  changes: {
    type: Array,
    default: null
  }
}, { timestamps: true });

export default mongoose.models.Team || mongoose.model('Team', TeamSchema);
