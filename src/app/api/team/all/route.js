import { connectToDB } from "@/lib/mongodb";
import Team from "@/models/Team";

export async function GET() {
  await connectToDB();
  const teams = await Team.find({});
  return Response.json(teams);
}