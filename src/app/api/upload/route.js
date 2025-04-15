import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const teamId = formData.get('teamId');
    const teamName = formData.get('teamName');

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }
    
    // Use teamId for folder name (more reliable than teamName)
    const safeTeamId = teamId.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    // Create the main uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads_teams');
    await mkdir(uploadsDir, { recursive: true });

    // Create a team-specific directory
    const teamDir = path.join(uploadsDir, safeTeamId);
    await mkdir(teamDir, { recursive: true });

    // Convert file to buffer and save it
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file in the team's directory
    const filePath = path.join(teamDir, file.name);
    await writeFile(filePath, buffer);

    console.log(`File uploaded to: ${filePath}`);

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      filePath: `/uploads_teams/${safeTeamId}/${file.name}`
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: "Failed to upload file: " + error.message },
      { status: 500 }
    );
  }
}

// Remove the config export as it's not needed in App Router
export const config = {
  api: {
    bodyParser: false,
  },
};