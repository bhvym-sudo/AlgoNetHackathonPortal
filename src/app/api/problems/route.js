
import { connectToDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";

export async function GET() {
  await connectToDB();
  
  try {
    const problems = await Problem.find({});
    return Response.json({ problemStatements: problems });
  } catch (error) {
    console.error("Error fetching problem statements:", error);
    return Response.json({ error: "Failed to fetch problem statements" }, { status: 500 });
  }
}