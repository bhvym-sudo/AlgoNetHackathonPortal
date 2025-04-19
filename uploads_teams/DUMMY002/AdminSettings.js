// models/AdminSettings.js
import mongoose from 'mongoose';

const AdminSettingsSchema = new mongoose.Schema({
  studentRound1: { type: Boolean, default: true },
  evaluatorRound1: { type: Boolean, default: true },
  studentRound2: { type: Boolean, default: true },
  evaluatorRound2: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.AdminSettings || mongoose.model('AdminSettings', AdminSettingsSchema);
