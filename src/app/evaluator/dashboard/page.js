'use client';
import { useState } from 'react';



export default function EvaluatorPortal() {
  
  const [teamId, setTeamId] = useState('');
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState({ name: '', email: '' });
  const [problemStatement, setProblemStatement] = useState('');
  const [problemStatements, setProblemStatements] = useState([]);
  const [teamLoaded, setTeamLoaded] = useState(false);
  const [submittedTeam, setSubmittedTeam] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  
  const [marks, setMarks] = useState(0);
  const [feedback, setFeedback] = useState('');

  

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
    
    try {
      const res = await fetch(`/api/team?teamId=${teamId}`);
      const data = await res.json();
      
      setErrorMessage('');
      
      if (data && data.teamId) {
        setMembers(data.members || []);
        setProblemStatement(data.problemStatement || '');
        setSubmittedTeam(data.submitted || false);
        setTeamLoaded(true);
        
        
        setMarks(0);
        setFeedback('');
        
        loadProblemStatements();
      } else {
        setErrorMessage("Team not found");
        setTeamLoaded(false);
      }
    } catch (err) {
      console.error("Failed to load team data", err);
      setErrorMessage("Failed to load team data");
    } finally {
      setIsLoading(false);
    }
  };

  const revertLock = async () => {
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId,
          members,
          problemStatement,
          submitted: false
        }),
      });
  
      const result = await res.json();
      if (result.message) {
        alert("Team lock reverted successfully!");
        setSubmittedTeam(false);
      }
    } catch (err) {
      console.error("Failed to revert lock:", err);
      alert("Failed to revert team lock.");
    }
  };

  const submitEvaluation = async () => {
    const evaluationData = {
      teamId,
      marks,
      feedback,
      evaluatedAt: new Date().toISOString()
    };
    
    try {
      
      const res = await fetch('/api/evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evaluationData),
      });
      
      
      alert("Evaluation submitted successfully!");
      
      
      setTeamId('');
      setMembers([]);
      setNewMember({ name: '', email: '' });
      setProblemStatement('');
      setTeamLoaded(false);
      setProblemStatements([]);
      setMarks(0);
      setFeedback('');
      
    } catch (err) {
      console.error("Evaluation submission failed:", err);
      alert("Failed to submit evaluation.");
    }
  };

  const addMember = () => {
    if (newMember.name && newMember.email) {
      setMembers([...members, { ...newMember, present: false }]);
      setNewMember({ name: '', email: '' });
    }
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };
  
  const hasMaxMembers = members.length >= 4;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-10 text-center text-white-800">AlgoNet Hackathon - Evaluators Portal</h1>
      
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
        <button
              onClick={async () => {
                await fetch('/api/evaluator/logout', {
                  method: 'POST',
                  credentials: 'include',
                });
                window.location.href = '/evaluator';
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Logout
            </button>

        {teamLoaded && (
          <>
            {submittedTeam && (
              <div className="mb-4 flex justify-end">
                <button
                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
                  onClick={revertLock}
                >
                  Revert Lock
                </button>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Problem Statement
              </label>
              <select
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
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

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-800">Team Members</h2>
              
              {members.length > 0 ? (
                <div className="space-y-2">
                  {members.map((member, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={member.present}
                        onChange={() => {
                          const updated = [...members];
                          updated[index].present = !updated[index].present;
                          setMembers(updated);
                        }}
                        className="h-4 w-4 mr-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMember(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No team members found</p>
              )}

              {!hasMaxMembers && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <h3 className="font-medium mb-2 text-gray-800">Add New Member</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      value={newMember.name}
                      onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                      placeholder="Full Name"
                      className="p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                      placeholder="Email Address"
                      className="p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addMember}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors disabled:bg-green-300"
                    disabled={!newMember.name || !newMember.email}
                  >
                    Add Member
                  </button>
                </div>
              )}
              
              {hasMaxMembers && (
                <div className="mt-4 p-3 bg-blue-50 rounded text-blue-800 border border-blue-200">
                  <p className="font-medium">Maximum team size reached (4 members)</p>
                  <p className="text-sm">Remove a member if you need to make changes.</p>
                </div>
              )}
            </div>
            
            {/* Simplified Evaluation Section */}
            <div className="mt-8 mb-6 border-t pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Team Evaluation</h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Marks (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={marks}
                  onChange={(e) => setMarks(parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                  <div 
                    className="bg-blue-600 h-4 rounded-full" 
                    style={{ width: `${marks}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Feedback & Comments
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  placeholder="Provide feedback for the team..."
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={submitEvaluation}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit Evaluation
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setTeamId('');
                  setMembers([]);
                  setNewMember({ name: '', email: '' });
                  setProblemStatement('');
                  setTeamLoaded(false);
                  setProblemStatements([]);
                  setErrorMessage('');
                  setMarks(0);
                  setFeedback('');
                }}
                className="bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              
            </div>
          </>
        )}
      </div>
    </div>
  );
}