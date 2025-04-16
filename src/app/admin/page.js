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
    const res = await fetch('/api/team');
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

  if (loading) return <div className="p-4 text-white">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">Admin Dashboard</h1>

      <div className="bg-white rounded shadow p-4 mb-10">
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

      <div className="bg-white rounded shadow p-4">
        <h2 className="text-xl font-semibold mb-4">📦 Team Data</h2>
        <div className="overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="p-2">Team ID</th>
                <th className="p-2">Leader</th>
                <th className="p-2">Submitted</th>
                <th className="p-2">Present Count</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-2">{team.teamId}</td>
                  <td className="p-2">{team.leaderName}</td>
                  <td className="p-2">{team.submitted ? '✅' : '❌'}</td>
                  <td className="p-2">{team.members?.filter(m => m.present).length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}