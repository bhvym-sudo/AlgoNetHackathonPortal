import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const data = await request.json();
    const { teamId, uploadedFiles } = data;

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