'use client';
import { useState } from 'react';

export default function EvaluatorDashboard() {
  const [teamId, setTeamId] = useState('');
  const [teamData, setTeamData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      } else {
        setTeamData(null);
        setErrorMessage("Team not found");
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
    
    if (name === 'marks') {
      // Ensure marks are between 0 and 100
      const marks = parseInt(value);
      if (isNaN(marks)) {
        setTeamData({ ...teamData, [name]: '' });
      } else {
        const validMarks = Math.min(100, Math.max(0, marks));
        setTeamData({ ...teamData, [name]: validMarks });
      }
    } else {
      setTeamData({ ...teamData, [name]: value });
    }
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
  
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });
  
      const result = await res.json();
      
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage("Team evaluation saved successfully!");
        setTeamData(result.team || teamData);
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMessage("Failed to save evaluation data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSubmissionStatus = () => {
    setTeamData({
      ...teamData,
      submitted: !teamData.submitted
    });
  };

  const resetForm = () => {
    setTeamId('');
    setTeamData(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-10 text-center">AlgoNet Hackathon - Evaluator Dashboard</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
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
              placeholder="Enter Team ID"
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

        {teamData && (
          <form onSubmit={handleSubmitEvaluation}>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Team Information</h2>
              <div className="flex items-center">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${teamData.submitted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {teamData.submitted ? 'Submitted' : 'Not Submitted'}
                </span>
                <button
                  type="button"
                  onClick={toggleSubmissionStatus}
                  className="ml-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  {teamData.submitted ? 'Unlock' : 'Lock'}
                </button>
              </div>
            </div>
            
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
                    value={teamData.leaderName || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leader Enrollment ID
                  </label>
                  <input
                    type="text"
                    name="leaderEnrollment"
                    value={teamData.leaderEnrollment || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leader Mobile
                  </label>
                  <input
                    type="text"
                    name="leaderMobile"
                    value={teamData.leaderMobile || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            {/* Problem Statement */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Problem Statement
              </label>
              <input
                type="text"
                name="problemStatement"
                value={teamData.problemStatement || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Evaluation Section */}
            <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
              <h3 className="font-medium mb-3 text-gray-800">Evaluation</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marks (0-100)
                </label>
                <input
                  type="number"
                  name="marks"
                  min="0"
                  max="100"
                  value={teamData.marks || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback
                </label>
                <textarea
                  name="feedback"
                  value={teamData.feedback || ''}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide feedback for the team..."
                ></textarea>
              </div>
            </div>

            {/* Team Changes History */}
            {teamData.changes && teamData.changes.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
                <h3 className="font-medium mb-3 text-gray-800">Change History</h3>
                <div className="space-y-2">
                  {teamData.changes.map((change, index) => (
                    <div key={index} className="p-2 bg-white rounded border border-gray-100">
                      <p className="text-sm">
                        <span className="font-medium">{change.type} changes:</span> {' '}
                        {JSON.stringify(change)}
                      </p>
                    </div>
                  ))}
                </div>
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="relative flex h-5 w-5 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-5 w-5 border-2 border-t-transparent border-white animate-spin"></span>
                    </span>
                    Saving...
                  </span>
                ) : (
                  "Save Evaluation"
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
          </form>
        )}
      </div>
    </div>
  );
}