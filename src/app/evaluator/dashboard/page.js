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

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setTeamData({ ...teamData, [name]: checked });
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

  const toggleSubmissionStatus = async () => {
    // Set loading state
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    // Update locally first for immediate feedback
    const updatedData = {
      ...teamData,
      submitted: !teamData.submitted
    };
    setTeamData(updatedData);
    
    // Save to database
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
  
      const result = await res.json();
      
      if (result.error) {
        setErrorMessage(result.error);
        // Revert back if there was an error
        setTeamData({...teamData});
      } else {
        setSuccessMessage(`Team ${updatedData.submitted ? 'locked' : 'unlocked'} successfully!`);
        // Ensure we have the latest data
        setTeamData(result.team || updatedData);
      }
    } catch (err) {
      console.error("Status toggle failed:", err);
      setErrorMessage("Failed to update submission status.");
      // Revert back on error
      setTeamData({...teamData});
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTeamId('');
    setTeamData(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Helper function to check if a member has data
  const hasMemberData = (name, enrollment) => {
    return (name && name.trim() !== '') || (enrollment && enrollment.trim() !== '');
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
                  className={`ml-2 text-sm px-3 py-1 rounded ${teamData.submitted ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '...' : teamData.submitted ? 'Unlock' : 'Lock'}
                </button>
              </div>
            </div>
            
            {/* Team Leader Section - Always shown as team leader is required */}
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-3 text-gray-800">Team Leader</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Leader name
                  </label>
                  <label className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {teamData.leaderName || ''}
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leader Enrollment ID
                  </label>
                  <label className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    {teamData.leaderEnrollment || ''}
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leader Mobile
                  </label>
                  <label className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    {teamData.leaderMobile || ''}
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="leaderPresent"
                    name="leaderPresent"
                    checked={teamData.leaderPresent || false}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="leaderPresent" className="ml-2 text-sm font-medium text-gray-700">
                    Present
                  </label>
                </div>
              </div>
            </div>

            {/* Member 2 Section - Conditionally rendered */}
            {hasMemberData(teamData.member2Name, teamData.member2Enrollment) && (
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-3 text-gray-800">Team Member 2</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Name
                    </label>
                    <label className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {teamData.member2Name || ''}
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Enrollment ID
                    </label>
                    <label className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {teamData.member2Enrollment || ''}
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="member2Present"
                      name="member2Present"
                      checked={teamData.member2Present || false}
                      onChange={handleCheckboxChange}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="member2Present" className="ml-2 text-sm font-medium text-gray-700">
                      Present
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Member 3 Section - Conditionally rendered */}
            {hasMemberData(teamData.member3Name, teamData.member3Enrollment) && (
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-3 text-gray-800">Team Member 3</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Name
                    </label>
                    <label className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {teamData.member3Name || ''}
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Enrollment ID
                    </label>
                    <label className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {teamData.member3Enrollment || ''}
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="member3Present"
                      name="member3Present"
                      checked={teamData.member3Present || false}
                      onChange={handleCheckboxChange}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="member3Present" className="ml-2 text-sm font-medium text-gray-700">
                      Present
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Member 4 Section - Conditionally rendered */}
            {hasMemberData(teamData.member4Name, teamData.member4Enrollment) && (
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-3 text-gray-800">Team Member 4</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Name
                    </label>
                    <label className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {teamData.member4Name || ''}
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Enrollment ID
                    </label>
                    <label className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {teamData.member4Enrollment || ''}
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="member4Present"
                      name="member4Present"
                      checked={teamData.member4Present || false}
                      onChange={handleCheckboxChange}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="member4Present" className="ml-2 text-sm font-medium text-gray-700">
                      Present
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Problem Statement */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Problem Statement
              </label>
              <label
                name="problemStatement"
                className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >{teamData.problemStatement || ''}</label>
            </div>

            {/* Evaluation Section */}
            <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
              <h3 className="font-medium mb-3 text-gray-800">Evaluation</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marks (0-20)
                </label>
                <input
                  type="number"
                  name="marks"
                  min="0"
                  max="20"
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