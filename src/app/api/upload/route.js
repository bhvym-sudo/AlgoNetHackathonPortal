import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const teamId = formData.get('teamId');
    const teamName = formData.get('teamName');
    const fileCount = formData.get('fileCount');

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }
    
    // Get all files from the form data
    const uploadedFiles = [];
    const numberOfFiles = fileCount ? parseInt(fileCount) : 5; // Default to checking up to 5 files
    
    for (let i = 0; i < numberOfFiles; i++) {
      const file = formData.get(`file${i}`);
      if (file && file.size > 0) {
        uploadedFiles.push(file);
      }
    }
    
    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: "No files found in request" },
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
    
    // Process all files
    const savedFiles = [];
    
    for (const file of uploadedFiles) {
      // Convert file to buffer and save it
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Save file in the team's directory
      const filePath = path.join(teamDir, file.name);
      await writeFile(filePath, buffer);
      
      savedFiles.push({
        name: file.name,
        path: `/uploads_teams/${safeTeamId}/${file.name}`,
        size: file.size
      });
      
      console.log(`File uploaded to: ${filePath}`);
    }
    
    return NextResponse.json({
      success: true,
      message: `${savedFiles.length} file(s) uploaded successfully`,
      files: savedFiles
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: "Failed to upload files: " + error.message },
      { status: 500 }
    );
  }
}