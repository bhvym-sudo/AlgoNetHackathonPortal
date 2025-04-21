'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const TEAMS_PER_PAGE = 10;

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

  // Helper to display attendance object with "Present"/"Absent"
  function renderAttendance(att) {
    if (!att) return '-';
    return (
      <div>
        <div>Leader: {att.leader ? 'Present' : 'Absent'}</div>
        <div>Member2: {att.member2 ? 'Present' : 'Absent'}</div>
        <div>Member3: {att.member3 ? 'Present' : 'Absent'}</div>
        <div>Member4: {att.member4 ? 'Present' : 'Absent'}</div>
        <div>By: {att.markedBy || '-'}</div>
        <div>At: {att.markedAt ? new Date(att.markedAt).toLocaleString() : '-'}</div>
      </div>
    );
  }

  if (loading) return <div className="p-4 text-white">Loading...</div>;

  // Filter teams based on search query
  const filteredTeams = teams.filter(team => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      (team.teamId && team.teamId.toLowerCase().includes(q)) ||
      (team.leaderName && team.leaderName.toLowerCase().includes(q)) ||
      (team.member2Name && team.member2Name.toLowerCase().includes(q)) ||
      (team.member3Name && team.member3Name.toLowerCase().includes(q)) ||
      (team.member4Name && team.member4Name.toLowerCase().includes(q)) ||
      (team.problemStatement && team.problemStatement.toLowerCase().includes(q))
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTeams.length / TEAMS_PER_PAGE);
  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * TEAMS_PER_PAGE,
    currentPage * TEAMS_PER_PAGE
  );

  // Handle page change
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
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

      {/* Search Bar */}
      <div className="mb-4 flex items-center">
        <input
          type="text"
          placeholder="Search by Team ID, Leader, Member, or Problem Statement"
          value={searchQuery}
          onChange={handleSearchChange}
          className="p-2 border border-gray-400 rounded w-full max-w-md bg-white text-gray-900 placeholder-gray-600"
        />
      </div>

      <div className="bg-white rounded shadow p-4">
        <h2 className="text-xl font-semibold mb-4 text-black">📦 Team Data</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[1600px] w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100 text-gray-900">
              <tr>
                <th className="px-6 py-3 text-left whitespace-nowrap">Team ID</th>
                <th className="px-6 py-3 text-left whitespace-nowrap">Leader Name</th>
                <th className="px-6 py-3 text-left whitespace-nowrap">Leader Enrollment ID</th>
                <th className="px-6 py-3 text-left whitespace-nowrap">Leader Number</th>
                <th className="px-6 py-3 text-left whitespace-nowrap">Leader Email</th>
                <th className="px-6 py-3 text-left whitespace-nowrap">Member 2 Name</th>
                <th className="px-6 py-3 text-left whitespace-nowrap">Member 2 Enrollment ID</th>
                <th className="px-6 py-3 text-left whitespace-nowrap">Member 2 Email</th>
                <th className="px-6 py-3 text-left whitespace-nowrap">Member 3 Name</th>
                <th className="px-6 py-3 text-left whitespace-nowrap">Member 3 Enrollment ID</th>
                <th className="px-6 py-3 text-left whitespace-nowrap">Member 3 Email</th>
                <th className="px-6 py-3 text-left whitespace-nowrap">Member 4 Name</th>
                <th className="px-6 py-3 text-left whitespace-nowrap">Member 4 Enrollment ID</th>
                <th className="px-6 py-3 text-left whitespace-nowrap">Member 4 Email</th>
                <th className="px-6 py-3 text-left whitespace-nowrap">Round 1 Attendance</th>
                <th className="px-6 py-3 text-left whitespace-nowrap">Round 1 Evaluator Attendance</th>
                <th className="px-6 py-3 text-left whitespace-nowrap">Round 2 Attendance</th>
                <th className="px-6 py-3 text-left whitespace-nowrap">Round 2 Evaluator Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-900">
              {paginatedTeams.length === 0 ? (
                <tr>
                  <td colSpan={18} className="text-center py-4 text-gray-500">
                    No teams found.
                  </td>
                </tr>
              ) : (
                paginatedTeams.map((team) => (
                  <tr key={team.teamId}>
                    <td className="px-6 py-3 whitespace-nowrap">{team.teamId}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{team.leaderName}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{team.leaderEnrollment}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{team.leaderMobile}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{team.leaderEmail}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{team.member2Name}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{team.member2Enrollment}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{team.member2Email}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{team.member3Name}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{team.member3Enrollment}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{team.member3Email}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{team.member4Name}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{team.member4Enrollment}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{team.member4Email}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{renderAttendance(team.rnd1attstud)}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{renderAttendance(team.rnd1atteval)}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{renderAttendance(team.rnd2attstud)}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{renderAttendance(team.rnd2atteval)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}