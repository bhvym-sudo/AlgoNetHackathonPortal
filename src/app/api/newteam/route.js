// app/api/newteam/route.js
import { connectToDB } from '@/lib/mongodb';
import Team from '@/models/Team';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const data = await request.json();
  await connectToDB();

  // Get latest team ID that doesn't already exist
  const allTeams = await Team.find({ teamId: /BTECH\d{3}/ });
  const ids = allTeams.map(t => parseInt(t.teamId.replace('BTECH', '')));
  const maxId = ids.length ? Math.max(...ids) : 0;
  const nextId = 'BTECH' + String(maxId + 1).padStart(3, '0');

  const newTeam = new Team({
    teamId: nextId,
    leaderName: data.leaderName,
    leaderEnrollment: data.leaderEnrollment,
    leaderMobile: data.leaderMobile,
    leaderEmail: data.leaderEmail,
    member2Name: data.member2Name,
    member2Enrollment: data.member2Enrollment,
    member2Email: data.member2Email,
    member3Name: data.member3Name,
    member3Enrollment: data.member3Enrollment,
    member3Email: data.member3Email,
    member4Name: data.member4Name,
    member4Enrollment: data.member4Enrollment,
    member4Email: data.member4Email,
    submitted: false,
    changes: null
  });

  await newTeam.save();
  return NextResponse.json({ message: 'Team registered successfully', teamId: nextId });
}
