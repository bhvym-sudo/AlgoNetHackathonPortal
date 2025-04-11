'use client';

import { useState } from 'react';

export default function StudentPortal() {
  // State for team data and UI control
  const [teamId, setTeamId] = useState('');
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState({ name: '', email: '' });
  const [problemStatement, setProblemStatement] = useState('');
  const [problemStatements, setProblemStatements] = useState([]);
  const [teamLoaded, setTeamLoaded] = useState(false);
  const [submittedTeam, setSubmittedTeam] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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
    
    try {
      const res = await fetch(`/api/team?teamId=${teamId}`);
      const data = await res.json();
      
      setErrorMessage('');
      
      if (data.submitted) {
        setSubmittedTeam(true);
        return;
      }
  
      if (data && data.members) {
        setMembers(data.members);
        setProblemStatement(data.problemStatement || '');
        setTeamLoaded(true);
        

        loadProblemStatements();
      } else {
        setMembers([]);
        setProblemStatement('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const teamData = {
      teamId,
      members,
      problemStatement,
      submitted: true
    };
  
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });
  
      const result = await res.json();
      alert(result.message || "Submitted successfully!");
      

      setTeamId('');
      setMembers([]);
      setNewMember({ name: '', email: '' });
      setProblemStatement('');
      setTeamLoaded(false);
      setProblemStatements([]);
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Failed to submit team data.");
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
  

  const hasPresentMembers = members.some(member => member.present);

  const hasMaxMembers = members.length >= 4;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-10 text-center text-white-800">AlgoNet Hackathon - Student Portal</h1>
      
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
              placeholder="Enter your Team ID"
              required
              disabled={teamLoaded || isLoading}
            />
            <button
              type="button"
              onClick={loadTeamData}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
              disabled={teamLoaded || isLoading}
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

        {submittedTeam && (
          <div className="p-4 mb-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
            <p className="font-medium">This team has already submitted their registration.</p>
            <p>Please contact an administrator if you need to make changes.</p>
            <button
              className="mt-3 bg-blue-600 text-white px-3 py-1 rounded text-sm"
              onClick={() => {
                setTeamId('');
                setSubmittedTeam(false);
                setTeamLoaded(false);
              }}
            >
              Enter Different Team ID
            </button>
          </div>
        )}

        {teamLoaded && !submittedTeam && (
          <>

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

            <div className="flex gap-3">
              <button
                type="submit"
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                disabled={!teamId || members.length === 0 || !problemStatement || !hasPresentMembers}
              >
                Submit Team Registration
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
                }}
                className="bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
            
            {members.length > 0 && !hasPresentMembers && (
              <p className="mt-2 text-red-500 text-sm">
                At least one team member must be marked as present to submit.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}