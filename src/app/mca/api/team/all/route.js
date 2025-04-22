import { connectToDB } from "@/lib/mongodb";
import MCATeam from "@/models/MCATeam";

export async function GET() {
  await connectToDB();
  const teams = await MCATeam.find({});
  return Response.json(teams);
}