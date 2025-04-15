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
      leaderName, leaderEnrollment, leaderMobile, leaderPresent,
      member2Name, member2Enrollment, member2Present,
      member3Name, member3Enrollment, member3Present,
      member4Name, member4Enrollment, member4Present,
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
          existing.leaderMobile !== leaderMobile ||
          existing.leaderPresent !== leaderPresent) {
        changesMap.push({
          type: "leader",
          old: {
            name: existing.leaderName,
            enrollment: existing.leaderEnrollment,
            mobile: existing.leaderMobile,
            present: existing.leaderPresent
          },
          new: {
            name: leaderName,
            enrollment: leaderEnrollment,
            mobile: leaderMobile,
            present: leaderPresent
          }
        });
      }
      
      // Check member 2 changes
      if ((existing.member2Name || "") !== (member2Name || "") || 
          (existing.member2Enrollment || "") !== (member2Enrollment || "") ||
          existing.member2Present !== member2Present) {
        changesMap.push({
          type: "member2",
          old: {
            name: existing.member2Name || "",
            enrollment: existing.member2Enrollment || "",
            present: existing.member2Present
          },
          new: {
            name: member2Name || "",
            enrollment: member2Enrollment || "",
            present: member2Present
          }
        });
      }
      
      // Check member 3 changes
      if ((existing.member3Name || "") !== (member3Name || "") || 
          (existing.member3Enrollment || "") !== (member3Enrollment || "") ||
          existing.member3Present !== member3Present) {
        changesMap.push({
          type: "member3",
          old: {
            name: existing.member3Name || "",
            enrollment: existing.member3Enrollment || "",
            present: existing.member3Present
          },
          new: {
            name: member3Name || "",
            enrollment: member3Enrollment || "",
            present: member3Present
          }
        });
      }
      
      // Check member 4 changes
      if ((existing.member4Name || "") !== (member4Name || "") || 
          (existing.member4Enrollment || "") !== (member4Enrollment || "") ||
          existing.member4Present !== member4Present) {
        changesMap.push({
          type: "member4",
          old: {
            name: existing.member4Name || "",
            enrollment: existing.member4Enrollment || "",
            present: existing.member4Present
          },
          new: {
            name: member4Name || "",
            enrollment: member4Enrollment || "",
            present: member4Present
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
      existing.leaderPresent = leaderPresent || false;
      existing.member2Name = member2Name;
      existing.member2Enrollment = member2Enrollment;
      existing.member2Present = member2Present || false;
      existing.member3Name = member3Name;
      existing.member3Enrollment = member3Enrollment;
      existing.member3Present = member3Present || false;
      existing.member4Name = member4Name;
      existing.member4Enrollment = member4Enrollment;
      existing.member4Present = member4Present || false;
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
        // If this is an attendance update, add it to existing changes
        if (existing.changes && Array.isArray(existing.changes)) {
          existing.changes = [...existing.changes, ...changes];
        } else {
          existing.changes = changes;
        }
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
        leaderPresent: leaderPresent || false,
        member2Name,
        member2Enrollment,
        member2Present: member2Present || false,
        member3Name,
        member3Enrollment,
        member3Present: member3Present || false,
        member4Name,
        member4Enrollment,
        member4Present: member4Present || false,
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