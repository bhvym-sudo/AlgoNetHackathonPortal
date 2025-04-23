import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

const MCATaskSchema = new mongoose.Schema({}, { strict: false });
const MCATask = mongoose.models.MCAProblem || mongoose.model('MCAProblem', MCATaskSchema, 'mcaproblems');

export async function GET() {
  await connectToDB();
  const doc = await MCATask.findOne({});
  if (!doc) {
    return NextResponse.json({ problemStatements: [] });
  }
  // Extract prblm1 ... prblm12
  const problemStatements = [];
  for (let i = 1; i <= 12; i++) {
    if (doc[`prblm${i}`]) {
      problemStatements.push({ key: `prblm${i}`, text: doc[`prblm${i}`] });
    }
  }
  return NextResponse.json({ problemStatements });
}