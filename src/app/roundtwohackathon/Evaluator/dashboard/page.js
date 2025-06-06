'use client';
import { useState, useEffect } from 'react';

export default function EvaluatorDashboard() {
  const [teamId, setTeamId] = useState('');
  const [teamData, setTeamData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamFiles, setTeamFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);


  const [rnd2atteval, setRnd2Atteval] = useState({
    leader: false,
    member2: false,
    member3: false,
    member4: false,
  });


  const [rnd2marks, setRnd2Marks] = useState('');
  const [problems, setProblems] = useState([]);
            

            useEffect(() => {
              const loadProblems = async () => {
                try {
                  const res = await fetch('/api/problems');
                  const data = await res.json();
                  setProblems(data.problemStatements || []);
                } catch (err) {
                  console.error('Error loading problems:', err);
                }
              };
              loadProblems();
            }, []);
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
        if (!data.round2) {
          data.round2 = { marks: '', feedback: '' };
        }
        setTeamData(data);
        setRnd2Marks(data.round2.marks?.toString() || ''); // Add this line
        

        if (data.rnd2atteval) {
          setRnd2Atteval(data.rnd2atteval);
        } else {
          setRnd2Atteval({
            leader: false,
            member2: false,
            member3: false,
            member4: false
          });
        }
        
        await loadTeamFiles(data.teamId);
      } else {
        setTeamData(null);
        setTeamFiles([]);
        setErrorMessage("Team not found");
      }
    } catch (err) {
      console.error("Failed to load team data", err);
      setErrorMessage("Failed to load team data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeamFiles = async (teamId) => {
    setIsLoadingFiles(true);
    try {
      const res = await fetch(`/api/files?teamId=${teamId}`);
      const data = await res.json();
      if (data.files) {
        setTeamFiles(data.files);
      } else {
        setTeamFiles([]);
      }
    } catch (err) {
      console.error("Failed to load team files", err);
      setTeamFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    

    if (name === 'round2.feedback') {
      setTeamData({
        ...teamData,
        round2: { ...teamData.round2, feedback: value }
      });
    } else if (name === 'problemStatement') {
      setTeamData({ ...teamData, problemStatement: value });
    } else {
      setTeamData({ ...teamData, [name]: value });
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setTeamData({ ...teamData, [name]: checked });
  };

  const validateForm = () => {
    let isValid = true;
    let validationMessage = '';

    if (!teamData.problemStatement?.trim()) {
      isValid = false;
      validationMessage = 'Please enter a problem statement';
    }
    

    if (!rnd2marks || isNaN(Number(rnd2marks))) {
      isValid = false;
      validationMessage = validationMessage || 'Please enter valid marks for Round 2';
    }
    
    const isAnyMemberPresent = rnd2atteval.leader || rnd2atteval.member2 || rnd2atteval.member3 || rnd2atteval.member4;
    if (!isAnyMemberPresent) {
      isValid = false;
      validationMessage = validationMessage || 'Please mark attendance for at least one team member';
    }
    
    if (!teamData.round2?.feedback?.trim()) {
      isValid = false;
      validationMessage = validationMessage || 'Please provide feedback for the team';
    }

    if (!isValid) setErrorMessage(validationMessage);
    return isValid;
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
  
    const evaluationData = {
      ...teamData,
      rnd2atteval,
      rnd2marks: Number(rnd2marks), // Add this line
      round2: {
        marks: Number(rnd2marks), // Keep this too if backend expects nested structure
        feedback: teamData.round2?.feedback || '',
        evaluatedAt: new Date().toISOString()
      }
    };
  
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evaluationData),
      });
  
      const result = await res.json();
      
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage("Round 2 evaluation saved successfully!");
        resetForm();
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMessage("Failed to save evaluation data.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const toggleSubmissionStatus = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    const updatedData = {
      ...teamData,
      submitted: !teamData.submitted
    };
    setTeamData(updatedData);
    
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
  
      const result = await res.json();
      
      if (result.error) {
        setErrorMessage(result.error);
        setTeamData({...teamData});
      } else {
        setSuccessMessage(`Team ${updatedData.submitted ? 'locked' : 'unlocked'} successfully!`);
        setTeamData(result.team || updatedData);
      }
    } catch (err) {
      console.error("Status toggle failed:", err);
      setErrorMessage("Failed to update submission status.");
      setTeamData({...teamData});
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTeamId('');
    setTeamData(null);
    setTeamFiles([]);
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(false);
    setIsSubmitting(false);
    
    setTimeout(() => {
      alert("Evaluation submitted successfully! Please enter the next Team ID.");
    }, 500);
  };

  const hasMemberData = (name, enrollment) => {
    return (name && name.trim() !== '') || (enrollment && enrollment.trim() !== '');
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-10 text-center">AlgoNet Hackathon - Round 2 Evaluator Dashboard</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Team ID <span className="text-red-500">*</span>
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
            

            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-3 text-gray-800">Team Leader</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Leader name
                  </label>
                  <label className="block w-full p-2 border border-gray-300 rounded text-gray-800 bg-white">
                    {teamData.leaderName || ''}
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leader Enrollment ID
                  </label>
                  <label className="block w-full p-2 border border-gray-300 rounded text-gray-800 bg-white">
                    {teamData.leaderEnrollment || ''}
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leader Mobile
                  </label>
                  <label className="block w-full p-2 border border-gray-300 rounded text-gray-800 bg-white">
                    {teamData.leaderMobile || ''}
                  </label>
                </div>
                
                
        
                

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="leaderPresent"
                    name="leaderPresent"
                    checked={rnd2atteval.leader}
                    onChange={e => setRnd2Atteval({ ...rnd2atteval, leader: e.target.checked })}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="leaderPresent" className="ml-2 text-sm font-medium text-gray-700">
                    Present <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Member Sections (2-4) */}
            {hasMemberData(teamData.member2Name, teamData.member2Enrollment) && (
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-3 text-gray-800">Team Member 2</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Name
                    </label>
                    <label className="block w-full p-2 border border-gray-300 rounded text-gray-800 bg-white">
                      {teamData.member2Name || ''}
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Enrollment ID
                    </label>
                    <label className="block w-full p-2 border border-gray-300 rounded text-gray-800 bg-white">
                      {teamData.member2Enrollment || ''}
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="member2Present"
                      name="member2Present"
                      checked={rnd2atteval.member2}
                      onChange={e => setRnd2Atteval({ ...rnd2atteval, member2: e.target.checked })}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded"
                      required={hasMemberData(teamData.member2Name, teamData.member2Enrollment)}
                    />
                    <label htmlFor="member2Present" className="ml-2 text-sm font-medium text-gray-700">
                      Present <span className="text-red-500">*</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {hasMemberData(teamData.member3Name, teamData.member3Enrollment) && (
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-3 text-gray-800">Team Member 3</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Name
                    </label>
                    <label className="block w-full p-2 border border-gray-300 rounded text-gray-800 bg-white">
                      {teamData.member3Name || ''}
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Enrollment ID
                    </label>
                    <label className="block w-full p-2 border border-gray-300 rounded text-gray-800 bg-white">
                      {teamData.member3Enrollment || ''}
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="member3Present"
                      name="member3Present"
                      checked={rnd2atteval.member3}
                      onChange={e => setRnd2Atteval({ ...rnd2atteval, member3: e.target.checked })}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded"
                      required={hasMemberData(teamData.member3Name, teamData.member3Enrollment)}
                    />
                    <label htmlFor="member3Present" className="ml-2 text-sm font-medium text-gray-700">
                      Present <span className="text-red-500">*</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {hasMemberData(teamData.member4Name, teamData.member4Enrollment) && (
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-3 text-gray-800">Team Member 4</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Name
                    </label>
                    <label className="block w-full p-2 border border-gray-300 rounded text-gray-800 bg-white">
                      {teamData.member4Name || ''}
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Enrollment ID
                    </label>
                    <label className="block w-full p-2 border border-gray-300 rounded text-gray-800 bg-white">
                      {teamData.member4Enrollment || ''}
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="member4Present"
                      name="member4Present"
                      checked={rnd2atteval.member4}
                      onChange={e => setRnd2Atteval({ ...rnd2atteval, member4: e.target.checked })}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded"
                      required={hasMemberData(teamData.member4Name, teamData.member4Enrollment)}
                    />
                    <label htmlFor="member4Present" className="ml-2 text-sm font-medium text-gray-700">
                      Present <span className="text-red-500">*</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Problem Statement */}
           
            

            
            

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Problem Statement <span className="text-red-500">*</span>
              </label>
              <select
                name="problemStatement"
                value={teamData?.problemStatement || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a problem statement</option>
                {problems.map((problem) => (
                  <option key={problem._id} value={problem.title}>
                    {problem.title} - {problem.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Round 1 Evaluation Summary */}
            {teamData.round1 && teamData.round1.marks !== undefined && (
              <div className="mb-6 p-4 bg-yellow-50 rounded border border-yellow-200">
                <h3 className="font-medium mb-3 text-gray-800">Round 1 Evaluation Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Round 1 Marks
                    </label>
                    <p className="text-gray-800 font-semibold">{teamData.rnd1marks}/20</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Round 1 Feedback
                    </label>
                    <p className="text-gray-700">{teamData.round1.feedback || 'No feedback provided'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Round 2 Evaluation Section */}
            <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
              <h3 className="font-medium mb-3 text-gray-800">Round 2 Evaluator Attendance</h3>
              

              <div className="mb-4 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Round 2 Evaluator Marks (0-80)
                </label>
                <input
                  type="number"
                  min="0"
                  max="80"
                  value={rnd2marks}
                  onChange={e => {
                    const value = Math.min(80, Math.max(0, e.target.valueAsNumber || 0));
                    setRnd2Marks(value.toString());
                  }}
                  className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter marks (0-80)"
                  required
                />
              </div>
              
              {/* File preview section */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Submission Files
                </label>
                <div className="p-3 bg-gray-100 rounded border border-gray-300">
                  {isLoadingFiles ? (
                    <div className="flex justify-center items-center p-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  ) : teamFiles.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {teamFiles.length} file(s) uploaded
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {teamFiles.map((file, index) => (
                          <li key={index} className="flex justify-between items-center p-2 bg-white rounded border border-gray-300">
                            <span className="text-sm text-gray-700 truncate max-w-xs">
                              {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                            </span>
                            <div className="flex gap-2">
                              <a 
                                href={`/api/files/download?teamId=${teamData.teamId}&filename=${encodeURIComponent(file.name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                View
                              </a>
                              <a 
                                href={`/api/files/download?teamId=${teamData.teamId}&filename=${encodeURIComponent(file.name)}&download=true`}
                                className="text-green-600 hover:text-green-800 text-sm"
                              >
                                Download
                              </a>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No files uploaded by this team</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Round 2 Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="round2.feedback"
                  value={teamData.round2?.feedback || ''}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide feedback for the team's round 2 performance..."
                  required
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
                  "Save Round 2 Evaluation"
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
      
      <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-gray-700 text-sm">
        <p><span className="text-red-500">*</span> All fields marked with an asterisk are required</p>
      </div>
    </div>
  );
}