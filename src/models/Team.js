import mongoose from 'mongoose';

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

export default mongoose.models.Team || mongoose.model('Team', TeamSchema);