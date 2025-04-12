'use client';
import { useState } from 'react';

export default function StudentDashboard() {
  const [teamId, setTeamId] = useState('');
  const [teamData, setTeamData] = useState({
    leaderName: '',
    leaderEnrollment: '',
    leaderMobile: '',
    member2Name: '',
    member2Enrollment: '',
    member3Name: '',
    member3Enrollment: '',
    member4Name: '',
    member4Enrollment: '',
    problemStatement: '',
    submitted: false
  });
  const [problemStatements, setProblemStatements] = useState([]);
  const [teamLoaded, setTeamLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadProblemStatements = async () => {
    try {
      const res = await fetch('/api/problems');
      const data = await res.json();
      
      if (data && data.problemStatements) {
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
      
      if (data && data.teamId) {
        setTeamData(data);
        setTeamLoaded(true);
        loadProblemStatements();
      } else {
        // Team not found - create new team with basic info
        setTeamData({
          leaderName: '',
          leaderEnrollment: '',
          leaderMobile: '',
          member2Name: '',
          member2Enrollment: '',
          member3Name: '',
          member3Enrollment: '',
          member4Name: '',
          member4Enrollment: '',
          problemStatement: '',
          submitted: false
        });
        setTeamLoaded(true);
        loadProblemStatements();
      }
    } catch (err) {
      console.error("Failed to load team data", err);
      setErrorMessage("Failed to load team data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTeamData({ ...teamData, [name]: value });
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
      member2Name: '',
      member2Enrollment: '',
      member3Name: '',
      member3Enrollment: '',
      member4Name: '',
      member4Enrollment: '',
      problemStatement: '',
      submitted: false
    });
    setTeamLoaded(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-10 text-center">AlgoNet Hackathon - Student Dashboard</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        {!teamLoaded ? (
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Team ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                ) : (
                  "Load Team"
                )}
              </button>
            </div>
            {errorMessage && <p className="text-red-500 mt-1">{errorMessage}</p>}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {teamData.submitted && (
              <div className="p-4 mb-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
                <p className="font-medium">This team has already submitted their registration.</p>
                <p>Please contact an administrator if you need to make changes.</p>
                <button
                  type="button"
                  className="mt-3 bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  onClick={resetForm}
                >
                  Enter Different Team ID
                </button>
              </div>
            )}

            {!teamData.submitted && (
              <>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Team Information</h2>
                
                {/* Team Leader Section */}
                <div className="mb-6 p-4 bg-gray-50 rounded">
                  <h3 className="font-medium mb-3 text-gray-800">Team Leader</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Leader Name
                      </label>
                      <input
                        type="text"
                        name="leaderName"
                        value={teamData.leaderName}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Leader Enrollment ID
                      </label>
                      <input
                        type="text"
                        name="leaderEnrollment"
                        value={teamData.leaderEnrollment}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Leader Mobile
                      </label>
                      <input
                        type="text"
                        name="leaderMobile"
                        value={teamData.leaderMobile}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Member 2 Section */}
                <div className="mb-6 p-4 bg-gray-50 rounded">
                  <h3 className="font-medium mb-3 text-gray-800">Team Member 2</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Member Name
                      </label>
                      <input
                        type="text"
                        name="member2Name"
                        value={teamData.member2Name || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Member Enrollment ID
                      </label>
                      <input
                        type="text"
                        name="member2Enrollment"
                        value={teamData.member2Enrollment || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Member 3 Section */}
                <div className="mb-6 p-4 bg-gray-50 rounded">
                  <h3 className="font-medium mb-3 text-gray-800">Team Member 3</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Member Name
                      </label>
                      <input
                        type="text"
                        name="member3Name"
                        value={teamData.member3Name || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Member Enrollment ID
                      </label>
                      <input
                        type="text"
                        name="member3Enrollment"
                        value={teamData.member3Enrollment || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Member 4 Section */}
                <div className="mb-6 p-4 bg-gray-50 rounded">
                  <h3 className="font-medium mb-3 text-gray-800">Team Member 4</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Member Name
                      </label>
                      <input
                        type="text"
                        name="member4Name"
                        value={teamData.member4Name || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Member Enrollment ID
                      </label>
                      <input
                        type="text"
                        name="member4Enrollment"
                        value={teamData.member4Enrollment || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Problem Statement Selection */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">
                    Problem Statement
                  </label>
                  <select
                    name="problemStatement"
                    value={teamData.problemStatement || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a problem statement</option>
                    {problemStatements.map((ps, index) => (
                      <option key={index} value={ps.title} className="text-gray-800">
                        {ps.title}
                      </option>
                    ))}
                  </select>
                </div>

                {errorMessage && (
                  <div className="p-3 mb-4 bg-red-50 border border-red-300 text-red-700 rounded">
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 mb-4 bg-green-50 border border-green-300 text-green-700 rounded">
                    {successMessage}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                    disabled={isLoading || !teamData.leaderName || !teamData.leaderEnrollment || !teamData.problemStatement}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <span className="relative flex h-5 w-5 mr-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-5 w-5 border-2 border-t-transparent border-white animate-spin"></span>
                        </span>
                        Submitting...
                      </span>
                    ) : (
                      "Submit Team Registration"
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}