import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get('teamId');
  const filename = searchParams.get('filename');
  const asDownload = searchParams.get('download') === 'true';

  if (!teamId || !filename) {
    return new Response(JSON.stringify({ error: 'Missing teamId or filename' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const filePath = path.join(process.cwd(), 'uploads_teams', teamId, filename);

  if (!fs.existsSync(filePath)) {
    return new Response(JSON.stringify({ error: 'File not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const fileBuffer = fs.readFileSync(filePath);
  const contentType = mime.lookup(filename) || 'application/octet-stream';

  return new Response(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `${asDownload ? 'attachment' : 'inline'}; filename="${filename}"`,
    },
  });
}
