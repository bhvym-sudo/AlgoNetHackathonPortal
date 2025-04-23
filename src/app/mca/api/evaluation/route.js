import { connectToDB } from "@/lib/mongodb";
import MCATeam from "@/models/MCATeam";

export async function POST(request) {
  const body = await request.json();
  
  try {
    await connectToDB();

    const { teamId, marks, feedback, ...rest } = body;

    if (!teamId) {
      return Response.json({ error: "Team ID is required" }, { status: 400 });
    }

    if (marks === undefined || marks === null) {
      return Response.json({ error: "Marks are required" }, { status: 400 });
    }

    if (marks < 0 || marks > 100) {
      return Response.json({ error: "Marks must be between 0 and 100" }, { status: 400 });
    }

    const team = await MCATeam.findOne({ teamId });

    if (!team) {
      return Response.json({ error: "Team not found" }, { status: 404 });
    }

    team.marks = marks;
    team.feedback = feedback || "";

    // --- ADD THIS BLOCK: Save prblm1, prblm2, ... if present ---
    for (let i = 1; i <= 12; i++) {
      const key = `prblm${i}`;
      if (rest[key] !== undefined) {
        team[key] = rest[key];
      }
    }
    // --- END BLOCK ---

    await team.save();

    return Response.json({ 
      message: "Evaluation saved successfully", 
      team
    });
  } catch (error) {
    console.error("Error saving evaluation:", error);
    return Response.json({ error: "Failed to save evaluation" }, { status: 500 });
  }
}