import fs from 'fs';
import path from 'path';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return new Response(JSON.stringify({ error: 'Team ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Go one level up from src/ to find uploads_teams/
    const uploadsDir = path.join(process.cwd(), 'uploads_teams', teamId);

    if (!fs.existsSync(uploadsDir)) {
      return new Response(JSON.stringify({ files: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fileNames = fs.readdirSync(uploadsDir);
    const files = fileNames.map(name => {
      const filePath = path.join(uploadsDir, name);
      const stat = fs.statSync(filePath);
      return {
        name,
        size: stat.size,
      };
    });

    return new Response(JSON.stringify({ files }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error reading files:', error);
    return new Response(JSON.stringify({ error: 'Failed to load team files' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
