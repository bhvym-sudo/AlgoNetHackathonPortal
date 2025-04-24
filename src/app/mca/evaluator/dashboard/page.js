'use client';
import { useState, useEffect } from 'react';

export default function EvaluatorDashboard() {
  const [teamId, setTeamId] = useState('');
  const [teamData, setTeamData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [problems, setProblems] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [problemsInitialized, setProblemsInitialized] = useState(false);

  // Load problems on mount
  useEffect(() => {
    const loadProblems = async () => {
      try {
        const res = await fetch('/mca/api/problems');
        const data = await res.json();
        setProblems(data.problemStatements || []);
      } catch (err) {
        console.error('Error loading problems:', err);
      }
    };
    loadProblems();
  }, []);

  // 1. When teamData or problems change, initialize selectedProblems from prblm1, prblm2, ... ONLY ONCE per team load
  useEffect(() => {
    if (teamData && problems.length > 0 && !problemsInitialized) {
      // Collect all prblm1...prblm12 values that are non-empty
      const selected = [];
      for (let i = 1; i <= 12; i++) {
        const key = `prblm${i}`;
        if (teamData[key]) {
          selected.push(teamData[key]);
        }
      }
      setSelectedProblems(selected); // selectedProblems is an array of problem texts
      setProblemsInitialized(true);
    }
  }, [teamData, problems, problemsInitialized]);

  const loadTeamData = async () => {
    if (!teamId.trim()) {
      setErrorMessage("Please enter a Team ID");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const res = await fetch(`/mca/api/team?teamId=${teamId}`);
      const data = await res.json();
      
      if (data && data.teamId) {
        // Initialize round1 data if not present
        if (!data.round1) {
          data.round1 = { marks: '', feedback: '' };
        }
        
        // Set attendance checkboxes from rnd1atteval if available
        if (data.rnd1atteval) {
          data.leaderPresent = data.rnd1atteval.leader;
          data.member2Present = data.rnd1atteval.member2;
          data.member3Present = data.rnd1atteval.member3;
          data.member4Present = data.rnd1atteval.member4;
        } else {
          // Initialize attendance checkboxes if not available
          data.leaderPresent = false;
          data.member2Present = false;
          data.member3Present = false;
          data.member4Present = false;
        }
        
        setTeamData(data);
        setProblemsInitialized(false); // <-- ADD THIS LINE to reset when loading a new team
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
      // Ensure marks are between 0 and 20
      const marks = parseInt(value);
      if (isNaN(marks)) {
        setTeamData({
          ...teamData,
          round1: {
            ...teamData.round1,
            marks: ''
          }
        });
      } else {
        const validMarks = Math.min(20, Math.max(0, marks));
        setTeamData({
          ...teamData,
          round1: {
            ...teamData.round1,
            marks: validMarks
          }
        });
      }
    } else if (name === 'feedback') {
      setTeamData({
        ...teamData,
        round1: {
          ...teamData.round1,
          feedback: value
        }
      });
    } else {
      setTeamData({ ...teamData, [name]: value });
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setTeamData({ ...teamData, [name]: checked });
  };

  const handleProblemCheckbox = (key, text) => {
    setSelectedProblems(prev => {
      if (prev.find(p => p.key === key)) {
        return prev.filter(p => p.key !== key);
      } else {
        return [...prev, { key, text }];
      }
    });
  };

  const toggleSubmissionStatus = async () => {
    if (!teamData) return;
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/mca/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...teamData,
          submitted: !teamData.submitted,
        }),
      });
      
      const data = await res.json();
      
      if (data.error) {
        setErrorMessage(data.error);
      } else {
        setSuccessMessage(`Team submission status ${teamData.submitted ? 'unlocked' : 'locked'} successfully`);
        setTeamData(data.team);
      }
    } catch (err) {
      console.error("Failed to update submission status", err);
      setErrorMessage("Failed to update submission status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!teamData) return;

    // Validate at least 3 problems selected
    if (selectedProblems.length < 1) {
      setErrorMessage("Please select at least 1 problems.");
      return;
    }
    
    // Validate required fields
    
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // --- Map selected problems to their original prblmX fields ---
      const problemsForBackend = {};
      // First, clear all prblm1...prblm12
      for (let i = 1; i <= 12; i++) {
        problemsForBackend[`prblm${i}`] = '';
      }
      // Now, for each selected problem, find its index in the problems array and set the correct prblmX
      selectedProblems.forEach(selectedText => {
        const idx = problems.findIndex(p => p.text === selectedText);
        if (idx !== -1) {
          problemsForBackend[`prblm${idx + 1}`] = selectedText;
        }
      });
      // --- End mapping block ---

      // Save attendance, marks, and problems in one request
      const attendanceRes = await fetch('/mca/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: teamData.teamId,
          leaderName: teamData.leaderName,
          leaderEnrollment: teamData.leaderEnrollment,
          leaderMobile: teamData.leaderMobile,
          
          member2Name: teamData.member2Name,
          member2Enrollment: teamData.member2Enrollment,
          
          member3Name: teamData.member3Name,
          member3Enrollment: teamData.member3Enrollment,
          
          member4Name: teamData.member4Name,
          member4Enrollment: teamData.member4Enrollment,
          
          problemStatement: teamData.problemStatement,
          submitted: teamData.submitted,
          
          // Attendance by evaluator (send as top-level fields)
          leaderPresent: teamData.leaderPresent || false,
          member2Present: teamData.member2Present || false,
          member3Present: teamData.member3Present || false,
          member4Present: teamData.member4Present || false,
          
          // Save marks in rnd1marks (top-level)
          rnd1marks: Number(teamData.round1.marks),
          isEvaluator: true, // Flag to identify this is from evaluator
          evaluatorName: "Evaluator",
          ...problemsForBackend // <-- Always send all prblm fields
        }),
      });

      const attendanceData = await attendanceRes.json();
      
      if (attendanceData.error) {
        setErrorMessage(attendanceData.error);
        setIsSubmitting(false);
        return;
      }
      
      // Then submit the evaluation
      const evalRes = await fetch('/mca/api/evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: teamData.teamId,
          marks: teamData.round1.marks,
          feedback: teamData.round1.feedback,
          ...problemsForBackend // <-- Always send all prblm fields
        }),
      });

      const evalData = await evalRes.json();
      
      if (evalData.error) {
        setErrorMessage(evalData.error);
      } else {
        setSuccessMessage("Attendance, problems, and evaluation submitted successfully");
        // Refresh the whole website after submitting
        alert("Evaluation submitted successfully. Refreshing the page...");
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to submit evaluation and attendance", err);
      setErrorMessage("Failed to submit evaluation and attendance");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-10 text-center text-blue-500">AlgoNet Hackathon - MCA round 1 Evaluator Dashboard</h1>
      
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
          {successMessage && <p className="text-green-500 mt-1">{successMessage}</p>}
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
            
            {/* Display previous attendance if available */}
            {teamData.rnd1atteval && teamData.rnd1atteval.markedBy && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-700">
                  Attendance previously marked by: <strong>{teamData.rnd1atteval.markedBy}</strong>
                  {teamData.rnd1atteval.markedAt && (
                    <span> on {new Date(teamData.rnd1atteval.markedAt).toLocaleString()}</span>
                  )}
                </p>
              </div>
            )}
            
            {/* Team Leader Section - Always shown as team leader is required */}
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-3 text-gray-800">Team Leader</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Leader name
                  </label>
                  <label className="block w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {teamData.leaderName || ''}
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leader Enrollment ID
                  </label>
                  <label className="block w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    {teamData.leaderEnrollment || ''}
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leader Mobile
                  </label>
                  <label className="block w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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

            {/* Member 2 Section */}
            {teamData.member2Name && (
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-3 text-gray-800">Team Member 2</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Name
                    </label>
                    <label className="block w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {teamData.member2Name || ''}
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enrollment ID
                    </label>
                    <label className="block w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
            {/* Member 3 Section */}
            {teamData.member3Name && (
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-3 text-gray-800">Team Member 3</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Name
                    </label>
                    <label className="block w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {teamData.member3Name || ''}
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enrollment ID
                    </label>
                    <label className="block w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
            {/* Member 4 Section */}
            {teamData.member4Name && (
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-3 text-gray-800">Team Member 4</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Name
                    </label>
                    <label className="block w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {teamData.member4Name || ''}
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enrollment ID
                    </label>
                    <label className="block w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
            
            {/* Problem Selection Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-3 text-gray-800">Select Problems (min 1)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {problems.map((problem, idx) => {
                  // Check if this problem's text is in selectedProblems
                  const isChecked = selectedProblems.includes(problem.text);
                  return (
                    <label key={problem.key ?? problem.text ?? idx} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedProblems(prev => {
                            if (prev.includes(problem.text)) {
                              return prev.filter(text => text !== problem.text);
                            } else {
                              return [...prev, problem.text];
                            }
                          });
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-black">{problem.text}</span>
                    </label>
                  );
                })}
              </div>
              {(selectedProblems || []).length > 0 && (
                <div className="mt-3 text-sm text-blue-600">
                  Selected ({selectedProblems.length}): {selectedProblems.length <= 3 ?
                    selectedProblems.join(', ') :
                    `${selectedProblems.length} problems selected`
                  }
                </div>
              )}
              {(selectedProblems || []).length < 1 && (
                <div className="mt-1 text-sm text-amber-600">
                  Please select at least 1 problems
                </div>
              )}
            </div>

            

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Attendance & Evaluation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );}

  