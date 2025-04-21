import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Add these imports
import { connectToDB } from '@/lib/mongodb';
import Team from '@/models/Team';

export async function POST(request) {
  try {
    const data = await request.json();
    const { teamId, uploadedFiles, rnd2attstud } = data;

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: "No files have been uploaded" },
        { status: 400 }
      );
    }

    // Update attendance in the database if provided
    await connectToDB();
    const team = await Team.findOne({ teamId });
    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      );
    }

    // Always update attendance on submission (use defaults if not provided)
    team.rnd2attstud = {
      leader: rnd2attstud?.leader ?? team.rnd2attstud?.leader ?? false,
      member2: rnd2attstud?.member2 ?? team.rnd2attstud?.member2 ?? false,
      member3: rnd2attstud?.member3 ?? team.rnd2attstud?.member3 ?? false,
      member4: rnd2attstud?.member4 ?? team.rnd2attstud?.member4 ?? false,
      markedBy: rnd2attstud?.markedBy ?? team.rnd2attstud?.markedBy ?? null,
      markedAt: new Date()
    };
    await team.save();
    // Here you would typically update a database to mark the project as submitted
    // For this example, we'll just create a submission record file

    const safeTeamId = teamId.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    // Create the submissions directory if it doesn't exist
    const submissionsDir = path.join(process.cwd(), 'project_submissions');
    await mkdir(submissionsDir, { recursive: true });
    
    // Create a submission record
    const submissionData = {
      teamId,
      submissionDate: new Date().toISOString(),
      files: uploadedFiles,
    };
    
    // Save submission record
    const submissionPath = path.join(submissionsDir, `${safeTeamId}_submission.json`);
    await writeFile(
      submissionPath, 
      JSON.stringify(submissionData, null, 2)
    );

    console.log(`Project submission recorded at: ${submissionPath}`);

    return NextResponse.json({
      success: true,
      message: "Project submitted successfully",
      submissionDate: submissionData.submissionDate
    });
  } catch (error) {
    console.error('Error submitting project:', error);
    return NextResponse.json(
      { error: "Failed to submit project: " + error.message },
      { status: 500 }
    );
  }
}