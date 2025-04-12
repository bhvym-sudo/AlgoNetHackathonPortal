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

export default mongoose.models.Team || mongoose.model('Team', TeamSchema);