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
  rnd1attstud: {
    leader: { type: Boolean, default: false },
    member2: { type: Boolean, default: false },
    member3: { type: Boolean, default: false },
    member4: { type: Boolean, default: false },
    markedBy: { type: String },
    markedAt: { type: Date }
  },
  rnd2attstud: {
    leader: { type: Boolean, default: false },
    member2: { type: Boolean, default: false },
    member3: { type: Boolean, default: false },
    member4: { type: Boolean, default: false },
    markedBy: { type: String },
    markedAt: { type: Date }
  },
  rnd1atteval: {
    leader: { type: Boolean, default: false },
    member2: { type: Boolean, default: false },
    member3: { type: Boolean, default: false },
    member4: { type: Boolean, default: false },
    markedBy: { type: String },
    markedAt: { type: Date }
  },
  rnd2atteval: {
    leader: { type: Boolean, default: false },
    member2: { type: Boolean, default: false },
    member3: { type: Boolean, default: false },
    member4: { type: Boolean, default: false },
    markedBy: { type: String },
    markedAt: { type: Date }
  },
  rnd1marks: Number,
  rnd2marks: {
    type: Number,
    min: 0,
    max: 80,
    default: null
  }
}, { timestamps: true });

export default mongoose.models.Team || mongoose.model('Team', TeamSchema);
