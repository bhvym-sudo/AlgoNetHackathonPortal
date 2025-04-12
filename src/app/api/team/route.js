import { connectToDB } from "@/lib/mongodb";
import Team from "@/models/Team";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");

  if (!teamId) {
    return Response.json({ error: "Team ID is required" }, { status: 400 });
  }

  try {
    await connectToDB();
    const team = await Team.findOne({ teamId });
    return Response.json(team || {});
  } catch (error) {
    console.error("Error fetching team:", error);
    return Response.json({ error: "Failed to fetch team data" }, { status: 500 });
  }
}

export async function POST(request) {
  const body = await request.json();
  
  try {
    await connectToDB();

    const { 
      teamId,
      leaderName, leaderEnrollment, leaderMobile,
      member2Name, member2Enrollment,
      member3Name, member3Enrollment,
      member4Name, member4Enrollment,
      problemStatement,
      submitted,
      marks,
      feedback
    } = body;

    if (!teamId) {
      return Response.json({ error: "Team ID is required" }, { status: 400 });
    }

    const existing = await Team.findOne({ teamId });
    let changes = null;

    if (existing) {
      // Track changes to member information
      const changesMap = [];
      
      // Check leader changes
      if (existing.leaderName !== leaderName || 
          existing.leaderEnrollment !== leaderEnrollment || 
          existing.leaderMobile !== leaderMobile) {
        changesMap.push({
          type: "leader",
          old: {
            name: existing.leaderName,
            enrollment: existing.leaderEnrollment,
            mobile: existing.leaderMobile
          },
          new: {
            name: leaderName,
            enrollment: leaderEnrollment,
            mobile: leaderMobile
          }
        });
      }
      
      // Check member 2 changes
      if ((existing.member2Name || "") !== (member2Name || "") || 
          (existing.member2Enrollment || "") !== (member2Enrollment || "")) {
        changesMap.push({
          type: "member2",
          old: {
            name: existing.member2Name || "",
            enrollment: existing.member2Enrollment || ""
          },
          new: {
            name: member2Name || "",
            enrollment: member2Enrollment || ""
          }
        });
      }
      
      // Check member 3 changes
      if ((existing.member3Name || "") !== (member3Name || "") || 
          (existing.member3Enrollment || "") !== (member3Enrollment || "")) {
        changesMap.push({
          type: "member3",
          old: {
            name: existing.member3Name || "",
            enrollment: existing.member3Enrollment || ""
          },
          new: {
            name: member3Name || "",
            enrollment: member3Enrollment || ""
          }
        });
      }
      
      // Check member 4 changes
      if ((existing.member4Name || "") !== (member4Name || "") || 
          (existing.member4Enrollment || "") !== (member4Enrollment || "")) {
        changesMap.push({
          type: "member4",
          old: {
            name: existing.member4Name || "",
            enrollment: existing.member4Enrollment || ""
          },
          new: {
            name: member4Name || "",
            enrollment: member4Enrollment || ""
          }
        });
      }
      
      // If we have changes, add them to the changes array
      if (changesMap.length > 0) {
        changes = changesMap;
      }

      // Update existing team
      existing.leaderName = leaderName;
      existing.leaderEnrollment = leaderEnrollment;
      existing.leaderMobile = leaderMobile;
      existing.member2Name = member2Name;
      existing.member2Enrollment = member2Enrollment;
      existing.member3Name = member3Name;
      existing.member3Enrollment = member3Enrollment;
      existing.member4Name = member4Name;
      existing.member4Enrollment = member4Enrollment;
      existing.problemStatement = problemStatement;
      existing.submitted = submitted;
      
      // Only update marks and feedback if they're provided
      if (marks !== undefined) {
        existing.marks = marks;
      }
      if (feedback !== undefined) {
        existing.feedback = feedback;
      }
      
      if (changes) {
        existing.changes = changes;
      }

      await existing.save();
      
      return Response.json({ 
        message: "Team updated successfully", 
        team: existing 
      });
    } else {
      // Create new team
      const newTeam = await Team.create({
        teamId,
        leaderName,
        leaderEnrollment,
        leaderMobile,
        member2Name,
        member2Enrollment,
        member3Name,
        member3Enrollment,
        member4Name,
        member4Enrollment,
        problemStatement,
        submitted,
        marks: marks || null,
        feedback: feedback || null,
        changes: null
      });

      return Response.json({ 
        message: "Team created successfully", 
        team: newTeam 
      });
    }
  } catch (error) {
    console.error("Error saving team:", error);
    return Response.json({ error: "Failed to save team data" }, { status: 500 });
  }
}