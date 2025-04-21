'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchSettings();
    fetchTeams();
  }, []);

  async function fetchSettings() {
    const res = await fetch('/api/admin/settings');
    const data = await res.json();
    setSettings(data);
    setLoading(false);
  }

  async function fetchTeams() {
    const res = await fetch('/api/team/all'); // <-- Use a dedicated endpoint to fetch all teams
    const data = await res.json();
    if (Array.isArray(data)) setTeams(data);
  }

  async function handleToggleChange(key) {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    fetchSettings();
  }

  // Helper to display attendance object
  function renderAttendance(att) {
    if (!att) return '-';
    return (
      <div>
        <div>Leader: {att.leader ? 'Yes' : 'No'}</div>
        <div>Member2: {att.member2 ? 'Yes' : 'No'}</div>
        <div>Member3: {att.member3 ? 'Yes' : 'No'}</div>
        <div>Member4: {att.member4 ? 'Yes' : 'No'}</div>
        <div>By: {att.markedBy || '-'}</div>
        <div>At: {att.markedAt ? new Date(att.markedAt).toLocaleString() : '-'}</div>
      </div>
    );
  }

  if (loading) return <div className="p-4 text-white">Loading...</div>;

  return (
    <div className="w-screen max-w-full p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">Admin Dashboard</h1>

      <div className="bg-white rounded shadow p-4 mb-10 w-full">
        <h2 className="text-xl font-semibold mb-4">🔗 Route Toggles</h2>
        {['studentRound1', 'evaluatorRound1', 'studentRound2', 'evaluatorRound2'].map((key) => (
          <div key={key} className="flex items-center justify-between py-2 border-b">
            <span className="capitalize text-gray-800">{key.replace(/([A-Z])/g, ' $1')}</span>
            <button
              className={`px-4 py-1 rounded text-white ${settings[key] ? 'bg-green-600' : 'bg-red-600'}`}
              onClick={() => handleToggleChange(key)}
            >
              {settings[key] ? 'ON' : 'OFF'}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded shadow p-4 w-full">
        <h2 className="text-xl font-semibold mb-4 text-black">📦 Team Data</h2>
        <div className="w-full overflow-x-auto">
          <table className="w-full table-auto text-xs text-left text-black">
            <thead className="bg-gray-200 text-black">
              <tr>
                <th className="p-2 whitespace-nowrap">Team ID</th>
                <th className="p-2 whitespace-nowrap">Leader Name</th>
                <th className="p-2 whitespace-nowrap">Leader Enrollment</th>
                <th className="p-2 whitespace-nowrap">Leader Mobile</th>
                <th className="p-2 whitespace-nowrap">Member 2 Name</th>
                <th className="p-2 whitespace-nowrap">Member 2 Enrollment</th>
                <th className="p-2 whitespace-nowrap">Member 3 Name</th>
                <th className="p-2 whitespace-nowrap">Member 3 Enrollment</th>
                <th className="p-2 whitespace-nowrap">Member 4 Name</th>
                <th className="p-2 whitespace-nowrap">Member 4 Enrollment</th>
                <th className="p-2 whitespace-nowrap">rnd1attstud</th>
                <th className="p-2 whitespace-nowrap">rnd1atteval</th>
                <th className="p-2 whitespace-nowrap">rnd1marks</th>
                <th className="p-2 whitespace-nowrap">Submitted</th>
                <th className="p-2 whitespace-nowrap">Problem Statement</th>
                <th className="p-2 whitespace-nowrap">Round 1 Marks</th>
                <th className="p-2 whitespace-nowrap">Round 1 Feedback</th>
                <th className="p-2 whitespace-nowrap">Round 2 Marks</th>
                <th className="p-2 whitespace-nowrap">Round 2 Feedback</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 text-black">
                  <td className="p-2">{team.teamId}</td>
                  <td className="p-2">{team.leaderName}</td>
                  <td className="p-2">{team.leaderEnrollment}</td>
                  <td className="p-2">{team.leaderMobile}</td>
                  <td className="p-2">{team.member2Name}</td>
                  <td className="p-2">{team.member2Enrollment}</td>
                  <td className="p-2">{team.member3Name}</td>
                  <td className="p-2">{team.member3Enrollment}</td>
                  <td className="p-2">{team.member4Name}</td>
                  <td className="p-2">{team.member4Enrollment}</td>
                  <td className="p-2">{renderAttendance(team.rnd1attstud)}</td>
                  <td className="p-2">{renderAttendance(team.rnd1atteval)}</td>
                  <td className="p-2">{team.rnd1marks !== undefined && team.rnd1marks !== null ? team.rnd1marks : '-'}</td>
                  <td className="p-2">{team.submitted ? '✅' : '❌'}</td>
                  <td className="p-2">{team.problemStatement || '-'}</td>
                  <td className="p-2">{team.round1?.marks ?? '-'}</td>
                  <td className="p-2">{team.round1?.feedback ?? '-'}</td>
                  <td className="p-2">{team.round2?.marks ?? '-'}</td>
                  <td className="p-2">{team.round2?.feedback ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}