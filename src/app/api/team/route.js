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
  try {
    const body = await request.json();

    const {
      teamId,
      leaderName, leaderEnrollment, leaderMobile, leaderPresent,
      member2Name, member2Enrollment, member2Present,
      member3Name, member3Enrollment, member3Present,
      member4Name, member4Enrollment, member4Present,
      problemStatement, submitted,
      submittedBy, submittedAt,
      rnd2atteval, // <-- Ensure this is included
      rnd2marks, // <-- Ensure this is included
      currentMember, // For student attendance
      evaluatorName, // For evaluator attendance
      isEvaluator = false, // Flag to identify if request is from evaluator
      rnd1marks // <-- NEW: marks from evaluator dashboard
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

      // Update student attendance for Round 1
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

      // Update student attendance for Round 2
      if (!existingTeam.rnd2attstud) {
        existingTeam.rnd2attstud = {
          leader: false,
          member2: false,
          member3: false,
          member4: false,
          markedBy: null,
          markedAt: null
        };
      }
      // NEW: Accept direct rnd2attstud object from frontend if provided
      if (body.rnd2attstud) {
        existingTeam.rnd2attstud = {
          ...existingTeam.rnd2attstud,
          ...body.rnd2attstud,
          markedBy: body.currentMember2 || body.submittedBy || existingTeam.rnd2attstud.markedBy,
          markedAt: new Date()
        };
      } else {
        // fallback for legacy fields (if any)
        existingTeam.rnd2attstud = {
          leader: body.leaderPresent2 || false,
          member2: body.member2Present2 || false,
          member3: body.member3Present2 || false,
          member4: body.member4Present2 || false,
          markedBy: body.currentMember2 || body.submittedBy,
          markedAt: new Date()
        };
      }
    }
    // If it's from evaluator, update evaluator attendance and marks
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

      // Save marks from evaluator dashboard
      if (typeof rnd1marks === "number" && !isNaN(rnd1marks)) {
        existingTeam.rnd1marks = rnd1marks;
      }
    }

    // In your POST handler, after updating other fields:
    // Handle evaluator round 2 attendance
    if (body.rnd2atteval) {
      existingTeam.rnd2atteval = {
        leader: body.rnd2atteval.leader || false,
        member2: body.rnd2atteval.member2 || false,
        member3: body.rnd2atteval.member3 || false,
        member4: body.rnd2atteval.member4 || false,
        markedBy: body.evaluatorName || null,
        markedAt: new Date()
      };
    }

    // Handle evaluator round 2 marks
    if (typeof body.rnd2marks === 'number') {
      existingTeam.rnd2marks = Math.min(80, Math.max(0, body.rnd2marks));
    }
    await existingTeam.save();

    return Response.json({ message: "Team updated successfully", team: existingTeam });
  } catch (error) {
    console.error("Error updating team:", error);
    return Response.json({ error: "Failed to update team" }, { status: 500 });
  }
}