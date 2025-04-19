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
    
    // Initialize round data if not present
    if (team) {
      if (!team.round1) team.round1 = { marks: null, feedback: null, evaluatedAt: null };
      if (!team.round2) team.round2 = { marks: null, feedback: null, evaluatedAt: null };
    }
    
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
      round1,
      round2,
      marks, // Legacy field (deprecated - use round1.marks or round2.marks instead)
      feedback // Legacy field (deprecated - use round1.feedback or round2.feedback instead)
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
      
      // Check member2 changes
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
      
      // Check member3 changes
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
      
      // Check member4 changes
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

      // Update basic team info
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
      
      // Handle round1 data
      if (round1) {
        existing.round1 = {
          ...existing.round1 || {},
          ...round1,
          evaluatedAt: round1.evaluatedAt || (round1.marks ? new Date().toISOString() : null)
        };
      }
      
      // Handle round2 data
      if (round2) {
        existing.round2 = {
          ...existing.round2 || {},
          ...round2,
          evaluatedAt: round2.evaluatedAt || (round2.marks ? new Date().toISOString() : null)
        };
      }
      
      // Backward compatibility for legacy marks/feedback fields
      if (marks !== undefined) {
        console.warn("Using deprecated 'marks' field - please use round1.marks or round2.marks instead");
        // Default to round1 if no round specified
        if (!existing.round1) existing.round1 = {};
        existing.round1.marks = marks;
      }
      
      if (feedback !== undefined) {
        console.warn("Using deprecated 'feedback' field - please use round1.feedback or round2.feedback instead");
        // Default to round1 if no round specified
        if (!existing.round1) existing.round1 = {};
        existing.round1.feedback = feedback;
      }
      
      // Track changes if any
      if (changes) {
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
      // Create new team with proper round structures
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
        round1: round1 || { marks: null, feedback: null, evaluatedAt: null },
        round2: round2 || { marks: null, feedback: null, evaluatedAt: null },
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