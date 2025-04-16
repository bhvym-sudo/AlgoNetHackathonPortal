import { connectToDB } from '@/lib/mongodb';
import AdminSettings from '@/models/AdminSettings';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectToDB();
  let settings = await AdminSettings.findOne();
  if (!settings) {
    settings = await AdminSettings.create({});
  }
  return NextResponse.json(settings);
}

export async function POST(request) {
  const body = await request.json();
  await connectToDB();

  let settings = await AdminSettings.findOne();
  if (!settings) {
    settings = new AdminSettings();
  }

  settings.studentRound1 = body.studentRound1;
  settings.evaluatorRound1 = body.evaluatorRound1;
  settings.studentRound2 = body.studentRound2;
  settings.evaluatorRound2 = body.evaluatorRound2;

  await settings.save();
  const response = NextResponse.json({ message: 'Settings updated successfully' });
    response.cookies.set('admin_toggle_state', JSON.stringify({
    studentRound1: settings.studentRound1,
    evaluatorRound1: settings.evaluatorRound1,
    studentRound2: settings.studentRound2,
    evaluatorRound2: settings.evaluatorRound2,
    }), {
    path: '/',
    httpOnly: false,
    maxAge: 60 * 60 * 24,
    });

    return response;


}