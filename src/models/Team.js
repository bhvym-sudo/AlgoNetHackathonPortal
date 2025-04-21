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
  leaderEmail: String,
  member2Name: String,
  member2Enrollment: String,
  member2Email: String,
  member3Name: String,
  member3Enrollment: String,
  member3Email: String,
  member4Name: String,
  member4Enrollment: String,
  member4Email: String,
  problemStatement: String,
  submitted: {
    type: Boolean,
    default: false
  },
  submittedBy: String,
  submittedAt: Date,
  
  // Student marked attendance
  rnd1attstud: {
    leader: { type: Boolean, default: false },
    member2: { type: Boolean, default: false },
    member3: { type: Boolean, default: false },
    member4: { type: Boolean, default: false },
    markedBy: { type: String },
    markedAt: { type: Date }
  },
  
  // Student marked attendance for Round 2
  rnd2attstud: {
    leader: { type: Boolean, default: false },
    member2: { type: Boolean, default: false },
    member3: { type: Boolean, default: false },
    member4: { type: Boolean, default: false },
    markedBy: { type: String },
    markedAt: { type: Date }
  },
  
  // Evaluator marked attendance
  rnd1atteval: {
    leader: { type: Boolean, default: false },
    member2: { type: Boolean, default: false },
    member3: { type: Boolean, default: false },
    member4: { type: Boolean, default: false },
    markedBy: { type: String },
    markedAt: { type: Date }
  },
  
  // New field for evaluator marks
  rnd1marks: {
    type: Number,
    min: 0,
    max: 20,
    default: null
  },
  
  // Round evaluations
  round1: {
    marks: { type: Number, min: 0, max: 100, default: null },
    feedback: String,
    evaluator: String,
    evaluatedAt: Date
  },
  round2: {
    marks: { type: Number, min: 0, max: 100, default: null },
    feedback: String,
    evaluator: String,
    evaluatedAt: Date
  },
  
  changes: {
    type: Array,
    default: null
  }
}, { timestamps: true });

export default mongoose.models.Team || mongoose.model('Team', TeamSchema);
