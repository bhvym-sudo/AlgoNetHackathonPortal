'use client';
import { useState } from 'react';

export default function StudentDashboard() {
  const [teamId, setTeamId] = useState('');
  const [teamData, setTeamData] = useState({
    leaderName: '',
    leaderEnrollment: '',
    leaderMobile: '',
    leaderPresent: false,
    member2Name: '',
    member2Enrollment: '',
    member2Present: false,
    member3Name: '',
    member3Enrollment: '',
    member3Present: false,
    member4Name: '',
    member4Enrollment: '',
    member4Present: false,
    problemStatement: '',
    submitted: false
  });
  const [problemStatements, setProblemStatements] = useState([]);
  const [teamLoaded, setTeamLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const memberExists = (name, enrollment) => {
    return name?.trim() !== '' && enrollment?.trim() !== '';
  };

  const getMemberCount = () => {
    let count = 1; // Leader
    if (memberExists(teamData.member2Name, teamData.member2Enrollment)) count++;
    if (memberExists(teamData.member3Name, teamData.member3Enrollment)) count++;
    if (memberExists(teamData.member4Name, teamData.member4Enrollment)) count++;
    return count;
  };

  const removeMember = (memberNumber) => {
    setTeamData(prev => ({
      ...prev,
      [`member${memberNumber}Name`]: '',
      [`member${memberNumber}Enrollment`]: '',
      [`member${memberNumber}Present`]: false,
    }));
  };

  const loadProblemStatements = async () => {
    try {
      const res = await fetch('/api/problems');
      const data = await res.json();
      if (data?.problemStatements) {
        setProblemStatements(data.problemStatements);
      }
    } catch (err) {
      console.error("Failed to load problem statements", err);
    }
  };

  const loadTeamData = async () => {
    if (!teamId.trim()) {
      setErrorMessage("Please enter a Team ID");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const res = await fetch(`/api/team?teamId=${teamId}`);
      const data = await res.json();
      
      if (data?.teamId) {
        setTeamData(data);
        setTeamLoaded(true);
        loadProblemStatements();
      } else {
        setErrorMessage("Please enter correct team ID");
        setTeamLoaded(false);
      }
    } catch (err) {
      console.error("Failed to load team data", err);
      setErrorMessage("Failed to load team data");
      setTeamLoaded(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTeamData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
  
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...teamData,
          teamId,
          submitted: true
        }),
      });
  
      const result = await res.json();
      
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage("Team registration submitted successfully!");
        setTeamData(result.team || teamData);
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMessage("Failed to submit team data.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTeamId('');
    setTeamData({
      leaderName: '',
      leaderEnrollment: '',
      leaderMobile: '',
      leaderPresent: false,
      member2Name: '',
      member2Enrollment: '',
      member2Present: false,
      member3Name: '',
      member3Enrollment: '',
      member3Present: false,
      member4Name: '',
      member4Enrollment: '',
      member4Present: false,
      problemStatement: '',
      submitted: false
    });
    setTeamLoaded(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-10 text-center text-white">AlgoNet Hackathon - Student Dashboard</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        {!teamLoaded ? (
          <div className="mb-6">
            <label className="block text-black font-medium mb-2">Team ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="flex-1 p-2 border border-gray-900 rounded text-black bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your Team ID"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={loadTeamData}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="relative flex h-5 w-5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-5 w-5 border-2 border-t-transparent border-white animate-spin"></span>
                    </span>
                    <span>Loading...</span>
                  </>
                ) : "Load Team"}
              </button>
            </div>
            {errorMessage && <p className="text-red-500 mt-1 font-medium">{errorMessage}</p>}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {teamData.submitted && (
              <div className="p-4 mb-4 bg-yellow-100 border border-yellow-400 text-black rounded">
                <p className="font-medium">This team has already submitted their registration.</p>
                <button
                  type="button"
                  className="mt-3 bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  onClick={resetForm}
                >
                  Enter Different Team ID
                </button>
              </div>
            )}

            {/* Team Leader Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-3 text-black">Team Leader</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Name</label>
                  {teamData.submitted ? (
                    <div className="p-2 bg-gray-100 rounded text-black">{teamData.leaderName}</div>
                  ) : (
                    <input
                      type="text"
                      name="leaderName"
                      value={teamData.leaderName}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-900 rounded text-black"
                      required
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Enrollment ID</label>
                  {teamData.submitted ? (
                    <div className="p-2 bg-gray-100 rounded text-black">{teamData.leaderEnrollment}</div>
                  ) : (
                    <input
                      type="text"
                      name="leaderEnrollment"
                      value={teamData.leaderEnrollment}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-900 rounded text-black"
                      required
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Mobile</label>
                  {teamData.submitted ? (
                    <div className="p-2 bg-gray-100 rounded text-black">{teamData.leaderMobile}</div>
                  ) : (
                    <input
                      type="text"
                      name="leaderMobile"
                      value={teamData.leaderMobile}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-900 rounded text-black"
                      required
                    />
                  )}
                </div>
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="leaderPresent"
                      checked={teamData.leaderPresent}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-900 rounded"
                      disabled={teamData.submitted}
                    />
                    <span className="ml-2 text-sm text-black">Present</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Team Members */}
            {[2, 3, 4].map((num) => {
              const name = teamData[`member${num}Name`];
              const enrollment = teamData[`member${num}Enrollment`];
              const present = teamData[`member${num}Present`];
              
              if (!memberExists(name, enrollment)) return null;

              return (
                <div key={num} className="mb-6 p-4 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-black">Member {num}</h3>
                    {!teamData.submitted && num !== 1 && (
                      <button
                        type="button"
                        onClick={() => removeMember(num)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Name</label>
                      {teamData.submitted ? (
                        <div className="p-2 bg-gray-100 rounded text-black">{name}</div>
                      ) : (
                        <input
                          type="text"
                          name={`member${num}Name`}
                          value={name}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-900 rounded text-black"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Enrollment ID</label>
                      {teamData.submitted ? (
                        <div className="p-2 bg-gray-100 rounded text-black">{enrollment}</div>
                      ) : (
                        <input
                          type="text"
                          name={`member${num}Enrollment`}
                          value={enrollment}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-900 rounded text-black"
                        />
                      )}
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name={`member${num}Present`}
                          checked={present}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-900 rounded"
                          disabled={teamData.submitted}
                        />
                        <span className="ml-2 text-sm text-black">Present</span>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add Member Button */}
            {!teamData.submitted && getMemberCount() < 4 && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => {
                    const nextMember = getMemberCount() + 1;
                    if (nextMember <= 4) {
                      setTeamData(prev => ({
                        ...prev,
                        [`member${nextMember}Name`]: 'New Member',
                        [`member${nextMember}Enrollment`]: 'Enter Enrollment'
                      }));
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Add New Member (+)
                </button>
              </div>
            )}

            {/* Problem Statement */}
            {!teamData.submitted && (
              <div className="mb-6">
                <label className="block text-black font-medium mb-2">Problem Statement</label>
                <select
                  name="problemStatement"
                  value={teamData.problemStatement}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-900 rounded text-black"
                  required
                >
                  <option value="">Select a problem statement</option>
                  {problemStatements.map((ps, index) => (
                    <option key={index} value={ps.title}>{ps.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Messages and Buttons */}
            {errorMessage && (
              <div className="p-3 mb-4 bg-red-50 border border-red-300 text-red-700 rounded font-medium">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3 mb-4 bg-green-50 border border-green-300 text-green-700 rounded font-medium">
                {successMessage}
              </div>
            )}

            <div className="flex gap-3">
              {!teamData.submitted ? (
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
                  disabled={isLoading || !teamData.leaderName || !teamData.leaderEnrollment || !teamData.problemStatement}
                >
                  {isLoading ? "Submitting..." : "Submit Registration"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-900"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}