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
    
    // Initialize data if not present
    if (team) {
      if (!team.round1) team.round1 = { marks: null, feedback: null, evaluatedAt: null };
      if (!team.round2) team.round2 = { marks: null, feedback: null, evaluatedAt: null };
      if (!team.rnd1attstud) team.rnd1attstud = { 
        leader: false, 
        member2: false, 
        member3: false, 
        member4: false,
        markedBy: null,
        markedAt: null
      };
      if (!team.rnd1atteval) team.rnd1atteval = { 
        leader: false, 
        member2: false, 
        member3: false, 
        member4: false,
        markedBy: null,
        markedAt: null
      };
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
      problemStatement, submitted,
      submittedBy, submittedAt,
      currentMember, // For student attendance
      evaluatorName, // For evaluator attendance
      isEvaluator = false // Flag to identify if request is from evaluator
    } = body;

    // Find the team by ID
    const existingTeam = await Team.findOne({ teamId });

    if (!existingTeam) {
      return Response.json({ error: "Team not found" }, { status: 404 });
    }

    // Update team data
    existingTeam.leaderName = leaderName;
    existingTeam.leaderEnrollment = leaderEnrollment;
    existingTeam.leaderMobile = leaderMobile;
    
    existingTeam.member2Name = member2Name;
    existingTeam.member2Enrollment = member2Enrollment;
    
    existingTeam.member3Name = member3Name;
    existingTeam.member3Enrollment = member3Enrollment;
    
    existingTeam.member4Name = member4Name;
    existingTeam.member4Enrollment = member4Enrollment;
    
    existingTeam.problemStatement = problemStatement;
    
    // Only update submission status if it's not from evaluator
    if (!isEvaluator) {
      existingTeam.submitted = submitted;
      
      // Save the submitter information
      if (submitted && submittedBy) {
        existingTeam.submittedBy = submittedBy;
        existingTeam.submittedAt = submittedAt ? new Date(submittedAt) : new Date();
      }

      // Update student attendance
      if (!existingTeam.rnd1attstud) {
        existingTeam.rnd1attstud = {
          leader: false,
          member2: false,
          member3: false,
          member4: false,
          markedBy: null,
          markedAt: null
        };
      }

      existingTeam.rnd1attstud = {
        leader: leaderPresent || false,
        member2: member2Present || false,
        member3: member3Present || false,
        member4: member4Present || false,
        markedBy: currentMember || submittedBy,
        markedAt: new Date()
      };
    } 
    // If it's from evaluator, update evaluator attendance
    else if (isEvaluator && evaluatorName) {
      if (!existingTeam.rnd1atteval) {
        existingTeam.rnd1atteval = {
          leader: false,
          member2: false,
          member3: false,
          member4: false,
          markedBy: null,
          markedAt: null
        };
      }

      existingTeam.rnd1atteval = {
        leader: leaderPresent || false,
        member2: member2Present || false,
        member3: member3Present || false,
        member4: member4Present || false,
        markedBy: evaluatorName,
        markedAt: new Date()
      };
    }

    await existingTeam.save();

    return Response.json({ 
      message: "Team updated successfully", 
      team: existingTeam 
    });
  } catch (error) {
    console.error("Error updating team:", error);
    return Response.json({ error: "Failed to update team" }, { status: 500 });
  }
}