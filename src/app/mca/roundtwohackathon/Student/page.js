'use client';
import { useState, useEffect } from 'react';

export default function RoundTwoHackathon() {
  const [teamId, setTeamId] = useState('');
  const [teamData, setTeamData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [leaderPresent2, setLeaderPresent2] = useState(false);
  const [member2Present2, setMember2Present2] = useState(false);
  const [member3Present2, setMember3Present2] = useState(false);
  const [member4Present2, setMember4Present2] = useState(false);
  const [problems, setProblems] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);

  const loadTeamData = async () => {
    if (!teamId.trim()) {
      setErrorMessage("Please enter a Team ID");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const res = await fetch(`/mca/api/team?teamId=${teamId}`); // changed
      const data = await res.json();
      
      if (data && data.teamId) {
        setTeamData(data);
        // Set round 2 attendance checkboxes if available
        if (data.rnd2attstud) {
          setLeaderPresent2(data.rnd2attstud.leader || false);
          setMember2Present2(data.rnd2attstud.member2 || false);
          setMember3Present2(data.rnd2attstud.member3 || false);
          setMember4Present2(data.rnd2attstud.member4 || false);
        } else {
          setLeaderPresent2(false);
          setMember2Present2(false);
          setMember3Present2(false);
          setMember4Present2(false);
        }
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

  const hasMemberData = (name, enrollment) => {
    return (name && name.trim() !== '') || (enrollment && enrollment.trim() !== '');
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length === 0) return;
    
    // Check if adding these files would exceed the limit
    if (uploadFiles.length + selectedFiles.length > 5) {
      setErrorMessage("You can only upload a maximum of 5 files");
      return;
    }
    
    // Check each file size
    const oversizedFiles = selectedFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setErrorMessage(`${oversizedFiles.length} file(s) exceed the 10MB size limit`);
      return;
    }
    
    setUploadFiles([...uploadFiles, ...selectedFiles]);
    setErrorMessage('');
  };

  const removeFile = (index) => {
    const newFiles = [...uploadFiles];
    newFiles.splice(index, 1);
    setUploadFiles(newFiles);
  };

  const handleFileUpload = async () => {
    if (uploadFiles.length === 0 || !teamData?.teamId) {
      setErrorMessage("Please select files and ensure team data is loaded");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage('');
    setSuccessMessage('');

    const formData = new FormData();
    uploadFiles.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });
    formData.append('teamId', teamData.teamId);
    formData.append('teamName', teamData.teamName || teamData.leaderName);
    formData.append('fileCount', uploadFiles.length);

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          setIsUploading(false);
          
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            setSuccessMessage("Files uploaded successfully!");
            
            // Don't reset files yet to allow submitting the form with these files
          } else {
            setErrorMessage("Failed to upload files");
          }
        }
      };

      xhr.open('POST', '/mca/api/upload', true);
      xhr.send(formData);
    } catch (err) {
      console.error("Upload failed:", err);
      setErrorMessage("Failed to upload files");
      setIsUploading(false);
    }
  };

  // Load problems from API on mount
  useEffect(() => {
    const loadProblems = async () => {
      try {
        const res = await fetch('/mca/api/problems');
        const data = await res.json();
        setProblems(data.problemStatements || []);
      } catch (err) {
        // handle error if needed
      }
    };
    loadProblems();
  }, []);
  
  // Populate selectedProblems from teamData when teamData or problems change
  useEffect(() => {
    if (teamData && problems.length > 0) {
      const selected = [];
      for (let i = 1; i <= 12; i++) {
        const key = `prblm${i}`;
        if (teamData[key]) {
          selected.push({ key, text: teamData[key] });
        }
      }
      setSelectedProblems(selected);
    }
  }, [teamData, problems]);

  const handleSubmitForm = async () => {
    if (!teamData?.teamId) {
      setErrorMessage("Please load team data first");
      return;
    }
    if (selectedProblems.length < 3) {
      setErrorMessage("Please select at least 3 problems");
      return;
    }
  
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
  
    try {
      const rnd2attstud = {
        leader: leaderPresent2,
        member2: member2Present2,
        member3: member3Present2,
        member4: member4Present2,
        markedBy: teamData.leaderName || teamData.teamName || "Unknown"
      };
      const uploadedFiles = uploadFiles.map(file => file.name);
  
      const res = await fetch('/mca/api/submit-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: teamData.teamId,
          uploadedFiles,
          rnd2attstud,
          selectedProblems // <-- send selected problems
        })
      });
  
      const result = await res.json();
  
      if (result.success) {
        setSuccessMessage("Project submitted and attendance marked!");
        // Refresh the page after successful submission
        alert("Your project has been submitted successfully! please proceed to your room for evaluation");
        window.location.reload();
      } else {
        setErrorMessage(result.error || "Submission failed");
      }
    } catch (err) {
      setErrorMessage("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update handleSubmit to include round 2 attendance
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);
  
    try {
      const res = await fetch('/mca/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: teamData.teamId,
          uploadedFiles: uploadFiles.map(file => file.name),
          rnd2attstud: {
            leader: leaderPresent2,
            member2: member2Present2,
            member3: member3Present2,
            member4: member4Present2
          },
          selectedProblems // <-- send selected problems
        }),
      });
  
      const result = await res.json();
      
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        // Display success message
        alert("Your project has been submitted successfully! please proceed to your room for evaluation");
        
        // Reset the form
        setUploadFiles([]);
        setTeamId('');
        setTeamData(null);
        setSuccessMessage('');
        
        // Reset file input
        document.getElementById('file-upload').value = '';
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMessage("Failed to submit project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-10 text-center">AlgoNet Hackathon - MCA Round Two Dashboard</h1>
      
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
          <>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Team Information</h2>
              <div className="flex items-center">
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Ready for Submission
                </span>
              </div>
            </div>
            
            {/* Team Leader Section - Always shown as team leader is required */}
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-3 text-gray-800">Team Leader</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="leaderPresent2"
                    checked={leaderPresent2}
                    onChange={(e) => setLeaderPresent2(e.target.checked)}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded mr-2"
                  />
                  <label htmlFor="leaderPresent2" className="text-sm font-medium text-gray-700">
                    Present (Round 2)
                  </label>
                </div>
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
              </div>
            </div>

            {/* Member 2 Section - Conditionally rendered */}
            {hasMemberData(teamData.member2Name, teamData.member2Enrollment) && (
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-3 text-gray-800">Team Member 2</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="member2Present2"
                      checked={member2Present2}
                      onChange={(e) => setMember2Present2(e.target.checked)}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded mr-2"
                      
                    />
                    <label htmlFor="member2Present2" className="text-sm font-medium text-gray-700">
                      Present (Round 2)
                    </label>
                  </div>
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
                </div>
              </div>
            )}

            {/* Member 3 Section - Conditionally rendered */}
            {hasMemberData(teamData.member3Name, teamData.member3Enrollment) && (
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-3 text-gray-800">Team Member 3</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="member3Present2"
                      checked={member3Present2}
                      onChange={(e) => setMember3Present2(e.target.checked)}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded mr-2"
                    />
                    <label htmlFor="member3Present2" className="text-sm font-medium text-gray-700">
                      Present (Round 2)
                    </label>
                  </div>
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
                </div>
              </div>
            )}

            {/* Member 4 Section - Conditionally rendered */}
            {hasMemberData(teamData.member4Name, teamData.member4Enrollment) && (
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-3 text-gray-800">Team Member 4</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="member4Present2"
                      checked={member4Present2}
                      onChange={(e) => setMember4Present2(e.target.checked)}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded mr-2"
                    />
                    <label htmlFor="member4Present2" className="text-sm font-medium text-gray-700">
                      Present (Round 2)
                    </label>
                  </div>
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
                </div>
              </div>
            )}

            {/* Problem Selection Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-3 text-gray-800">Select Problems (min 3)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {problems.map((problem, idx) => (
                  <label key={problem.key || idx} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={!!selectedProblems.find(p => p.key === problem.key)}
                      // REMOVE disabled={teamData.submitted}
                      onChange={() => {
                        if (teamData.submitted) return;
                        setSelectedProblems(prev => {
                          if (prev.find(p => p.key === problem.key)) {
                            return prev.filter(p => p.key !== problem.key);
                          } else {
                            return [...prev, { key: problem.key, text: problem.text }];
                          }
                        });
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-black">{problem.text}</span>
                  </label>
                ))}
              </div>
              {selectedProblems.length > 0 && (
                <div className="mt-3 text-sm text-blue-600">
                  Selected ({selectedProblems.length}): {selectedProblems.length <= 3 ?
                    selectedProblems.map(p => p.text).join(', ') :
                    `${selectedProblems.length} problems selected`
                  }
                </div>
              )}
              {selectedProblems.length < 3 && (
                <div className="mt-1 text-sm text-amber-600">
                  Please select at least 3 problems
                </div>
              )}
            </div>

            {/* Multiple File Upload Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
              <h3 className="font-medium mb-3 text-gray-800">Project Submission</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Project Files (Max 5 files, 10MB each)
                </label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isUploading || uploadFiles.length >= 5}
                  multiple
                />
                <p className="text-xs text-gray-500 mt-1">
                  Files will be saved in a folder with your team name
                </p>
              </div>
              
              {/* Selected Files List */}
              {uploadFiles.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files ({uploadFiles.length}/5):</h4>
                  <ul className="space-y-2">
                    {uploadFiles.map((file, index) => (
                      <li key={index} className="flex justify-between items-center p-2 bg-white rounded border border-gray-300">
                        <span className="text-sm text-gray-700 truncate max-w-xs">
                          {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                          disabled={isUploading}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                  <p className="text-sm text-center mt-1">{uploadProgress}%</p>
                </div>
              )}
              
              {/* Separate Upload and Submit Buttons */}
              <div className="flex flex-wrap gap-4 mt-4">
                <button
                  type="button"
                  onClick={handleFileUpload}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                  disabled={isUploading || uploadFiles.length === 0}
                >
                  {isUploading ? "Uploading..." : "Upload Files"}
                </button>
                
                <button
                  type="button"
                  onClick={handleSubmitForm}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:bg-green-300"
                  disabled={isSubmitting || uploadFiles.length === 0 || !successMessage}
                >
                  {isSubmitting ? "Submitting..." : "Submit Project"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

}

