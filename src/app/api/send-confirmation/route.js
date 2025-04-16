// app/api/send-confirmation/route.js
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { emails, teamId, teamName, members } = await request.json();

    if (!emails || !emails.length || !teamId) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Configure your email transport here
    // For production, use your actual SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'your-email@example.com',
        pass: process.env.SMTP_PASSWORD || 'your-password',
      },
    });

    // Create email content
    const membersListHTML = members
      .map(member => `<li>${member.name} (${member.role})</li>`)
      .join('');

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="background-color: #3b82f6; padding: 15px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Team Registration Confirmed</h1>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.5;">
          Congratulations! Your team "${teamName}" has been successfully registered.
        </p>
        
        <div style="background-color: #f3f4f6; border-radius: 6px; padding: 15px; margin: 20px 0; text-align: center;">
          <p style="color: #4b5563; margin-bottom: 5px; font-size: 14px;">Your Team ID is:</p>
          <h2 style="color: #10b981; font-family: monospace; font-size: 28px; margin: 5px 0;">${teamId}</h2>
          <p style="color: #6b7280; font-size: 12px; margin-top: 5px;">Keep this ID safe. You'll need it for future reference.</p>
        </div>
        
        <h3 style="color: #4b5563; font-size: 18px; margin-top: 20px;">Team Members:</h3>
        <ul style="color: #4b5563; line-height: 1.6;">
          ${membersListHTML}
        </ul>
        
        <p style="color: #4b5563; margin-top: 25px; font-size: 14px;">
          If you have any questions, please contact the event organizers.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #6b7280; font-size: 12px;">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    `;

    // Send emails to all team members
    const emailPromises = emails.map(email => {
      return transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Team Registration" <noreply@example.com>',
        to: email,
        subject: `Team Registration Confirmation - Team ID: ${teamId}`,
        html: emailContent,
      });
    });

    // Wait for all emails to be sent
    await Promise.all(emailPromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send emails' }, 
      { status: 500 }
    );
  }
}