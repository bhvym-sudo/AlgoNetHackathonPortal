import { connectToDB } from "@/lib/mongodb";
import Team from "@/models/Team";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");

  await connectToDB();
  const team = await Team.findOne({ teamId });
  return Response.json(team || {});
}

export async function POST(request) {
  const body = await request.json();
  await connectToDB();

  const existing = await Team.findOne({ teamId: body.teamId });
  if (existing) {
    existing.members = body.members;
    existing.problemStatement = body.problemStatement;
    existing.submitted = body.submitted || false;
    await existing.save();
    return Response.json({ message: "Team updated successfully" });
  } else {
    await Team.create(body);
    return Response.json({ message: "Team created successfully" });
  }
}